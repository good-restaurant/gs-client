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
              <div class="text-body2 text-grey-8 q-mt-xs">
                등록된 모범음식점 정보를 한눈에 보고, 새로 추가하거나 수정·삭제할 수 있는 페이지입니다.
              </div>
            </div>
          </div>

          <!-- 오른쪽: 요약 정보 + 추가 버튼 -->
          <div class="column items-end q-gutter-sm">
            <q-chip square color="white" text-color="primary" icon="store" class="text-weight-medium">
              총 {{ rows.length }}곳
            </q-chip>
            <q-btn
              color="primary"
              unelevated
              icon="add"
              label="새 모범음식점 추가"
              @click="openCreate()"
            />
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

              <!-- 액션 버튼 -->
              <q-item-section side top>
                <q-btn
                  dense
                  flat
                  round
                  icon="edit"
                  @click.stop="openEdit(r)"
                  :aria-label="`${r.restaurantName} 수정`"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click.stop="confirmDelete(r)"
                  :aria-label="`${r.restaurantName} 삭제`"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else-if="!loading" class="text-grey text-center q-mt-xl">
            표시할 데이터가 없습니다. <br />
            상단의 <span class="text-primary text-weight-medium">[새 모범음식점 추가]</span> 버튼으로
            첫 번째 모범음식점을 등록해 보세요.
          </div>
        </q-card-section>
      </q-card>

      <!-- 생성/수정 다이얼로그 -->
      <q-dialog v-model="dialog.open">
        <q-card style="min-width: 380px; max-width: 90vw;">
          <q-card-section class="text-h6">
            {{ dialog.mode === 'create' ? '모범음식점 추가' : '모범음식점 수정' }}
          </q-card-section>
          <q-card-section class="q-gutter-md">
            <q-input v-model="form.restaurantName" label="이름 *" outlined dense />
            <q-input v-model="form.category" label="카테고리" outlined dense />
            <q-input v-model="form.address" label="주소" outlined dense />
            <div class="row q-col-gutter-sm">
              <q-input
                class="col"
                v-model.number="form.lat"
                type="number"
                label="위도(lat)"
                outlined
                dense
              />
              <q-input
                class="col"
                v-model.number="form.lon"
                type="number"
                label="경도(lon)"
                outlined
                dense
              />
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="취소" v-close-popup />
            <q-btn
              color="primary"
              :label="dialog.mode === 'create' ? '추가' : '수정'"
              @click="submitDialog"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
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

function openCreate() {
  dialog.value = { open: true, mode: 'create', target: null }
  form.value = {
    id: null,
    restaurantName: '',
    category: '',
    address: '',
    lat: null,
    lon: null
  }
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
      // 백엔드 스키마와 맞추기: 없는 필드는 안전한 기본값으로 전송
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
