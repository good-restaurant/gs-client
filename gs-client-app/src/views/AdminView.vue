<template>
  <q-page class="q-pa-md bg-white">
    <div class="column q-gutter-md">
      <!-- 상단 히어로 / 요약 영역 -->
      <q-card flat bordered class="admin-hero">
        <q-card-section class="row items-center justify-between no-wrap">
          <!-- 왼쪽: 아이콘 + 텍스트 -->
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="primary" text-color="white" class="admin-hero__avatar">
              <q-icon name="admin_panel_settings" size="30px" />
            </q-avatar>

            <div>
              <div class="text-h5 text-weight-bold text-primary">관리자</div>
              <div class="text-body2 text-grey-8 q-mt-xs">
                모범음식점 데이터를 추가·수정·삭제할 수 있는 관리자 전용 페이지입니다.
              </div>
            </div>
          </div>

          <!-- 오른쪽: 통계 + 추가 버튼 -->
          <div class="column items-end q-gutter-sm">
            <q-chip
              square
              color="white"
              text-color="primary"
              icon="store"
              class="text-weight-medium"
            >
              총 {{ rows.length }}곳
            </q-chip>

            <q-btn
              color="primary"
              unelevated
              icon="add"
              label="새 음식점 추가"
              @click="openCreate()"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 리스트 카드 -->
      <q-card flat bordered class="bg-white">
        <!-- 검색 / 필터 영역 -->
        <q-card-section class="row q-col-gutter-sm q-pb-none items-center">
          <!-- 검색창만 단독 -->
          <q-input
            dense
            outlined
            v-model="search"
            placeholder="이름 / 주소 / 카테고리 검색"
            clearable
            class="col-12 col-md-4"
            prepend-inner-icon="search"
            @keyup.enter="triggerSearch"
          />

          <!-- 카테고리 필터 -->
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
            :disable="loading || searching"
          >
            <template #prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>

          <q-space />

          <q-btn
            flat
            icon="refresh"
            label="새로고침"
            @click="load"
            :disable="loading || searching"
          />
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
              @click="goAdminDetail(r.id)"
            >
              <!-- 번호 -->
              <q-item-section side class="gt-sm">
                <q-badge
                  color="grey-3"
                  text-color="grey-8"
                  class="text-weight-medium"
                >
                  {{ idx + 1 }}
                </q-badge>
              </q-item-section>

              <!-- 본문 -->
              <q-item-section>
                <q-item-label
                  class="text-weight-medium text-body1"
                  v-html="highlight(r.restaurantName || '이름 없음')"
                />
                <q-item-label
                  caption
                  class="text-grey-7 q-mt-xs"
                  v-html="highlight(r.address || '-')"
                />
                <div class="row items-center q-gutter-xs q-mt-xs">
                  <q-chip
                    v-if="r.category"
                    dense
                    size="sm"
                    color="primary"
                    text-color="white"
                    icon="local_dining"
                  >
                    {{ CATEGORY_LABEL_MAP[r.category] || r.category }}
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
            상단의 <span class="text-primary text-weight-medium">[새 음식점 추가]</span>
            버튼으로 첫 번째 데이터를 등록해 보세요.
          </div>
        </q-card-section>
      </q-card>

      <!-- 생성/수정 다이얼로그 -->
      <q-dialog v-model="dialog.open">
        <q-card style="min-width: 380px; max-width: 90vw">
          <q-card-section class="text-h6">
            {{ dialog.mode === 'create' ? '모범음식점 추가' : '모범음식점 수정' }}
          </q-card-section>

          <q-card-section class="q-gutter-md">
            <q-input v-model="form.restaurantName" label="이름 *" outlined dense />

            <q-select
              v-model="form.category"
              :options="categorySelectOptions"
              label="카테고리"
              outlined
              dense
              emit-value
              map-options
              option-label="label"
              option-value="value"
            />

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
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

// 관리자용 API (생성/수정/삭제)
import {
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from '@/api/authRestaurantApi'

// 공개 API (검색/랜덤)
import {
  listRandomRestaurants,
  searchRestaurants
} from '@/api/restaurantApi'

const $q = useQuasar()
const router = useRouter()

// enum → 한글 라벨 매핑
const CATEGORY_LABEL_MAP = {
  ETC: '기타',
  KOREAN: '한식',
  CHINESE: '중식',
  JAPANESE: '일식',
  WESTERN: '양식'
}

// 선택용 옵션
const categorySelectOptions = [
  { label: '한식', value: 'KOREAN' },
  { label: '중식', value: 'CHINESE' },
  { label: '일식', value: 'JAPANESE' },
  { label: '양식', value: 'WESTERN' },
  { label: '기타', value: 'ETC' }
]

const search = ref('')
const loading = ref(false)
const searching = ref(false)
const rows = ref([])

const searchDebounceTimer = ref(null)

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
    ...list.map(c => ({
      label: CATEGORY_LABEL_MAP[c] || c,
      value: c
    }))
  ]
})

// 검색 + 카테고리 필터 적용한 리스트
const filtered = computed(() => {
  const q = (search.value ?? '').trim().toLowerCase()
  const cat = categoryFilter.value

  const filteredList = rows.value.filter(r => {
    const name = (r.restaurantName || '').toLowerCase()
    const category = (r.category || '').toLowerCase()
    const addr = (r.address || '').toLowerCase()

    const matchSearch =
      !q || name.includes(q) || category.includes(q) || addr.includes(q)

    const matchCategory =
      cat === 'all' || (r.category && r.category === cat)

    return matchSearch && matchCategory
  })

  // 이름 매칭 → 주소 매칭 → 그 외, 각 그룹 내에서는 이름 가나다순
  return filteredList.sort((a, b) => {
    const qLower = q

    const aName = (a.restaurantName || '').toLowerCase()
    const bName = (b.restaurantName || '').toLowerCase()
    const aAddr = (a.address || '').toLowerCase()
    const bAddr = (b.address || '').toLowerCase()

    const aMatchName = qLower && aName.includes(qLower)
    const bMatchName = qLower && bName.includes(qLower)
    if (aMatchName && !bMatchName) return -1
    if (!aMatchName && bMatchName) return 1

    const aMatchAddr = qLower && aAddr.includes(qLower)
    const bMatchAddr = qLower && bAddr.includes(qLower)
    if (aMatchAddr && !bMatchAddr) return -1
    if (!aMatchAddr && bMatchAddr) return 1

    return String(a.restaurantName || '').localeCompare(
      String(b.restaurantName || ''),
      'ko'
    )
  })
})

onMounted(load)

watch(search, async (v) => {
  const raw = v ?? ''

  // 완전히 비워졌을 때
  if (!raw) {
    if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
    searching.value = false
    await load()
    return
  }

  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
  searching.value = true
  searchDebounceTimer.value = setTimeout(async () => {
    await load()
    searching.value = false
  }, 500)
})

async function triggerSearch() {
  const text = (search.value ?? '').trim()

  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)

  if (!text) {
    searching.value = false
    await load()
    return
  }

  searching.value = true
  await load()
  searching.value = false
}

async function load() {
  loading.value = true
  try {
    const qRaw = search.value ?? ''
    const q = qRaw.trim()

    if (q) {
      rows.value = await searchRestaurants(q, 100)
    } else {
      rows.value = await listRandomRestaurants(100)
    }
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.message || '목록 조회 실패'
    })
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialog.value = { open: true, mode: 'create', target: null }
  form.value = {
    id: null,
    restaurantName: '',
    category: null,
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
    category: row.category ?? null,
    address: row.address ?? '',
    lat: row.lat ?? null,
    lon: row.lon ?? null
  }
}

async function submitDialog() {
  try {
    if (!form.value.restaurantName) {
      $q.notify({ type: 'warning', message: '이름은 필수입니다.' })
      return
    }

    const payload = {
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

function goAdminDetail(id) {
  if (!id) return
  router.push({ name: 'admin-restaurant-detail', params: { id } })
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlight(text) {
  const base = text ?? ''
  const q = (search.value ?? '').trim()
  if (!q) return escapeHtml(base)

  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escapedQuery, 'gi')
  const matches = base.match(regex)
  if (!matches) return escapeHtml(base)

  const parts = base.split(regex)
  let result = ''
  parts.forEach((part, idx) => {
    result += escapeHtml(part)
    if (idx < matches.length) {
      result += `<span class="text-negative text-weight-bold">${escapeHtml(
        matches[idx]
      )}</span>`
    }
  })
  return result
}

const dialog = ref({
  open: false,
  mode: 'create',
  target: null
})

const form = ref({
  id: null,
  restaurantName: '',
  category: null,
  address: '',
  lat: null,
  lon: null
})
</script>

<style scoped>
.admin-hero {
  border-radius: 16px;
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}

.admin-hero__avatar {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.45);
}

.restaurant-item {
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.restaurant-item:hover {
  background-color: #f5f7fb;
}
</style>
