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
        <!-- 검색 영역 -->
        <q-card-section class="row items-center q-col-gutter-sm q-pb-none">
          <q-input
            dense
            outlined
            v-model="search"
            placeholder="음식점 이름 검색"
            clearable
            class="col-12 col-md-4"
            prepend-inner-icon="search"
          />
          <q-space />
          <q-btn flat icon="refresh" label="새로고침" @click="load()" />
        </q-card-section>

        <q-separator spaced />

        <!-- 리스트 영역 -->
        <q-card-section class="q-pt-none">
          <q-inner-loading :showing="loading">
            <q-spinner size="50px" />
          </q-inner-loading>

          <q-list bordered separator v-if="!loading && filtered.length" class="rounded-borders">
            <q-item v-for="(r, idx) in filtered" :key="r.id" class="restaurant-item">
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

                <!-- 🔹 목록 페이지와 동일한 카테고리/좌표 칩 -->
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

                  <q-chip v-if="r.lat && r.lon" dense size="sm" outline color="grey-6" icon="place">
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
                  @click="openEdit(r)"
                  :aria-label="`${r.restaurantName} 수정`"
                />
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click="confirmDelete(r)"
                  :aria-label="`${r.restaurantName} 삭제`"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else-if="!loading" class="text-grey text-center q-mt-xl">
            표시할 데이터가 없습니다. <br />
            상단의 <span class="text-primary text-weight-medium">[새 음식점 추가]</span> 버튼으로 첫
            번째 데이터를 등록해 보세요.
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  listRestaurants, // TODO: listRandomRestaurants 사용 시 삭제 필요
  listRandomRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '@/api/restaurantApi'

const $q = useQuasar()

// enum → 한글 라벨 매핑
const CATEGORY_LABEL_MAP = {
  ETC: '기타',
  KOREAN: '한식',
  CHINESE: '중식',
  JAPANESE: '일식',
  WESTERN: '양식',
}

// 선택용 옵션
const categorySelectOptions = [
  { label: '한식', value: 'KOREAN' },
  { label: '중식', value: 'CHINESE' },
  { label: '일식', value: 'JAPANESE' },
  { label: '양식', value: 'WESTERN' },
  { label: '기타', value: 'ETC' },
]

const search = ref('')
const loading = ref(false)
const rows = ref([])

const dialog = ref({
  open: false,
  mode: 'create', // 'create' | 'edit'
  target: null,
})

const form = ref({
  id: null,
  restaurantName: '',
  category: null,
  address: '',
  lat: null,
  lon: null,
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) => {
    const name = (r.restaurantName || '').toLowerCase()
    return name.includes(q)
  })
})

onMounted(load)

async function load() {
  loading.value = true
  try {
    rows.value = await listRandomRestaurants(100)
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '목록 조회 실패' })
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
    lon: null,
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
    lon: row.lon ?? null,
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
      emdKorNm: '',
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
    persistent: true,
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
