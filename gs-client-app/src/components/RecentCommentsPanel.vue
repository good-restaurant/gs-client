<template>
  <q-card flat bordered class="recent-comments-card home-bottom-card">
    <q-card-section>

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
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecentComments, getRecentCommentsPage } from '@/api/restaurantApi'

const router = useRouter()

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
  const max = Math.min(TICKER_VISIBLE_COUNT, comments.value.length)

  for (let i = 0; i < max; i++) {
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

    recentModalComments.value = content.map((item) => ({
      id: item.id,
      content: item.content,
      rating: item.rating,
      displayName: item.displayName,
      restaurantId: item.restaurant?.id,
      restaurantName: item.restaurant?.restaurantName,
      createdAt: item.createdAt,
    }))

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
.recent-comments-card {
  border-radius: 16px;
  background: #fafafa;
}

.ticker-window {
  overflow: hidden;
  max-height: 360px;
}

.ticker-item {
  padding: 10px 0;
  min-height: 72px;
  border-radius: 8px;
}

.one-line-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
