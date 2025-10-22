<template>
    <q-page class="q-pa-md">
        <q-card flat bordered class="q-pa-md">
            <q-card-section>
                <div class="text-h5 text-primary">🍜 맛집 목록</div>
                <div class="text-subtitle2 text-grey-7 q-mt-xs">
                    인기 있는 맛집을 확인해보세요.
                </div>
            </q-card-section>

            <q-separator spaced />

            <q-card-section>
                <q-list bordered separator>
                    <q-item v-for="(restaurant, index) in restaurants" :key="index" clickable>
                        <q-item-section avatar>
                            <q-avatar size="48px">
                                <img :src="restaurant.image" alt="음식 이미지" />
                            </q-avatar>
                        </q-item-section>

                        <q-item-section>
                            <q-item-label class="text-h6">{{ restaurant.name }}</q-item-label>
                            <q-item-label caption>{{ restaurant.category }} · 평점 {{ restaurant.rating }}</q-item-label>
                        </q-item-section>

                        <q-item-section side>
                            <q-btn flat round icon="chevron_right" color="primary" @click="viewDetail(restaurant)" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'

const restaurants = ref([
    {
        name: '한강 뷰 스시 오마카세',
        category: '일식',
        rating: 4.8,
        image: 'https://cdn.quasar.dev/img/mountains.jpg'
    },
    {
        name: '서울 삼겹살 명가',
        category: '한식',
        rating: 4.6,
        image: 'https://cdn.quasar.dev/img/parallax2.jpg'
    },
    {
        name: '파스타 이야기',
        category: '양식',
        rating: 4.5,
        image: 'https://cdn.quasar.dev/img/parallax1.jpg'
    }
])

function viewDetail(restaurant) {
    console.log(`${restaurant.name} 상세 보기`)
    // 이후 상세 페이지로 라우팅 기능 추가 예정
}
</script>

<style scoped>
.text-h5 {
    font-weight: bold;
}
</style>
