<template>
  <q-page class="q-pa-md bg-white">
    <div class="column q-gutter-md">

      <!-- 헤더 / 히어로 카드 -->
      <q-card flat bordered class="home-hero">
        <q-card-section class="row items-center justify-between no-wrap">

          <!-- 왼쪽: 아이콘 + 텍스트 -->
          <div class="row items-center q-gutter-md">
            <q-avatar size="64px" color="primary" text-color="white" class="home-hero__avatar">
              <q-icon name="restaurant_menu" size="32px" />
            </q-avatar>

            <div>
              <div class="text-h5 text-weight-bold text-primary">
                삼시세끼 모범밥상: 모범음식점 추천 플랫폼
              </div>
              <div class="text-body2 text-grey-8 q-mt-xs">
                당신 근처의 모범음식점을 추천 받을 수 있는
                <span class="text-weight-medium">GoodRestaurant</span> 서비스입니다.
              </div>
            </div>
          </div>

          <!-- 오른쪽: CTA 버튼 -->
          <div class="col-auto">
            <q-btn
              color="primary"
              unelevated
              size="lg"
              class="home-hero__button"
              label="모범음식점 목록 보기"
              icon="list"
              @click="goToRestaurants"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 하단: 좌/우 분할 -->
      <div class="home-bottom q-mt-md">

        <!-- 왼쪽: 소개 카드 -->
        <div class="home-bottom-left">
          <q-card flat bordered class="bg-white intro-card home-bottom-card">
            <q-card-section>
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle1 text-weight-bold">
                  삼시세끼 모범밥상 소개
                </div>
                <q-chip dense color="primary" text-color="white" outline>
                  모범음식점 데이터 기반
                </q-chip>
              </div>

              <q-separator spaced />

              <div class="text-caption text-grey-7 q-mb-md">
                공공 데이터를 기반으로 운영하는 모범음식점 추천 플랫폼입니다.
              </div>

              <div class="text-body2 q-mb-sm text-weight-bold">
                주요 기능
              </div>
              <ul class="home-list">
                <li>행정구역·주소를 기준으로 모범음식점을 검색할 수 있어요.</li>
                <li>지도에서 주변 모범음식점 위치를 한눈에 확인할 수 있어요.</li>
                <li>가게 상세 페이지에서 실제 방문 사진을 업로드해 기록할 수 있어요.</li>
              </ul>

              <div class="text-body2 q-mb-sm text-weight-bold q-mt-md">
                데이터 출처
              </div>
              <div class="text-body2 text-grey-8 q-mb-md">
                모범음식점, 위생 등급 등 공공 데이터를 기반으로 하며 실제 정보와 차이가 있을 수 있습니다.
                잘못된 정보가 보이면 관리자에게 알려 주세요.
              </div>

              <div class="text-body2 q-mb-sm text-weight-bold">
                사용 방법
              </div>
              <ul class="home-list">
                <li>
                  <router-link to="/restaurants" class="text-primary">
                    모범음식점 목록
                  </router-link>
                  에서 전체 리스트를 검색·필터링할 수 있습니다.
                </li>
                <li>
                  <router-link to="/map" class="text-primary">
                    지도 보기
                  </router-link>
                  에서 위치를 기준으로 주변 모범음식점을 탐색할 수 있습니다.
                </li>
                <li>
                  관심 있는 가게를 클릭하면 <span class="text-primary">상세 페이지</span>로 이동하여
                  정보를 확인할 수 있습니다.
                </li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <!-- 오른쪽: 최근 댓글 -->
        <div class="home-bottom-right">
          <q-card flat bordered class="recent-comments-card home-bottom-card">
            <q-card-section>

              <!-- 상단 클릭 시 전체보기 모달 -->
              <div
                class="row items-center justify-between q-mb-sm cursor-pointer"
                @click="openRecentDialog"
              >
                <div class="text-subtitle1 text-weight-bold">
                  최근 리뷰
                </div>
                <q-chip dense color="secondary" text-color="white" outline>
                  실시간 후기
                </q-chip>
              </div>

              <q-separator spaced />

              <div class="ticker-window">
                <div
                  v-for="item in visibleComments"
                  :key="item._key"
                  class="ticker-item row no-wrap items-center cursor-pointer"
                  @click.stop="goToRestaurantDetail(item.restaurantId)"
                >
                  <div class="col">
                    <div class="text-body2 text-weight-bold one-line-ellipsis">
                      {{ item.restaurantName }}
                    </div>
                    <div class="text-caption text-grey-7 one-line-ellipsis">
                      {{ item.content }}
                    </div>
                  </div>

                  <div class="col-auto text-right q-ml-md">
                    <q-rating
                      :model-value="item.rating"
                      max="5"
                      size="18px"
                      color="amber"
                      readonly
                    />
                  </div>
                </div>
              </div>

              <div v-if="isLoading" class="text-caption text-grey-6 q-mt-sm">
                최근 리뷰를 불러오는 중입니다...
              </div>
              <div v-else-if="!comments.length" class="text-caption text-grey-6 q-mt-sm">
                아직 등록된 리뷰가 없습니다.
              </div>
            </q-card-section>
          </q-card>
        </div>

      </div>

      <!-- 최근 리뷰 전체보기 모달 -->
      <q-dialog v-model="isRecentDialogOpen">
        <q-card class="recent-modal-card">
          <q-card-section class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold">
              최근 리뷰 전체 보기
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none recent-modal-list">
            <q-list bordered separator>
              <q-item
                v-for="item in recentModalComments"
                :key="item.id"
                clickable
                @click="goToRestaurantDetail(item.restaurantId)"
              >
                <q-item-section>
                  <q-item-label class="text-body2 text-weight-bold">
                    {{ item.restaurantName }}
                  </q-item-label>
                  <q-item-label class="text-caption">
                    {{ item.content }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-rating
                    :model-value="item.rating"
                    max="5"
                    size="18px"
                    color="amber"
                    readonly
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-section class="row justify-center q-pt-sm q-pb-md">
            <q-pagination
              v-model="recentPageDisplay"
              :max="recentTotalPages || 1"
              boundary-numbers
              direction-links
              size="sm"
            />
          </q-card-section>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecentComments, getRecentCommentsPage } from '@/api/restaurantApi'

const router = useRouter()

const goToRestaurants = () => {
  router.push('/restaurants')
}

const goToRestaurantDetail = (id) => {
  router.push(`/restaurants/${id}`)
}

const TICKER_VISIBLE_COUNT = 5
const INTERVAL_MS = 2000

const comments = ref([])
const startIndex = ref(0)
const isLoading = ref(false)

let timerId = null

const visibleComments = computed(() => {
  if (!comments.value.length) return []

  const result = []
  const count = Math.min(TICKER_VISIBLE_COUNT, comments.value.length)

  for (let i = 0; i < count; i++) {
    const idx = (startIndex.value + i) % comments.value.length
    const item = comments.value[idx]
    result.push({
      ...item,
      _key: `${item.id}-${idx}`,
    })
  }

  return result
})

async function fetchRecent() {
  try {
    isLoading.value = true
    const list = await getRecentComments(20)
    comments.value = list ?? []
    startIndex.value = 0
  } finally {
    isLoading.value = false
  }
}

function startTicker() {
  timerId = setInterval(() => {
    if (comments.value.length > 1) {
      startIndex.value = (startIndex.value + 1) % comments.value.length
    }
  }, INTERVAL_MS)
}

onMounted(async () => {
  await fetchRecent()
  startTicker()
})

onUnmounted(() => {
  clearInterval(timerId)
})

const isRecentDialogOpen = ref(false)
const recentModalComments = ref([])
const isRecentModalLoading = ref(false)
const recentPage = ref(0)
const recentSize = ref(5)
const recentTotalPages = ref(0)

const recentPageDisplay = computed({
  get() {
    return recentPage.value + 1
  },
  set(val) {
    loadRecentPage(val - 1)
  },
})

async function loadRecentPage(page = 0) {
  isRecentModalLoading.value = true
  try {
    const pageData = await getRecentCommentsPage({
      page,
      size: recentSize.value,
      sort: 'createdAt,desc',
    })

    const content = Array.isArray(pageData?.content) ? pageData.content : []

    const mapped = content.map((item) => ({
      id: item.id,
      content: item.content,
      rating: item.rating,
      displayName: item.displayName,
      restaurantId: item.restaurant?.id,
      restaurantName: item.restaurant?.restaurantName,
      createdAt: item.createdAt,
    }))

    recentModalComments.value = mapped
    recentPage.value = pageData.number ?? page
    recentTotalPages.value = pageData.totalPages ?? 1
  } finally {
    isRecentModalLoading.value = false
  }
}

async function openRecentDialog() {
  isRecentDialogOpen.value = true
  await loadRecentPage(0)
}
</script>

<style scoped>
.home-hero {
  border-radius: 16px;
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}

.home-hero__avatar {
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.home-hero__button {
  min-width: 170px;
}

/* 소개 리스트 들여쓰기 + 간격 */
.home-list {
  padding-left: 1.2rem;
  margin: 0 0 0.4rem;
}

.home-list li {
  margin-bottom: 0.25rem;
}

/* 히어로 아래 영역 */
.home-bottom {
  display: flex;
  gap: 16px;
}

.home-bottom-left {
  flex: 2 1 0;
}

.home-bottom-right {
  flex: 1 1 0;
}

/* 모바일: 위/아래로 쌓기 */
@media (max-width: 1023.98px) {
  .home-bottom {
    flex-direction: column;
  }
}

/* 카드 radius 통일 */
.intro-card {
  border-radius: 16px;
}

.recent-comments-card {
  border-radius: 16px;
  background: #fafafa;
}

/* 댓글 5개만 보이도록 */
.ticker-window {
  overflow: hidden;
  max-height: 360px;
}

.ticker-item {
  padding: 10px 0;
  min-height: 72px;
  border-radius: 8px;
}

/* 한 줄 말줄임 */
.one-line-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 데스크톱에서 좌/우 카드 높이 맞추기 */
@media (min-width: 1024px) {
  .home-bottom-card {
    height: 420px;
  }
}

/* 모달 카드 */
.recent-modal-card {
  width: 90vw;
  max-width: 720px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
}

.recent-modal-list {
  flex: 1 1 auto;
  overflow-y: auto;
}
</style>
