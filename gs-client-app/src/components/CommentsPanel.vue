<template>
    <q-card flat bordered class="q-mt-lg">
        <q-card-section class="row items-center justify-between">
            <div class="text-h6">댓글</div>
            <div>
                <q-btn dense outline icon="refresh" label="새로고침" @click="reload" :loading="loading" />
            </div>
        </q-card-section>

        <q-separator />

        <!-- 작성/수정 폼 -->
        <!-- admin 모드에서는 수정 중일 때만 폼 노출 -->
        <q-card-section v-if="!admin || editId">
            <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input v-model="form.content" type="textarea" autogrow label="내용" :counter="500" maxlength="500"
                    outlined dense required />
                <div class="row items-center q-gutter-sm">
                    <span class="text-caption">평점</span>
                    <q-rating v-model="form.rating" max="5" size="20px" />
                    <q-space />
                    <q-input v-model="form.displayName" label="표시 이름(선택)" dense outlined style="max-width: 220px;" />
                </div>

                <div class="row q-gutter-sm">
                    <q-btn type="submit" color="primary" :label="editId ? '댓글 수정' : '댓글 등록'" :loading="submitting" />
                    <q-btn v-if="editId" flat color="grey-8" label="취소" @click="resetForm" />
                </div>
            </q-form>
        </q-card-section>

        <q-separator />

        <!-- 목록 -->
        <q-card-section>
            <q-list separator>
                <q-item v-for="c in comments" :key="c.id" class="q-py-md">
                    <q-item-section>
                        <div class="row items-center q-gutter-xs">
                            <div class="text-body1">{{ c.displayName || '익명' }}</div>
                            <q-rating v-model="tmpRatings[c.id]" max="5" size="16px" readonly class="q-ml-sm" />
                            <q-space />
                            <div class="text-caption text-grey">{{ formatDate(c.createdAt) }}</div>
                        </div>
                        <div class="q-mt-xs">{{ c.content }}</div>
                    </q-item-section>

                    <!-- 관리자 모드에서만 수정/삭제 버튼 노출 -->
                    <q-item-section v-if="admin" side top>
                        <div class="column items-end q-gutter-xs">
                            <q-btn dense flat icon="edit" @click="beginEdit(c)" />
                            <q-btn dense flat icon="delete" color="negative" @click="remove(c.id)"
                                :loading="deletingId === c.id" />
                        </div>
                    </q-item-section>
                </q-item>

                <q-item v-if="!loading && comments.length === 0">
                    <q-item-section>첫 댓글을 남겨보세요.</q-item-section>
                </q-item>
            </q-list>

            <div class="row justify-center q-mt-md">
                <q-pagination v-model="page" :max="maxPage" :max-pages="7" boundary-numbers
                    @update:model-value="reload" />
            </div>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { computed, reactive, ref, watchEffect } from 'vue';
import { useQuasar } from 'quasar';
import {
    createComment,
    updateComment,
    deleteComment,
    getRestaurantComments,
} from '@/api/restaurantApi';

const props = defineProps({
    restaurantId: { type: [Number, String], required: true },
    admin: { type: Boolean, default: false },
});

const $q = useQuasar();

const loading = ref(false);
const submitting = ref(false);
const deletingId = ref(null);

// 목록/페이지네이션 상태
const page = ref(1); // q-pagination는 1-base
const size = ref(10);
const sort = ref('createdAt,desc');
const comments = ref([]);
const totalElements = ref(null); // 백엔드가 total을 안 주면 null 유지
const pageHasMore = ref(false);

const maxPage = computed(() => {
    if (typeof totalElements.value === 'number') {
        return Math.max(1, Math.ceil(totalElements.value / size.value));
    }
    // total이 없을 때는 "다음 페이지 데이터 유무"로 한 페이지 더 허용
    return pageHasMore.value ? page.value + 1 : page.value;
});

// 임시 표시용 평점(읽기 전용)
const tmpRatings = reactive({});

// 폼 상태
const editId = ref(null);
const form = reactive({
    content: '',
    rating: 0,
    displayName: '',
});

function resetForm() {
    editId.value = null;
    form.content = '';
    form.rating = 0;
    form.displayName = '';
}

function formatDate(iso) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

async function reload() {
    loading.value = true;
    try {
        // 백엔드가 Page를 반환하지 않는 경우를 고려: 배열만 와도 처리
        const res = await getRestaurantComments(props.restaurantId, {
            page: page.value - 1,
            size: size.value,
            sort: sort.value,
        });

        const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
        comments.value = list;

        // 페이지 정보 추론
        totalElements.value = typeof res?.totalElements === 'number' ? res.totalElements : null;
        const hasNext = typeof res?.last === 'boolean' ? !res.last : (list.length === size.value);
        pageHasMore.value = hasNext;

        Object.keys(tmpRatings).forEach(k => delete tmpRatings[k]);
        list.forEach(c => {
            tmpRatings[c.id] = Number(c.rating || 0);
        });
    } catch (e) {
        console.error(e);
        $q.notify({ type: 'negative', message: e.message || '댓글을 불러오지 못했습니다.' });
    } finally {
        loading.value = false;
    }
}

async function onSubmit() {
    if (!form.content?.trim()) {
        $q.notify({ type: 'warning', message: '내용을 입력하세요.' });
        return;
    }
    submitting.value = true;
    try {
        if (editId.value) {
            await updateComment(editId.value, {
                content: form.content.trim(),
                rating: form.rating || 0,
                displayName: form.displayName?.trim() || undefined,
            });
            $q.notify({ type: 'positive', message: '댓글이 수정되었습니다.' });
        } else {
            if (props.admin) {
                submitting.value = false;
                return;
            }
            await createComment({
                restaurantId: props.restaurantId,
                content: form.content.trim(),
                rating: form.rating || 0,
                displayName: form.displayName?.trim() || undefined,
            });
            $q.notify({ type: 'positive', message: '댓글이 등록되었습니다.' });
        }
        resetForm();
        await reload();
    } catch (e) {
        console.error(e);
        $q.notify({ type: 'negative', message: e.message || '처리에 실패했습니다.' });
    } finally {
        submitting.value = false;
    }
}

function beginEdit(c) {
    if (!props.admin) return;
    editId.value = c.id;
    form.content = c.content || '';
    form.rating = Number(c.rating || 0);
    form.displayName = c.displayName || '';
}

async function remove(id) {
    if (!props.admin) return;
    deletingId.value = id;
    try {
        await deleteComment(id);
        $q.notify({ type: 'positive', message: '삭제되었습니다.' });
        if (comments.value.length === 1 && page.value > 1) {
            page.value = page.value - 1;
        }
        await reload();
    } catch (e) {
        console.error(e);
        $q.notify({ type: 'negative', message: e.message || '삭제에 실패했습니다.' });
    } finally {
        deletingId.value = null;
    }
}

watchEffect(() => {
    resetForm();
    page.value = 1;
    if (props.restaurantId) reload();
});
</script>
