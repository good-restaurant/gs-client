<template>
  <q-page class="q-pa-md bg-grey-1">
    <div class="column q-gutter-md">

      <!-- 상단 헤더 카드 -->
      <q-card flat bordered class="admin-hero">
        <q-card-section class="row items-center justify-between no-wrap">

          <!-- 왼쪽: 아이콘 + 텍스트 -->
          <div class="row items-center q-gutter-sm">
            <q-avatar color="primary" text-color="white" size="48px">
              <q-icon name="admin_panel_settings" />
            </q-avatar>
            <div>
              <div class="text-h5 text-weight-bold">
                관리자
              </div>
              <div class="text-caption text-grey-7 q-mt-xs">
                모범음식점 데이터를 관리하는 전용 페이지입니다.
              </div>
            </div>
          </div>

          <!-- 오른쪽: 현재는 비활성인 추가 버튼 -->
          <div class="col-auto">
            <q-btn color="primary" icon="add" label="새 음식점 추가" unelevated disable />
          </div>
        </q-card-section>

        <q-separator inset />

        <!-- 간단한 통계 -->
        <q-card-section class="row q-col-gutter-sm">
          <div class="col-auto">
            <q-chip square color="primary" text-color="white" icon="store">
              총 {{ rows.length }}곳 등록됨
            </q-chip>
          </div>
          <div class="col-auto">
            <q-chip square outline color="primary" text-color="primary" icon="info">
              데이터 추가 예정입니다.
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <!-- 리스트 카드 -->
      <q-card flat bordered>
        <q-card-section class="row items-center q-gutter-sm q-pb-none">
          <q-input dense outlined v-model="search" placeholder="음식점 이름 검색" clearable class="col-12 col-md-4" />
          <q-space />
          <q-btn flat icon="refresh" label="새로고침" disabled />
        </q-card-section>

        <q-card-section class="q-pt-none">

          <q-inner-loading :showing="loading">
            <q-spinner size="50px" />
          </q-inner-loading>

          <q-list bordered separator v-if="!loading && filtered.length">
            <q-item v-for="r in filtered" :key="r.id">
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ r.restaurantName }}
                </q-item-label>
                <q-item-label caption>
                  {{ r.category }} · {{ r.address }}
                </q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-btn dense flat icon="edit" disable />
                <q-btn dense flat icon="delete" color="negative" disable />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else-if="!loading" class="text-grey q-mt-md">
            표시할 데이터가 없습니다.
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 검색어
const search = ref('')

// 로딩 상태
const loading = ref(true)

// 더미 데이터
const rows = ref([
  { id: 1, restaurantName: '맛있는 김밥', category: '한식', address: '서울 강남구' },
  { id: 2, restaurantName: '피자 플러스', category: '양식', address: '서울 서초구' },
  { id: 3, restaurantName: '초밥의 신', category: '일식', address: '서울 용산구' }
])

// 검색 필터
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(r => {
    const name = (r.restaurantName || '').toLowerCase()
    return name.includes(q)
  })
})

// 로딩 시뮬레이션
onMounted(() => {
  setTimeout(() => (loading.value = false), 500)
})
</script>

<style scoped>
.admin-hero {
  border-radius: 16px;
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}
</style>
