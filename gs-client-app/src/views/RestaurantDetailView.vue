<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card class="q-pa-sm shadow-3" style="border-radius: 16px;">

      <!-- Header -->
      <q-card-section class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" @click="goBack"/>
        <div class="text-h6 text-weight-bold">
          {{ restaurant?.restaurantName || '가게 상세 정보' }}
        </div>
        <q-space/>
        <q-chip v-if="restaurant?.category" outline color="primary" text-color="primary">
          {{ restaurant.category }}
        </q-chip>
      </q-card-section>

      <q-separator inset/>

      <!-- Loading -->
      <q-inner-loading :showing="loading">
        <q-spinner size="40px"/>
      </q-inner-loading>

      <!-- Tabs -->
      <q-tabs
        v-model="currentTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        class="q-mt-sm"
      >
        <q-tab name="home" label="홈"/>
        <q-tab name="photos" :label="`사진 (${pictureUrls.length})`"/> <!-- changed: 사진 개수 표시 -->
        <q-tab name="menus" :label="`메뉴 (${menus.length})`"/> <!-- changed: 메뉴 개수 표시 -->
        <q-tab name="reviews" :label="`리뷰 (${reviews.length})`"/> <!-- changed: 리뷰 개수 표시 -->
      </q-tabs>

      <q-separator/>

      <!-- TAB PANELS -->
      <q-tab-panels v-model="currentTab" animated>

        <!-- ▣ HOME TAB -->
        <q-tab-panel name="home">

          <!-- 기본 정보 -->
          <q-card-section v-if="restaurant">
            <div class="q-mb-sm">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">주소</div>
              <div class="text-body2 text-grey-8 q-mb-md">
                {{ restaurant.address || '-' }}
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-4 info-box">
                <div class="label">위도(lat)</div>
                <div class="value">{{ restaurant.lat ?? '-' }}</div>
              </div>
              <div class="col-12 col-md-4 info-box">
                <div class="label">경도(lon)</div>
                <div class="value">{{ restaurant.lon ?? '-' }}</div>
              </div>
              <div class="col-12 col-md-4 info-box">
                <div class="label">전화번호</div>
                <div class="value">{{ restaurant.phoneNumber || '-' }}</div>
              </div>
            </div>
          </q-card-section>

          <q-separator class="q-my-lg"/>

          <!-- 사진 미리보기 -->
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle1 text-weight-bold">사진</div>
              <q-space/>
              <div class="text-caption text-grey-7">
                총 {{ pictureUrls.length }}개
              </div>
              <q-btn flat color="primary" label="전체보기" @click="currentTab = 'photos'"/>
            </div>

            <div v-if="pictureUrls.length" class="row q-col-gutter-md">
              <div
                v-for="p in pictureUrls.slice(0, 4)"
                :key="p.id"
                class="col-6 col-sm-4 col-md-3"
              >
                <q-img :src="p.url" :ratio="4/3" class="rounded-borders shadow-1 hover-scale" basic
                       spinner-color="primary"/>
              </div>
            </div>

            <div v-else class="text-grey q-mt-sm">등록된 사진이 없습니다.</div>
          </q-card-section>

          <q-separator class="q-my-lg"/>

          <!-- 메뉴 미리보기 -->
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle1 text-weight-bold">메뉴</div>
              <q-space/>

              <div class="text-caption text-grey-7">
                총 {{ menus.length }}개
              </div>
              <q-btn flat color="primary" label="전체보기" @click="currentTab = 'menus'"/>
            </div>

            <div v-if="menus.length" class="column q-gutter-sm">
              <q-card
                v-for="m in menus.slice(0, 3)"
                :key="m.id"
                flat
                bordered
                class="q-pa-md menu-row-card hover-light"
              >
                <div>
                  <div class="text-body1 text-weight-medium">{{ m.name }}</div>
                  <div class="text-body2 text-primary text-weight-bold q-mt-xs">
                    {{ m.price ? m.price.toLocaleString('ko-KR') + '원' : '-' }}
                  </div>
                </div>
              </q-card>
            </div>

            <div v-else class="text-grey q-mt-sm">등록된 메뉴가 없습니다.</div>
          </q-card-section>

          <q-separator class="q-my-lg"/>

          <!-- 리뷰 미리보기 -->
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <div class="text-subtitle1 text-weight-bold">리뷰</div>
              <q-space/>
              <div class="text-caption text-grey-7">
                총 {{ reviews.length }}개
              </div>
              <q-btn flat color="primary" label="전체보기" @click="currentTab = 'reviews'"/>
            </div>

            <div v-if="reviews.length" class="column q-gutter-sm">
              <q-card
                v-for="r in reviews.slice(0, 3)"
                :key="r.id"
                flat
                bordered
                class="q-pa-md menu-row-card hover-light"
              >
                <div>
                  <div class="text-body2 text-grey-8">{{ r.displayName ? r.displayName : "익명" }}</div>
                  <div class="text-body1 text-weight-medium">{{ r.content }}</div>
                </div>
              </q-card>
            </div>

            <div v-else class="text-grey q-mt-sm">등록된 리뷰가 없습니다.</div>
          </q-card-section>

        </q-tab-panel>

        <!-- ▣ PHOTOS TAB -->
        <q-tab-panel name="photos">

          <!-- 사진 업로드 -->
          <q-card-section>
            <div class="row items-center q-col-gutter-sm">
              <div class="text-subtitle1 text-weight-medium col-12 col-md-3">사진 업로드</div>
              <div class="col-12 col-md-6">
                <q-file v-model="selectedFile" dense outlined accept="image/*" label="이미지 파일 선택"
                        :disable="uploading" clearable/>
              </div>
              <div class="col-12 col-md-3">
                <q-btn color="primary" label="업로드" :loading="uploading"
                       :disable="!selectedFile || uploading"
                       @click="handleUpload"/>
              </div>
            </div>
          </q-card-section>

          <q-separator/>

          <!-- 전체 사진 리스트 -->
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div v-for="p in pictureUrls" :key="p.id" class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="shadow-1 rounded-borders">
                  <q-img :src="p.url" :ratio="4/3" basic spinner-color="primary"/>
                  <q-card-section>
                    <div class="text-caption text-grey-7">pictureId: {{ p.id }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div v-if="pictureUrls.length === 0" class="text-grey q-mt-sm">사진이 없습니다.</div>
          </q-card-section>

        </q-tab-panel>

        <!-- ▣ MENUS TAB -->
        <q-tab-panel name="menus">
          <q-card-section>
            <div class="column q-gutter-sm">
              <q-card
                v-for="m in menus"
                :key="m.id"
                flat
                bordered
                class="q-pa-md menu-row-card hover-light"
              >
                <div>
                  <div class="text-body1 text-weight-medium">{{ m.name }}</div>
                  <div class="text-body2 text-primary text-weight-bold q-mt-xs">
                    {{ m.price ? m.price.toLocaleString('ko-KR') + '원' : '-' }}
                  </div>
                </div>
              </q-card>
            </div>

            <div v-if="menus.length === 0" class="text-grey q-mt-sm">등록된 메뉴가 없습니다.</div>
          </q-card-section>
        </q-tab-panel>

        <!-- ▣ REVIEWS TAB -->
        <q-tab-panel name="reviews">
          <q-card-section>
            <CommentsPanel :restaurant-id="restaurantId"/>
          </q-card-section>
        </q-tab-panel>

      </q-tab-panels>

    </q-card>
  </q-page>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useQuasar} from 'quasar'
import {
  getRestaurant,
  uploadRestaurantPicture,
  getPictureSignedUrl
} from '@/api/restaurantApi'
import CommentsPanel from '@/components/CommentsPanel.vue'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const currentTab = ref('home')

const restaurantId = computed(() => {
  const raw = route.params.id
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

const restaurant = ref(null)
const loading = ref(false)
const menus = computed(() => restaurant.value?.restaurantMenus ?? [])
const reviews = computed(() => restaurant.value?.restaurantComments ?? [])

const selectedFile = ref(null)
const uploading = ref(false)

const pictureUrls = ref([])

async function loadDetail() {
  if (!restaurantId.value) {
    $q.notify({type: 'negative', message: '유효하지 않은 가게 ID입니다.'})
    router.replace({name: 'restaurants'})
    return
  }

  loading.value = true
  try {
    const data = await getRestaurant(restaurantId.value)
    restaurant.value = data
    await loadPictureUrls()
  } catch (e) {
    console.error(e)
    $q.notify({type: 'negative', message: e.message || '가게 정보를 불러오지 못했습니다.'})
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
          return {id: p.id, url}
        } catch (e) {
          console.error('signed-url 조회 실패:', e)
          return null
        }
      })
    )
    pictureUrls.value = results.filter(Boolean)
  } catch (e) {
    console.error(e)
    $q.notify({type: 'negative', message: '사진 정보를 불러오지 못했습니다.'})
  }
}

async function handleUpload() {
  if (!selectedFile.value || !restaurantId.value) {
    $q.notify({type: 'warning', message: '업로드할 파일을 선택하세요.'})
    return
  }

  const raw = selectedFile.value
  const file = Array.isArray(raw) ? raw[0] : raw

  if (!(file instanceof File)) {
    $q.notify({type: 'negative', message: '선택된 파일을 읽을 수 없습니다.'})
    return
  }

  uploading.value = true
  try {
    await uploadRestaurantPicture(restaurantId.value, file)
    $q.notify({type: 'positive', message: '사진이 업로드되었습니다.'})

    selectedFile.value = null
    await loadDetail()
  } catch (e) {
    console.error(e)
    $q.notify({type: 'negative', message: e.message || '사진 업로드에 실패했습니다.'})
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

<style scoped>
.menu-row-card {
  border-radius: 12px;
}

.menu-row-card:hover {
  background: #f5faff;
  transition: 0.2s;
}
</style>
