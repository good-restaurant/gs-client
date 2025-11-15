<!-- src/views/RestaurantListView.vue -->
<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="column q-gutter-md">

      <!-- 상단 히어로 / 요약 영역 -->
      <q-card flat bordered class="list-hero">
        <q-card-section class="row items-center justify-between no-wrap">

          <!-- 왼쪽: 아이콘 + 텍스트 -->
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="primary" text-color="white" class="list-hero__avatar">
              <q-icon name="restaurant" size="30px" />
            </q-avatar>

            <div>
              <div class="text-h5 text-weight-bold text-primary">
                모범음식점 목록
              </div>
            </div>
          </div>

          <!-- 오른쪽: 요약 정보 + 추가 버튼 -->
          <div class="column items-end q-gutter-sm">
            <q-chip square color="white" text-color="primary" icon="store" class="text-weight-medium">
              총 {{ rows.length }}곳
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <!-- 실제 목록 카드 -->
      <q-card flat bordered class="bg-white">
        <!-- 검색 / 필터 영역 -->
        <q-card-section class="row items-center q-col-gutter-sm q-pb-none">
          <q-input
            dense
            outlined
            v-model="search"
            placeholder="이름 / 주소 / 카테고리 검색"
            clearable
            class="col-12 col-md-5"
            prepend-inner-icon="search"
          />
          <q-select
            dense
            outlined
            v-model="categoryFilter"
            :options="categoryOptions"
            class="col-12 col-md-3"
            emit-value
            map-options
            :option-label="opt => opt.label"
            :option-value="opt => opt.value"
            clear-icon="close"
            label="카테고리 필터"
          >
            <template #prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>
          <q-space />
          <q-btn flat icon="refresh" label="새로고침" @click="load()" />
        </q-card-section>

        <q-separator spaced />

        <!-- 리스트 영역 -->
        <q-card-section class="q-pt-none">

          <q-inner-loading :showing="loading">
            <q-spinner size="50px" />
          </q-inner-loading>

          <q-list
            bordered
            separator
            v-if="!loading && filtered.length"
            class="rounded-borders"
          >
            <q-item
              v-for="(r, idx) in filtered"
              :key="r.id"
              clickable
              class="restaurant-item"
              @click="goDetail(r.id)"
            >
              <!-- 번호 -->
              <q-item-section side class="gt-sm">
                <q-badge color="grey-3" text-color="grey-8" class="text-weight-medium">
                  {{ idx + 1 }}
                </q-badge>
              </q-item-section>

              <!-- 본문 -->
              <q-item-section>
                <q-item-label class="text-weight-medium text-body1">
                  {{ r.restaurantName || '이름 없음' }}
                </q-item-label>
                <q-item-label caption class="text-grey-7 q-mt-xs">
                  {{ r.address || '-' }}
                </q-item-label>
                <div class="row items-center q-gutter-xs q-mt-xs">
                  <q-chip
                    v-if="r.category"
                    dense
                    size="sm"
                    color="primary"
                    text-color="white"
                    icon="local_dining"
                  >
                    {{ r.category }}
                  </q-chip>
                  <q-chip
                    v-if="r.lat && r.lon"
                    dense
                    size="sm"
                    outline
                    color="grey-6"
                    icon="place"
                  >
                    {{ r.lat }}, {{ r.lon }}
                  </q-chip>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else-if="!loading" class="text-grey text-center q-mt-xl">
            표시할 데이터가 없습니다. <br />
          </div>
        </q-card-section>
      </q-card>
    </div>
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
const router = useRouter()

const loading = ref(false)
const search = ref('')
const rows = ref([])

// 카테고리 필터
const categoryFilter = ref('all')
const categoryOptions = computed(() => {
  const set = new Set()
  rows.value.forEach(r => {
    if (r.category) set.add(r.category)
  })
  const list = Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
  return [
    { label: '전체 카테고리', value: 'all' },
    ...list.map(c => ({ label: c, value: c }))
  ]
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const cat = categoryFilter.value

  return rows.value.filter(r => {
    const name = (r.restaurantName || '').toLowerCase()
    const category = (r.category || '').toLowerCase()
    const addr = (r.address || '').toLowerCase()

    const matchSearch =
      !q || name.includes(q) || category.includes(q) || addr.includes(q)

    const matchCategory =
      cat === 'all' || (r.category && r.category === cat)

    return matchSearch && matchCategory
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
</script>

<style scoped>
.list-hero {
  border-radius: 16px;
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}

.list-hero__avatar {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.45);
}

/* 리스트 hover 효과 */
.restaurant-item {
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.restaurant-item:hover {
  background-color: #f5f7fb;
}
</style>
