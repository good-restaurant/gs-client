<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="row items-center q-gutter-sm">
        <div class="text-h5 text-primary">관리자 페이지</div>
        <q-space />
        <q-btn color="primary" label="새 음식점 추가" disabled />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row items-center q-gutter-sm q-mb-sm">
          <q-input dense outlined v-model="search" placeholder="음식점 이름 검색" clearable
                   class="col-12 col-md-4" />
          <q-space />
          <q-btn flat icon="refresh" label="새로고침" disabled />
        </div>

        <q-inner-loading :showing="loading">
          <q-spinner size="50px" />
        </q-inner-loading>

        <q-list bordered separator v-if="!loading && filtered.length">
          <q-item v-for="r in filtered" :key="r.id">
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ r.restaurantName }}</q-item-label>
              <q-item-label caption>{{ r.category }} · {{ r.address }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn dense flat icon="edit" disabled />
              <q-btn dense flat icon="delete" color="negative" disabled />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else-if="!loading" class="text-grey q-mt-md">표시할 데이터가 없습니다.</div>
      </q-card-section>
    </q-card>
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
  setTimeout(() => loading.value = false, 500)
})
</script>
