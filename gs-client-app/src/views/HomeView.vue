<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h4 text-primary">🍽️ 맛집 추천 플랫폼</div>
        <div class="text-subtitle2 text-grey-7 q-mt-sm">
          당신 근처의 인기 맛집을 찾아보세요!
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn color="primary" label="맛집 목록 보기" to="/restaurants" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
// 단순 UI만 있는 상태
</script>

<style scoped>
.text-h4 {
  font-weight: bold;
}
</style>
