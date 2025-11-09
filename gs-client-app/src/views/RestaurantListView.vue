<template>
    <q-page class="q-pa-md">
        <q-card>
            <q-card-section class="row items-center q-gutter-sm">
                <div class="text-h5 text-primary">맛집 목록</div>
                <q-space />
                <q-btn color="primary" label="새 맛집 추가" @click="openCreate()" />
            </q-card-section>

            <q-separator />

            <q-card-section>
                <div class="row items-center q-gutter-sm q-mb-sm">
                    <q-input dense outlined v-model="search" placeholder="이름/주소/카테고리 검색" clearable
                        class="col-12 col-md-4" />
                    <q-space />
                    <q-btn flat icon="refresh" label="새로고침" @click="load()" />
                </div>

                <q-inner-loading :showing="loading">
                    <q-spinner size="50px" />
                </q-inner-loading>

                <q-list bordered separator v-if="!loading && filtered.length">
                    <q-item v-for="r in filtered" :key="r.id" clickable @click="goDetail(r.id)">
                        <q-item-section>
                            <q-item-label class="text-weight-medium">{{ r.restaurantName }}</q-item-label>
                            <q-item-label caption>{{ r.category }} · {{ r.address }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn dense flat icon="edit" @click.stop="openEdit(r)" />
                            <q-btn dense flat icon="delete" color="negative" @click.stop="confirmDelete(r)" />
                        </q-item-section>
                    </q-item>
                </q-list>

                <div v-else-if="!loading" class="text-grey q-mt-md">표시할 데이터가 없습니다.</div>
            </q-card-section>
        </q-card>

        <!-- 생성/수정 다이얼로그 (최소 필드만, 나머진 빈값으로 전송) -->
        <q-dialog v-model="dialog.open">
            <q-card style="min-width: 380px; max-width: 90vw;">
                <q-card-section class="text-h6">
                    {{ dialog.mode === 'create' ? '맛집 추가' : '맛집 수정' }}
                </q-card-section>
                <q-card-section class="q-gutter-md">
                    <q-input v-model="form.restaurantName" label="이름 *" outlined dense />
                    <q-input v-model="form.category" label="카테고리" outlined dense />
                    <q-input v-model="form.address" label="주소" outlined dense />
                    <div class="row q-col-gutter-sm">
                        <q-input class="col" v-model.number="form.lat" type="number" label="위도(lat)" outlined dense />
                        <q-input class="col" v-model.number="form.lon" type="number" label="경도(lon)" outlined dense />
                    </div>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="취소" v-close-popup />
                    <q-btn color="primary" :label="dialog.mode === 'create' ? '추가' : '수정'" @click="submitDialog" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import {
    listRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
} from '@/api/restaurantApi'

const $q = useQuasar()

const loading = ref(false)
const search = ref('')
const rows = ref([])
const router = useRouter()

// 다이얼로그 상태
const dialog = ref({ open: false, mode: 'create', target: null })
const form = ref({
    id: null,
    restaurantName: '',
    category: '',
    address: '',
    lat: null,
    lon: null
})

const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return rows.value
    return rows.value.filter(r => {
        const name = (r.restaurantName || '').toLowerCase()
        const cat = (r.category || '').toLowerCase()
        const addr = (r.address || '').toLowerCase()
        return name.includes(q) || cat.includes(q) || addr.includes(q)
    })
})

onMounted(load)

async function load() {
    loading.value = true
    try {
        rows.value = await listRestaurants(100)
    } catch (e) {
        $q.notify({ type: 'negative', message: e.message || '목록 조회 실패' })
    } finally {
        loading.value = false
    }
}

function goDetail(id) {
    if (!id) return
    router.push({ name: 'restaurant-detail', params: { id } })
}

function openCreate() {
    dialog.value = { open: true, mode: 'create', target: null }
    form.value = { id: null, restaurantName: '', category: '', address: '', lat: null, lon: null }
}

function openEdit(row) {
    dialog.value = { open: true, mode: 'edit', target: row }
    form.value = {
        id: row.id ?? null,
        restaurantName: row.restaurantName ?? '',
        category: row.category ?? '',
        address: row.address ?? '',
        lat: row.lat ?? null,
        lon: row.lon ?? null
    }
}

async function submitDialog() {
    try {
        const payload = {
            // 백엔드 스키마와 맞추기: 없는 필드는 빈 문자열/0으로 안전한 기본값 전송
            id: form.value.id ?? undefined,
            restaurantName: form.value.restaurantName,
            address: form.value.address,
            category: form.value.category,
            menu: '',
            phoneNumber: '',
            lon: form.value.lon ?? 0,
            lat: form.value.lat ?? 0,
            ctpKorNm: '',
            sigKorNm: '',
            emdKorNm: ''
        }

        if (dialog.value.mode === 'create') {
            await createRestaurant(payload)
            $q.notify({ type: 'positive', message: '등록되었습니다.' })
        } else {
            await updateRestaurant(payload)
            $q.notify({ type: 'positive', message: '수정되었습니다.' })
        }

        dialog.value.open = false
        await load()
    } catch (e) {
        $q.notify({ type: 'negative', message: e.message || '요청 실패' })
    }
}

function confirmDelete(row) {
    $q.dialog({
        title: '삭제 확인',
        message: `[${row.restaurantName}] 항목을 삭제할까요?`,
        cancel: true,
        persistent: true
    }).onOk(async () => {
        try {
            await deleteRestaurant(row.id)
            $q.notify({ type: 'positive', message: '삭제되었습니다.' })
            await load()
        } catch (e) {
            $q.notify({ type: 'negative', message: e.message || '삭제 실패' })
        }
    })
}
</script>
