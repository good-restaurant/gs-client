<template>
  <q-page class="q-pa-md bg-grey-1">
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
            <q-btn color="primary" unelevated size="lg" class="home-hero__button" label="모범음식점 목록 보기" icon="list"
              @click="goToRestaurants" />
          </div>
        </q-card-section>
      </q-card>

      <!-- 소개 카드 -->
      <q-card flat bordered class="bg-white">
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
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToRestaurants = () => {
  router.push('/restaurants')
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
</style>
