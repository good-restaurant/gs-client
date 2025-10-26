<template>
    <q-page class="q-pa-md">
        <div class="relative-position" style="width: 100%; height: 80vh;">
            <div id="map" style="width: 100%; height: 100%;"></div>

            <!-- 로딩 스피너 -->
            <q-inner-loading :showing="loading">
                <q-spinner size="42px" />
                <div class="q-mt-sm">지도를 불러오는 중...</div>
            </q-inner-loading>
        </div>
    </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const clientId = ref('')

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
                console.warn('환경변수를 서버에서 가져올 수 없습니다. 빌드 시 환경변수를 사용합니다.', error)
                clientId.value = import.meta.env.VITE_NAVER_CLIENT_ID
            }
        }

        if (!clientId.value) {
            console.error('VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.')
            $q.notify({ type: 'negative', message: '네이버 지도 키가 설정되지 않았습니다.' })
            return
        }

        await ensureNaverLoaded()

        // 데이터 받아와서 지도/마커 렌더
        await renderMapWithData()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: '지도를 초기화하는 중 오류가 발생했습니다.' })
    } finally {
        loading.value = false
    }
})

const loading = ref(true)

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

/** 백엔드에서 데이터 조회 후 지도/마커 렌더 */
async function renderMapWithData() {
    const API_BASE = 'https://gs-main-api.i4624.info'
    const LIMIT = 100
    let list = []

    try {
        const resp = await fetch(`${API_BASE}/restaurant/all?limit=${LIMIT}`, {
            headers: { Accept: 'application/json' }
        })
        if (!resp.ok) {
            throw new Error(`API 응답 오류: ${resp.status}`)
        }
        const json = await resp.json()
        // 응답 형태 호환: 배열 또는 { data: [] }
        list = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : [])
    } catch (e) {
        console.error('식당 데이터 조회 실패:', e)
        $q.notify({ type: 'negative', message: '식당 데이터를 불러오지 못했습니다.' })
        list = []
    }

    // 이름 오름차순 정렬
    list.sort((a, b) => (a?.restaurantName || '').localeCompare(b?.restaurantName || '', 'ko'))

    // 유효 좌표만 필터
    const valid = list.filter(it => Number.isFinite(it?.lat) && Number.isFinite(it?.lon) && !(it.lat === 0 && it.lon === 0))

    // 센터 좌표: 첫 번째 유효 좌표, 없으면 서울시청 기본값
    const centerLat = valid[0]?.lat ?? 37.5665
    const centerLon = valid[0]?.lon ?? 126.9780

    // 지도 생성
    const map = new globalThis.naver.maps.Map('map', {
        center: new globalThis.naver.maps.LatLng(centerLat, centerLon),
        zoom: 13
    })

    // 인포윈도우는 하나만 사용(클릭마다 내용/위치 갱신)
    const info = new globalThis.naver.maps.InfoWindow({ anchorSkew: true })

    // 마커 생성
    for (const r of valid) {
        const marker = new globalThis.naver.maps.Marker({
            position: new globalThis.naver.maps.LatLng(r.lat, r.lon),
            map,
            title: r.restaurantName
        })

        const contentHtml =
            `<div style="padding:8px; line-height:1.4;">
         <div style="font-weight:600; margin-bottom:4px;">${escapeHtml(r.restaurantName || '')}</div>
         <div style="color:#666;">${escapeHtml(r.address || '')}</div>
       </div>`

        globalThis.naver.maps.Event.addListener(marker, 'click', () => {
            info.setContent(contentHtml)
            info.open(map, marker)
        })
    }

    // 유효 데이터가 없을 때 안내
    if (valid.length === 0) {
        $q.notify({ type: 'warning', message: '표시할 식당 데이터가 없습니다.' })
    }
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
