<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 헤더 -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <!-- 모바일에서만 보이는 메뉴 버튼 -->
        <q-btn v-if="$q.screen.lt.md" flat dense round icon="menu" aria-label="메뉴 열기" @click="toggleLeftDrawer" />
        <!-- 타이틀(클릭 시 홈) -->
        <q-toolbar-title class="cursor-pointer" @click="goHome">
          🍽️ 삼시세끼 모범밥상
        </q-toolbar-title>

        <q-space />

        <!-- 데스크톱 상단 네비게이션 -->
        <div class="gt-sm q-gutter-sm">
          <q-btn flat icon="home" label="홈" :to="{ name: 'home' }" />
          <q-btn flat icon="restaurant" label="모범음식점 목록" :to="{ name: 'restaurants' }" />
          <q-btn flat icon="map" label="지도 보기" :to="{ name: 'map' }" />
          <q-btn flat icon="admin_panel_settings" label="관리자" :to="{ name: 'admin' }" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- 좌측 드로어(모바일 기본 닫힘, 데스크톱 기본 열림) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="260" class="bg-blue-1 text-dark">
      <q-list padding>
        <q-item-label header class="text-grey-8">메뉴</q-item-label>

        <q-item v-for="it in navs" :key="it.name" :to="{ name: it.name }" clickable v-ripple
          :active="route.name === it.name" active-class="bg-primary text-white" class="drawer-item">
          <q-item-section avatar>
            <q-icon :name="it.icon" />
          </q-item-section>
          <q-item-section>{{ it.label }}</q-item-section>
        </q-item>
      </q-list>

      <q-separator spaced class="bg-grey-3" />
      <div class="q-pa-md text-caption text-grey-7">
        주변 모범음식점을 한눈에 찾는
        <span class="text-primary text-weight-medium">GoodRestaurant</span>
        입니다.
      </div>
    </q-drawer>


    <!-- 라우트가 그려질 영역 -->
    <q-page-container>
      <RouterView />
    </q-page-container>

    <!-- 푸터 -->
    <q-footer class="bg-grey-1 text-grey-7">
      <div class="q-pa-sm flex items-center justify-between">
        <div>© {{ year }} GoodRestaurant</div>
        <div class="text-caption">v{{ appVersion }}</div>
      </div>
    </q-footer>

    <!-- 맨 위로 이동 버튼 -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn round color="primary" icon="keyboard_arrow_up" @click="scrollToTop" />
    </q-page-sticky>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

// 드로어: 데스크톱(>=md) 기본 열림, 모바일 기본 닫힘
const leftDrawerOpen = ref($q.screen.gt.sm)
const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value)
const goHome = () => router.push({ name: 'home' })

// 네비게이션 정의 (라우트 name과 반드시 일치하게)
const navs = [
  { name: 'home', label: '홈', icon: 'home' },
  { name: 'restaurants', label: '모범음식점 목록', icon: 'restaurant' },
  { name: 'map', label: '지도 보기', icon: 'map' },
  { name: 'admin', label: '관리자', icon: 'admin_panel_settings' }
]

// 표기용
const year = new Date().getFullYear()
const appVersion = ref(import.meta.env.VITE_APP_VERSION ?? 'dev')

// 런타임에 환경변수 가져오기
onMounted(async () => {
  // 개발 환경에서는 import.meta.env 우선 사용
  if (import.meta.env.DEV) {
    // 개발 환경에서는 이미 설정된 값 사용
  } else {
    // 프로덕션에서는 서버에서 환경변수 가져오기
    try {
      const response = await fetch('/api/env')
      const env = await response.json()
      if (env.VITE_APP_VERSION) {
        appVersion.value = env.VITE_APP_VERSION
      }
    } catch (error) {
      console.warn('환경변수를 서버에서 가져올 수 없습니다. 빌드 시 환경변수를 사용합니다.', error)
    }
  }
})

// 유틸
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.drawer-item {
  transition: background-color .12s ease;
}

.drawer-item:not(.bg-primary):hover {
  background-color: rgba(0, 0, 0, .04);
}

.drawer-item:not(.bg-primary) .q-item__section--main {
  color: rgba(0, 0, 0, .86);
}

.drawer-item:not(.bg-primary) .q-icon {
  color: rgba(0, 0, 0, .64);
}
</style>
