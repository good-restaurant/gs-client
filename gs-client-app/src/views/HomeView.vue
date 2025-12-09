<template>
  <q-page class="q-pa-md bg-grey-1">

    <!-- 상단 Hero -->
    <q-card flat bordered class="home-hero q-pa-lg q-mb-lg">
      <q-card-section class="row items-center justify-between no-wrap">
        <div class="row items-center q-gutter-md">
          <q-avatar size="64px" color="primary" text-color="white" class="home-hero__avatar">
            <q-icon name="restaurant_menu" size="32px" />
          </q-avatar>

          <div>
            <div class="text-h4 text-weight-bold text-primary">
              삼시세끼 모범밥상
            </div>
            <div class="text-body1 text-grey-8 q-mt-xs">
              당신 근처의 모범음식점을 추천 받을 수 있는
              <span class="text-weight-medium">GoodRestaurant</span> 서비스
            </div>
          </div>
        </div>

        <q-btn
          color="primary"
          unelevated
          size="lg"
          class="home-hero__button"
          label="모범음식점 목록 보기"
          icon="list"
          @click="goToRestaurants"
        />
      </q-card-section>
    </q-card>

    <!-- 하단 콘텐츠 -->
    <div class="home-bottom">

      <!-- 좌측 카드 영역 -->
      <div class="home-bottom-left">

        <!-- 첫 번째 카드 -->
        <q-card flat bordered class="intro-card card-shadow first-card hover-card">
          <q-card-section class="row items-start justify-between q-pa-md">
            <div>
              <div class="text-subtitle1 text-weight-bold text-body2">
                삼시세끼 모범밥상 소개
              </div>
              <div class="text-body2 text-grey-7 q-mt-xs">
                공공 데이터를 기반으로 운영하는 모범음식점 추천 플랫폼입니다.
              </div>
            </div>
            <q-chip dense color="primary" text-color="white" outline class="chip-top-right">
              모범음식점 데이터 기반
            </q-chip>
          </q-card-section>
        </q-card>

        <!-- 두 번째 카드 -->
        <q-card flat bordered class="intro-card card-shadow hover-card">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">주요 기능</div>
            <ul class="home-list">
              <li><q-icon name="search" size="16px" class="q-mr-xs" color="primary"/> 행정구역·주소 기준 검색</li>
              <li><q-icon name="place" size="16px" class="q-mr-xs" color="primary"/> 지도에서 주변 모범음식점 확인</li>
              <li><q-icon name="photo_camera" size="16px" class="q-mr-xs" color="primary"/> 상세 페이지 사진 업로드</li>
            </ul>
          </q-card-section>
        </q-card>

        <!-- 마지막 카드 (맨 아래 정렬) -->
        <q-card flat bordered class="intro-card card-shadow last-card hover-card">
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">사용 방법</div>
            <ul class="home-list">
              <li>
                <q-icon name="list" size="16px" class="q-mr-xs" color="primary"/>
                <router-link to="/restaurants" class="text-primary">모범음식점 목록</router-link>에서 검색·필터링
              </li>
              <li>
                <q-icon name="map" size="16px" class="q-mr-xs" color="primary"/>
                <router-link to="/map" class="text-primary">지도 보기</router-link>에서 위치 기반 탐색
              </li>
              <li>
                <q-icon name="info" size="16px" class="q-mr-xs" color="primary"/>
                관심 있는 가게 클릭 시&nbsp; <span class="text-primary">상세 페이지</span>로 이동
              </li>
            </ul>
          </q-card-section>
        </q-card>

      </div>

      <!-- 우측: 최근 댓글 -->
      <div class="home-bottom-right">
        <RecentCommentsPanel class="flex-1" />
      </div>
    </div>

    <!-- 전체 하단: 데이터 출처 -->
    <q-card flat bordered class="intro-card card-shadow footer-card q-mt-lg">
      <q-card-section class="q-pa-md">
        <div class="text-subtitle2 text-weight-bold q-mb-sm">데이터 출처</div>
        <div class="text-body2 text-grey-6">
          모범음식점, 위생 등급 등 공공 데이터를 기반으로 하며 실제 정보와 차이가 있을 수 있습니다.
          잘못된 정보가 보이면 관리자에게 알려주세요.
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import RecentCommentsPanel from '@/components/RecentCommentsPanel.vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const goToRestaurants = () => router.push('/restaurants')
</script>

<style scoped>
/* 상단 Hero */
.home-hero {
  border-radius: 16px;
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}
.home-hero__avatar {
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.35);
}
.home-hero__button {
  min-width: 180px;
}

/* 하단 콘텐츠 */
.home-bottom {
  display: flex;
  gap: 24px;
  align-items: stretch; /* 좌우 높이 동일 */
}
.home-bottom-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 24px;
}
.home-bottom-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 카드 공통 */
.intro-card {
  border-radius: 16px;
  transition: all 0.2s ease-in-out;
}
.card-shadow {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}
.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}

/* 카드 내부 요소 */
.first-card {
  margin-top: 0;
}
.last-card {
  margin-top: auto;
}
.chip-top-right {
  align-self: flex-start;
}
.home-list {
  padding-left: 1.4rem;
  margin: 0;
}
.home-list li {
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
}

/* 하단 출처 카드 */
.footer-card {
  background: #f8f9fa;
  color: #6c757d;
}

/* 반응형 */
@media (max-width: 1023.98px) {
  .home-bottom {
    flex-direction: column;
  }
  .home-bottom-left,
  .home-bottom-right {
    height: auto;
  }
  .last-card {
    margin-top: 16px;
  }
}
</style>

