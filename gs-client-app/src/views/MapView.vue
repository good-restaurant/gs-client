<template>
    <q-page class="q-pa-md">
        <div id="map" style="width:100%; height:80vh;"></div>
    </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const clientId = ref('')

onMounted(async () => {
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
        return
    }
    if (!globalThis.naver) {
        const script = document.createElement('script')
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId.value}`
        script.async = true
        script.onload = initMap
        document.head.appendChild(script)
    } else {
        initMap()
    }
})

function initMap() {
    const map = new globalThis.naver.maps.Map('map', {
        center: new globalThis.naver.maps.LatLng(37.5665, 126.978),
        zoom: 13,
    })

    const markers = [
        { name: '서울 삼겹살 명가', lat: 37.5651, lng: 126.98955 },
        { name: '한강 뷰 스시 오마카세', lat: 37.5509, lng: 126.9905 },
        { name: '파스타 이야기', lat: 37.5796, lng: 126.9769 },
    ]

    for (const m of markers) {
        const marker = new globalThis.naver.maps.Marker({
            position: new globalThis.naver.maps.LatLng(m.lat, m.lng),
            map,
            title: m.name,
        })

        const info = new globalThis.naver.maps.InfoWindow({
            content: `<div style="padding:8px;">${m.name}</div>`,
        })

        globalThis.naver.maps.Event.addListener(marker, 'click', () => {
            info.open(map, marker)
        })
    }
}
</script>
