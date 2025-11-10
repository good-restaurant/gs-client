<template>
    <q-page class="q-pa-md">
        <q-card>

            <!-- 헤더 + 뒤로가기 -->
            <q-card-section class="row items-center q-gutter-sm">
                <q-btn flat round icon="arrow_back" @click="goBack" />
                <div class="text-h6">
                    {{ restaurant?.restaurantName || '가게 상세 정보' }}
                </div>
                <q-space />
                <q-chip v-if="restaurant?.category" outline color="primary" text-color="primary">
                    {{ restaurant.category }}
                </q-chip>
            </q-card-section>

            <q-separator />

            <!-- 로딩 오버레이 -->
            <q-inner-loading :showing="loading">
                <q-spinner size="40px" />
            </q-inner-loading>

            <!-- 기본 정보 -->
            <q-card-section v-if="restaurant">
                <div class="q-mb-sm">
                    <div class="text-subtitle1 text-weight-medium">주소</div>
                    <div class="text-body2 text-grey-8">
                        {{ restaurant.address || '-' }}
                    </div>
                </div>

                <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-md-4">
                        <div class="text-subtitle2 text-grey-7">위도(lat)</div>
                        <div>{{ restaurant.lat ?? '-' }}</div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="text-subtitle2 text-grey-7">경도(lon)</div>
                        <div>{{ restaurant.lon ?? '-' }}</div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="text-subtitle2 text-grey-7">전화번호</div>
                        <div>{{ restaurant.phoneNumber || '-' }}</div>
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <!-- 사진 업로드 -->
            <q-card-section v-if="restaurant">
                <div class="row items-center q-col-gutter-sm">
                    <div class="text-subtitle1 text-weight-medium col-12 col-md-3">
                        가게 사진 업로드
                    </div>
                    <div class="col-12 col-md-6">
                        <q-file v-model="selectedFile" dense outlined accept="image/*" label="이미지 파일 선택"
                            :disable="uploading" clearable />
                    </div>
                    <div class="col-12 col-md-3">
                        <q-btn color="primary" label="업로드" :loading="uploading" :disable="!selectedFile || uploading"
                            @click="handleUpload" />
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <!-- 사진 리스트 -->
            <q-card-section v-if="restaurant">
                <div class="row items-center q-mb-sm">
                    <div class="text-subtitle1 text-weight-medium">
                        등록된 사진
                    </div>
                    <q-space />
                    <div class="text-caption text-grey-7">
                        총 {{ pictureUrls.length }}장
                    </div>
                </div>

                <div v-if="pictureUrls.length" class="row q-col-gutter-md">
                    <div v-for="p in pictureUrls" :key="p.id" class="col-12 col-sm-6 col-md-4">
                        <q-card flat bordered>
                            <q-img :src="p.url" :ratio="4 / 3" basic spinner-color="primary" />
                            <q-card-section class="q-pa-sm">
                                <div class="text-caption text-grey-7">
                                    pictureId: {{ p.id }}
                                </div>
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
                <div v-else class="text-grey q-mt-sm">
                    등록된 사진이 없습니다.
                </div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {
    getRestaurant,
    uploadRestaurantPicture,
    getPictureSignedUrl
} from '@/api/restaurantApi'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// 라우트에서 id 가져오기
const restaurantId = computed(() => {
    const raw = route.params.id
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
})

const restaurant = ref(null)
const loading = ref(false)

// 업로드 상태
const selectedFile = ref(null)
const uploading = ref(false)

// pictureId -> signed-url
const pictureUrls = ref([])

// 상세 조회 + 사진 URL 조회
async function loadDetail() {
    if (!restaurantId.value) {
        $q.notify({ type: 'negative', message: '유효하지 않은 가게 ID입니다.' })
        router.replace({ name: 'restaurants' })
        return
    }

    loading.value = true
    try {
        const data = await getRestaurant(restaurantId.value)
        restaurant.value = data
        await loadPictureUrls()
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: e.message || '가게 정보를 불러오지 못했습니다.' })
    } finally {
        loading.value = false
    }
}

async function loadPictureUrls() {
    pictureUrls.value = []

    const pics = restaurant.value?.restaurantPictures
    if (!Array.isArray(pics) || pics.length === 0) return

    try {
        const results = await Promise.all(
            pics.map(async (p) => {
                try {
                    const url = await getPictureSignedUrl(p.id)
                    return { id: p.id, url }
                } catch (e) {
                    console.error('signed-url 조회 실패:', e)
                    return null
                }
            })
        )
        pictureUrls.value = results.filter(Boolean)
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: '사진 정보를 불러오지 못했습니다.' })
    }
}

// 업로드 처리
async function handleUpload() {
    if (!restaurantId.value || !selectedFile.value) {
        $q.notify({ type: 'warning', message: '업로드할 파일을 선택하세요.' })
        return
    }

    // q-file 이 File 또는 File[] 을 줄 수 있어서 안전하게 1개만 추출
    const raw = selectedFile.value
    const file = Array.isArray(raw) ? raw[0] : raw

    if (!(file instanceof File)) {
        console.error('선택된 파일 형식이 잘못되었습니다:', file)
        $q.notify({ type: 'negative', message: '선택된 파일을 읽을 수 없습니다.' })
        return
    }

    uploading.value = true
    try {
        await uploadRestaurantPicture(restaurantId.value, file)

        $q.notify({ type: 'positive', message: '사진이 업로드되었습니다.' })
        selectedFile.value = null

        // 업로드 후 상세/사진 재조회
        await loadDetail()
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: e.message || '사진 업로드에 실패했습니다.' })
    } finally {
        uploading.value = false
    }
}

function goBack() {
    router.back()
}

onMounted(() => {
    loadDetail()
})
</script>
