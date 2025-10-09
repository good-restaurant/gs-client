<template>
    <q-page class="q-pa-md">
        <div id="map" style="width:100%; height:80vh;"></div>
    </q-page>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID
    if (!window.naver) {
        const script = document.createElement('script')
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`
        script.async = true
        script.onload = initMap
        document.head.appendChild(script)
    } else {
        initMap()
    }

    function initMap() {
        const map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(37.5665, 126.9780),
            zoom: 13,
        })

        const markers = [
            { name: '서울 삼겹살 명가', lat: 37.5651, lng: 126.98955 },
            { name: '한강 뷰 스시 오마카세', lat: 37.5509, lng: 126.9905 },
            { name: '파스타 이야기', lat: 37.5796, lng: 126.9769 },
        ]

        markers.forEach((m) => {
            const marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(m.lat, m.lng),
                map,
                title: m.name,
            })

            const info = new naver.maps.InfoWindow({
                content: `<div style="padding:8px;">${m.name}</div>`,
            })

            naver.maps.Event.addListener(marker, 'click', () => {
                info.open(map, marker)
            })
        })
    }
})
</script>
