<!-- src/views/MapView.vue -->
<template>
    <q-page class="q-pa-md bg-grey-1">
        <div class="column q-gutter-md">

            <!-- 상단 검색 카드 -->
            <q-card flat bordered>
                <q-card-section class="row items-center q-col-gutter-sm">
                    <div class="text-subtitle1 text-weight-bold col-12 col-md-3">
                        주변 맛집 검색
                    </div>

                    <!-- 도로명 주소 입력 -->
                    <q-input v-model="address" class="col-12 col-md-6" dense outlined clearable
                        placeholder="도로명 주소를 입력하세요 (예: 서울특별시 중구 세종대로 110)" @keyup.enter="handleSearch">
                        <template #prepend>
                            <q-icon name="place" />
                        </template>
                    </q-input>

                    <!-- 반경 선택 -->
                    <q-select v-model="radius" :options="radiusOptions" class="col-6 col-md-2" dense outlined emit-value
                        map-options label="검색 반경">
                        <template #prepend>
                            <q-icon name="radar" />
                        </template>
                    </q-select>

                    <!-- 검색 버튼 -->
                    <div class="col-6 col-md-1 flex justify-end">
                        <q-btn color="primary" unelevated icon="search" label="검색" @click="handleSearch" />
                    </div>
                </q-card-section>
            </q-card>

            <!-- 지도 카드 -->
            <q-card flat bordered>
                <q-card-section class="q-pa-none">
                    <div class="relative-position" style="width: 100%; height: 70vh;">
                        <div id="map" style="width: 100%; height: 100%;"></div>

                        <!-- 로딩 스피너 -->
                        <q-inner-loading :showing="loading">
                            <q-spinner size="42px" />
                            <div class="q-mt-sm">지도를 불러오는 중...</div>
                        </q-inner-loading>
                    </div>
                </q-card-section>
            </q-card>

        </div>
    </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { getNearbyRestaurants } from '@/api/restaurantApi'

const $q = useQuasar()

const clientId = ref('')
const loading = ref(true)

// 검색 폼 상태
const address = ref('')
const radius = ref(0.1) // km 단위라고 가정(백엔드 기본값과 동일)

// 반경 선택 옵션
const radiusOptions = [
    { label: '100m', value: 0.1 },
    { label: '300m', value: 0.3 },
    { label: '500m', value: 0.5 },
    { label: '1km', value: 1.0 }
]

// 지도/마커 상태
let map = null
let infoWindow = null
let markers = []

onMounted(async () => {
    try {
        // 개발 환경에서는 import.meta.env 우선 사용
        if (import.meta.env.DEV) {
            clientId.value = import.meta.env.VITE_NAVER_CLIENT_ID
        } else {
            // 프로덕션에서는 서버에서 환경변수 가져오기
            try {
                const response = await fetch('/api/env')
                const env = await response.json()
                clientId.value = env.VITE_NAVER_CLIENT_ID || import.meta.env.VITE_NAVER_CLIENT_ID
            } catch (error) {
                console.warn(
                    '환경변수를 서버에서 가져올 수 없습니다. 빌드 시 환경변수를 사용합니다.',
                    error
                )
                clientId.value = import.meta.env.VITE_NAVER_CLIENT_ID
            }
        }

        if (!clientId.value) {
            console.error('VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.')
            $q.notify({ type: 'negative', message: '네이버 지도 키가 설정되지 않았습니다.' })
            return
        }

        await ensureNaverLoaded()
        initMap()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: '지도를 초기화하는 중 오류가 발생했습니다.' })
    } finally {
        loading.value = false
    }
})

function ensureNaverLoaded() {
    return new Promise((resolve, reject) => {
        if (globalThis.naver?.maps) {
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId.value}`
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('네이버 지도 스크립트 로드 실패'))
        document.head.appendChild(script)
    })
}

function initMap() {
    // 기본 센터: 서울 시청 근처
    const centerLat = 37.5665
    const centerLon = 126.9780

    map = new globalThis.naver.maps.Map('map', {
        center: new globalThis.naver.maps.LatLng(centerLat, centerLon),
        zoom: 13
    })

    infoWindow = new globalThis.naver.maps.InfoWindow({ anchorSkew: true })
}

// 기존 마커 제거
function clearMarkers() {
    markers.forEach(m => m.setMap(null))
    markers = []
}

// 주소 기반 주변 검색 호출
async function handleSearch() {
    const addr = address.value.trim()
    if (!addr) {
        $q.notify({ type: 'warning', message: '도로명 주소를 입력해 주세요.' })
        return
    }

    if (!map) {
        $q.notify({ type: 'negative', message: '지도가 아직 초기화되지 않았습니다.' })
        return
    }

    loading.value = true
    try {
        const res = await getNearbyRestaurants({
            address: addr,
            radius: radius.value || 0.1,
            limit: 50
        })

        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])

        if (!list.length) {
            clearMarkers()
            $q.notify({ type: 'info', message: '주변에 표시할 가게가 없습니다.' })
            return
        }

        updateMapWithRestaurants(list)
    } catch (e) {
        console.error('주변 가게 조회 실패:', e)
        $q.notify({ type: 'negative', message: e.message || '주변 가게 조회에 실패했습니다.' })
    } finally {
        loading.value = false
    }
}

// 조회된 식당 목록을 지도에 반영
function updateMapWithRestaurants(list) {
    clearMarkers()

    const valid = list.filter(
        it =>
            Number.isFinite(it?.lat) &&
            Number.isFinite(it?.lon) &&
            !(it.lat === 0 && it.lon === 0)
    )

    if (!valid.length) {
        $q.notify({
            type: 'warning',
            message: '좌표 정보가 있는 가게가 없어 지도를 표시할 수 없습니다.'
        })
        return
    }

    // 첫 번째 가게 기준으로 센터 이동
    const centerLat = valid[0].lat
    const centerLon = valid[0].lon
    map.setCenter(new globalThis.naver.maps.LatLng(centerLat, centerLon))
    map.setZoom(15)

    valid.forEach(r => {
        const marker = new globalThis.naver.maps.Marker({
            position: new globalThis.naver.maps.LatLng(r.lat, r.lon),
            map,
            title: r.restaurantName
        })
        markers.push(marker)

        const contentHtml =
            `<div style="padding:8px; line-height:1.4;">
        <div style="font-weight:600; margin-bottom:4px;">${escapeHtml(
                r.restaurantName || ''
            )}</div>
        <div style="color:#666;">${escapeHtml(r.address || '')}</div>
      </div>`

        globalThis.naver.maps.Event.addListener(marker, 'click', () => {
            infoWindow.setContent(contentHtml)
            infoWindow.open(map, marker)
        })
    })
}

// XSS 방지용 간단 이스케이프
function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
}
</script>
