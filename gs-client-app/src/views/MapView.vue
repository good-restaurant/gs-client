<template>
  <q-page class="q-pa-md bg-white">
    <div class="column q-gutter-md">

      <!--상단 검색 카드-->
      <q-card flat bordered>
        <q-card-section>
          <!--상단 검색 영역 전체-->
          <div class="row items-center q-col-gutter-sm justify-between">

            <!--도로명 주소 입력-->
            <div class="col-12 col-md-12 no-wrap">
              <q-input v-model="address" dense outlined clearable label="주변 모범음식점 검색"
                placeholder="도로명 주소를 입력하세요 (예: 서울특별시 중구 세종대로 110)" @keyup.enter="handleSearch" style="width: 100%">
                <template #prepend>
                  <q-icon name="place" />
                </template>
              </q-input>
            </div>

            <!--버튼 및 선택 박스 영역-->
            <div class="col-12 col-md-12 row items-center justify-between">
              <q-btn color="primary" dense icon="search" label="검색" class="col-6 col-md-3" @click="handleSearch" />
              <q-btn color="secondary" dense icon="my_location" label="현재위치" class="col-6 col-md-3"
                @click="handleCurrentLocation" />
              <q-select v-model="radius" :options="radiusOptions" dense outlined emit-value map-options label="반경"
                class="col-6 col-md-3 q-gutter-md" />
              <q-select v-model="limit" :options="limitOptions" dense outlined emit-value map-options label="개수"
                class="col-6 col-md-3 q-gutter-md" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!--지도 카드-->
      <q-card flat bordered>
        <q-card-section class="q-pa-none">
          <div class="relative-position" style="width: 100%; height: 70vh;">
            <div id="map" style="width: 100%; height: 100%;"></div>

            <!--WMS 레이어 토글 버튼-->
            <q-btn
              :color="wmsLayerVisible ? 'primary' : 'grey'"
              :icon="wmsLayerVisible ? 'layers' : 'layers_off'"
              :label="wmsLayerVisible ? '지적편집도 표시' : '지적편집도 숨기기'"
              dense
              rounded
              class="absolute-top-right q-ma-md"
              style="z-index: 1000;"
              @click="toggleWMSLayer"
            />

            <!--로딩 스피너-->
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
import { getNearbyRestaurants, getRestaurantsByLocation } from '@/api/restaurantApi'
import { useQuasar } from 'quasar'
import { onMounted, ref } from 'vue'

const $q = useQuasar()

const clientId = ref('')
const loading = ref(true)
const wmsLayerVisible = ref(true) // WMS 레이어 표시 여부

// 검색 폼 상태
const address = ref('')
const radius = ref(0.1) // km 단위라고 가정(백엔드 기본값과 동일)
const limit = ref(20) // 기본 표시 개수

// 반경 선택 옵션
const radiusOptions = [
  { label: '100m', value: 0.1 },
  { label: '300m', value: 0.3 },
  { label: '500m', value: 0.5 },
  { label: '1km', value: 1.0 }
]

// 개수 제한 옵션
const limitOptions = [
  { label: '10개', value: 10 },
  { label: '20개', value: 20 },
  { label: '30개', value: 30 },
  { label: '50개', value: 50 },
  { label: '100개', value: 100 }
]

// 지도/마커 상태
let map = null
let infoWindow = null
let markers = []
let currentLocationMarker = null
let wmsOverlay = null // WMS 오버레이 전역 변수

// WMS 설정
const wmsUrl = 'https://geoserver.i4624.info/geoserver/test_geoserver/wms'
const wmsLayer = 'test_geoserver:tileset-combined' // 레이어 이름

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
    await ensureProj4Loaded()
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

function ensureProj4Loaded() {
  return new Promise((resolve, reject) => {
    if (globalThis.proj4) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/proj4@2.9.2/dist/proj4.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('proj4 로드 실패'))
    document.head.appendChild(s)
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

  //========================================================================
  // GeoServer WMS Overlay
  // proj4가 로드되었는지 확인
  if (!globalThis.proj4) {
    console.error('proj4가 로드되지 않았습니다.')
    return
  }

  // 네이버 기본 위경도(EPSG:4326) <-> GeoServer(EPSG:5186) 변환좌표
  globalThis.proj4.defs(
    'EPSG:5186',
    '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs'
  )

  // 지도 이벤트 리스너 추가
  map.addListener('bounds_changed', updateWMSOverlay)
  map.addListener('zoom_changed', updateWMSOverlay)
  
  // 초기 WMS 오버레이 생성
  setTimeout(updateWMSOverlay, 500)
  
  console.log('GeoServer WMS 오버레이가 추가되었습니다.')
}

// 지도 bounds 변경 시 WMS 이미지 업데이트
function updateWMSOverlay() {
  // 지도가 초기화되지 않았거나 WMS 레이어가 비활성화되어 있으면 업데이트하지 않음
  if (!map || !wmsLayerVisible.value) {
    return
  }
  
  try {
    const bounds = map.getBounds()
      const sw = bounds.getSW() // 남서쪽 (min)
      const ne = bounds.getNE() // 북동쪽 (max)
      
      // 네이버 지도 bounds (EPSG:4326) - 네이버 지도는 EPSG:4326 사용
      const swLat = sw.lat()
      const swLng = sw.lng()
      const neLat = ne.lat()
      const neLng = ne.lng()
      
      // GeoServer가 자동으로 좌표계를 변환하도록 EPSG:4326으로 요청
      // bbox는 minX, minY, maxX, maxY 순서 (WMS 표준)
      // EPSG:4326에서는 lng, lat 순서로 minLng, minLat, maxLng, maxLat
      const bbox = [swLng, swLat, neLng, neLat].join(',')
      const mapSize = map.getSize()
      const width = mapSize.width || 800
      const height = mapSize.height || 600
      
      // GeoServer가 정상 응답하는 형식으로 URL 생성
      // GeoServer가 EPSG:4326으로 자동 변환해주므로 SRS=EPSG:4326 사용
      const url = `${wmsUrl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap`
        + `&FORMAT=image%2Fpng`  // 투명도 지원을 위해 png 사용
        + `&TRANSPARENT=true`
        + `&STYLES`  // 값 없이 파라미터만
        + `&LAYERS=${encodeURIComponent(wmsLayer)}`
        + `&EXCEPTIONS=application%2Fvnd.ogc.se_inimage`
        + `&SRS=EPSG%3A4326`  // 네이버 지도와 동일한 좌표계 사용
        + `&WIDTH=${width}&HEIGHT=${height}`
        + `&BBOX=${encodeURIComponent(bbox)}`
      
        // 레이어 테스트용 콘솔 로그
    //   console.log('WMS URL 업데이트:', url)
    //   console.log('네이버 지도 Bounds (EPSG:4326):', { 
        // sw: `${swLat},${swLng}`, 
        // ne: `${neLat},${neLng}` 
      // })
      // console.log('WMS BBOX (EPSG:4326):', bbox)
      
      // 기존 오버레이 제거
      if (wmsOverlay) {
        wmsOverlay.setMap(null)
      }
      
      // 새로운 오버레이 생성
      const overlayImage = document.createElement('img')
      overlayImage.src = url
      overlayImage.style.opacity = '0.6'
      overlayImage.style.pointerEvents = 'none'
      overlayImage.onerror = (e) => {
        console.error('WMS 이미지 로드 실패:', url, e)
      }
      overlayImage.onload = () => {
        console.log('WMS 이미지 로드 성공')
      }
      
      // 네이버 지도 bounds를 클로저로 저장 (이미지 배치용)
      // WMS 이미지는 네이버 지도의 bounds에 정확히 맞춰서 배치
      const boundsForOverlay = { 
        sw: new globalThis.naver.maps.LatLng(swLat, swLng),
        ne: new globalThis.naver.maps.LatLng(neLat, neLng)
      }
      
      wmsOverlay = new globalThis.naver.maps.OverlayView()
      wmsOverlay.onAdd = function() {
        const panes = this.getPanes()
        panes.overlayLayer.appendChild(overlayImage)
      }
      wmsOverlay.draw = function() {
        try {
          const projection = this.getProjection()
          const mapSize = map.getSize()
          
          // 네이버 지도 API에서 좌표를 픽셀로 변환
          // 네이버 지도는 fromCoordToOffset 메서드를 사용
          // LatLng를 Point로 변환 후 사용
          const swCoord = new globalThis.naver.maps.Point(
            boundsForOverlay.sw.lng(),
            boundsForOverlay.sw.lat()
          )
          const neCoord = new globalThis.naver.maps.Point(
            boundsForOverlay.ne.lng(),
            boundsForOverlay.ne.lat()
          )
          
          // projection이 존재하고 메서드가 있는지 확인
          if (projection && typeof projection.fromCoordToOffset === 'function') {
            const swOffset = projection.fromCoordToOffset(swCoord)
            const neOffset = projection.fromCoordToOffset(neCoord)
            
            // 이미지 위치와 크기 설정
            overlayImage.style.position = 'absolute'
            overlayImage.style.left = swOffset.x + 'px'
            overlayImage.style.top = neOffset.y + 'px'
            overlayImage.style.width = Math.abs(neOffset.x - swOffset.x) + 'px'
            overlayImage.style.height = Math.abs(swOffset.y - neOffset.y) + 'px'
          } else {
            // 대체 방법: 지도 bounds를 기준으로 직접 계산
            const mapBounds = map.getBounds()
            const swBounds = mapBounds.getSW()
            const neBounds = mapBounds.getNE()
            
            const lngRatio = (boundsForOverlay.sw.lng() - swBounds.lng()) / (neBounds.lng() - swBounds.lng())
            const latRatioSW = (neBounds.lat() - boundsForOverlay.sw.lat()) / (neBounds.lat() - swBounds.lat())
            const lngRatioNE = (boundsForOverlay.ne.lng() - swBounds.lng()) / (neBounds.lng() - swBounds.lng())
            const latRatioNE = (neBounds.lat() - boundsForOverlay.ne.lat()) / (neBounds.lat() - swBounds.lat())
            
            overlayImage.style.position = 'absolute'
            overlayImage.style.left = (lngRatio * mapSize.width) + 'px'
            overlayImage.style.top = (latRatioSW * mapSize.height) + 'px'
            overlayImage.style.width = ((lngRatioNE - lngRatio) * mapSize.width) + 'px'
            overlayImage.style.height = ((latRatioSW - latRatioNE) * mapSize.height) + 'px'
          }
        } catch (error) {
          console.error('오버레이 draw 오류:', error)
          // 오류 발생 시 전체 지도 크기로 설정
          const mapSize = map.getSize()
          overlayImage.style.position = 'absolute'
          overlayImage.style.left = '0px'
          overlayImage.style.top = '0px'
          overlayImage.style.width = mapSize.width + 'px'
          overlayImage.style.height = mapSize.height + 'px'
        }
      }
      wmsOverlay.onRemove = function() {
        if (overlayImage && overlayImage.parentNode) {
          overlayImage.remove()
        }
      }
      
      wmsOverlay.setMap(map)
    } catch (error) {
      console.error('WMS 오버레이 업데이트 오류:', error)
    }
  }

// WMS 레이어 토글 함수
function toggleWMSLayer() {
  wmsLayerVisible.value = !wmsLayerVisible.value
  
  if (wmsLayerVisible.value) {
    // 레이어 표시
    if (wmsOverlay) {
      wmsOverlay.setMap(map)
    } else if (map) {
      // 오버레이가 없으면 업데이트 함수 호출
      updateWMSOverlay()
    }
    $q.notify({ type: 'positive', message: 'WMS 레이어가 표시됩니다.' })
  } else {
    // 레이어 숨김
    if (wmsOverlay) {
      wmsOverlay.setMap(null)
    }
    $q.notify({ type: 'info', message: 'WMS 레이어가 숨겨집니다.' })
  }
}

// 기존 마커 제거
function clearMarkers() {
  markers.forEach(m => m.setMap(null))
  markers = []
}

// 현재 위치 마커 제거
function clearCurrentLocationMarker() {
  if (currentLocationMarker) {
    currentLocationMarker.setMap(null)
    currentLocationMarker = null
  }
}

// 현재 위치 마커 표시
function showCurrentLocationMarker(lat, lon) {
  clearCurrentLocationMarker()

  currentLocationMarker = new globalThis.naver.maps.Marker({
    position: new globalThis.naver.maps.LatLng(lat, lon),
    map,
    title: '현재 위치',
    icon: {
      content: `
                <div style="
                    width: 20px;
                    height: 20px;
                    background-color: #4285F4;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
            `,
      anchor: new globalThis.naver.maps.Point(10, 10)
    }
  })

  // 현재 위치로 지도 이동
  map.setCenter(new globalThis.naver.maps.LatLng(lat, lon))
  map.setZoom(15)
}

// 현재 위치 가져오기
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        resolve({ lat, lon })
      },
      (error) => {
        let message = '위치 정보를 가져올 수 없습니다.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '위치 정보 사용 권한이 거부되었습니다.'
            break
          case error.POSITION_UNAVAILABLE:
            message = '위치 정보를 사용할 수 없습니다.'
            break
          case error.TIMEOUT:
            message = '위치 정보 요청 시간이 초과되었습니다.'
            break
        }
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

// 현재 위치 기반 검색
async function handleCurrentLocation() {
  if (!map) {
    $q.notify({ type: 'negative', message: '지도가 아직 초기화되지 않았습니다.' })
    return
  }

  loading.value = true
  try {
    // 현재 위치 가져오기
    const location = await getCurrentLocation()

    // 현재 위치 마커 표시
    showCurrentLocationMarker(location.lat, location.lon)

    // radius를 km에서 m로 변환 (API는 미터 단위)
    const radiusInMeters = (radius.value || 0.1) * 1000

    // 현재 위치 기반 식당 검색
    const res = await getRestaurantsByLocation({
      lat: location.lat,
      lon: location.lon,
      radius: radiusInMeters,
      limit: limit.value || 20
    })

    const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])

    if (!list.length) {
      clearMarkers()
      $q.notify({ type: 'info', message: '주변에 표시할 가게가 없습니다.' })
      return
    }

    updateMapWithRestaurants(list)
    $q.notify({ type: 'positive', message: '현재 위치 기준으로 주변 식당을 검색했습니다.' })
  } catch (e) {
    console.error('현재 위치 검색 실패:', e)
    $q.notify({ type: 'negative', message: e.message || '현재 위치 검색에 실패했습니다.' })
  } finally {
    loading.value = false
  }
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

  // 주소 검색 시 현재 위치 마커 제거
  clearCurrentLocationMarker()

  loading.value = true
  try {
    const res = await getNearbyRestaurants({
      address: addr,
      radius: radius.value || 0.1,
      limit: limit.value || 20
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
    <div style="font-weight:600; margin-bottom:4px;">${escapeHtml(r.restaurantName || '')}</div>
    <div style="color:#666;">${escapeHtml(r.address || '')}</div>
    <div style="margin-top:8px;">
      <a
        href="/restaurants/${encodeURIComponent(r.id)}"
        style="display:inline-block;padding:6px 10px;background:#1976d2;color:#fff;border-radius:4px;text-decoration:none;"
      >상세 페이지 이동하기</a>
    </div>
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

<!--<template>
  <q-page class="q-pa-md bg-white">
    <div class="column q-gutter-md">

      &lt;!&ndash; 상단 검색 카드 &ndash;&gt;
      <q-card flat bordered>
        <q-card-section>
          <div class="row items-center q-col-gutter-sm justify-between">

            &lt;!&ndash; 주소 입력 &ndash;&gt;
            <div class="col-12 col-md-12 no-wrap">
              <q-input
                  v-model="address"
                  dense
                  outlined
                  clearable
                  label="주변 모범음식점 검색"
                  placeholder="도로명 주소를 입력하세요 (예: 서울특별시 중구 세종대로 110)"
                  @keyup.enter="handleSearch"
                  style="width: 100%"
              >
                <template #prepend>
                  <q-icon name="place"/>
                </template>
              </q-input>
            </div>

            &lt;!&ndash; 버튼 및 선택 박스 &ndash;&gt;
            <div class="col-12 col-md-12 row items-center justify-between">
              <q-btn
                  color="primary"
                  dense
                  icon="search"
                  label="검색"
                  class="col-6 col-md-3"
                  @click="handleSearch"
              />
              <q-btn
                  color="secondary"
                  dense icon="my_location"
                  label="현재위치"
                  class="col-6 col-md-3"
                  @click="handleCurrentLocation"/>
              <q-select
                  v-model="radius"
                  :options="radiusOptions"
                  dense
                  outlined
                  emit-value
                  map-options
                  label="반경"
                  class="col-6 col-md-3 q-gutter-md"
              />
              <q-select
                  v-model="limit"
                  :options="limitOptions"
                  dense
                  outlined
                  emit-value
                  map-options
                  label="개수"
                  class="col-6 col-md-3 q-gutter-md"/>
            </div>
          </div>
        </q-card-section>
      </q-card>

      &lt;!&ndash; 지도 카드 &ndash;&gt;
      <q-card flat bordered>
        <q-card-section class="q-pa-none">
          <div class="relative-position" style="width: 100%; height: 70vh;">
            <div id="map" style="width: 100%; height: 100%;"></div>

            &lt;!&ndash; 로딩 스피너 &ndash;&gt;
            <q-inner-loading :showing="loading">
              <q-spinner size="42px"/>
              <div class="q-mt-sm">지도를 불러오는 중...</div>
            </q-inner-loading>
          </div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<script setup>
import {getNearbyRestaurants, getRestaurantsByLocation} from '@/api/restaurantApi'
import {useQuasar} from 'quasar'
import {onMounted, ref} from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import ImageLayer from 'ol/layer/Image'
import ImageWMS from 'ol/source/ImageWMS'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import {Icon, Style} from 'ol/style'
import Overlay from 'ol/Overlay'
import {fromLonLat} from 'ol/proj'

const $q = useQuasar()
const loading = ref(true)

// 검색 상태
const address = ref('')
const radius = ref(0.1)
const limit = ref(20)
const radiusOptions = [
  {label: '100m', value: 0.1},
  {label: '300m', value: 0.3},
  {label: '500m', value: 0.5},
  {label: '1km', value: 1.0}
]
const limitOptions = [
  {label: '10개', value: 10},
  {label: '20개', value: 20},
  {label: '30개', value: 30},
  {label: '50개', value: 50},
  {label: '100개', value: 100}
]

// 지도 상태
let map = null
let markerLayer = null
let popupOverlay = null

onMounted(() => {
  initMap()
  loading.value = false
})

function initMap() {
  // 1) 기본 지도
  const baseLayer = new TileLayer({
    source: new XYZ({
      url: 'https://api.vworld.kr/req/wmts/1.0.0/3ABE0F93-6B61-33E6-9B60-2122EB5FC9E0/Base/{z}/{y}/{x}.png'
    })
  })

  // 2) WMS 레이어
  const wmsLayer = new ImageLayer({
    source: new ImageWMS({
      url: 'https://geoserver.i4624.info/geoserver/test_geoserver/wms',
      params: {
        LAYERS: 'test_geoserver:seoul_group',
        FORMAT: 'image/png',
        TRANSPARENT: true,
        SRS: 'EPSG:3857'
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    }),
    opacity: 0.6
  })

  // 3) 마커 레이어
  markerLayer = new VectorLayer({
    source: new VectorSource()
  })

  // 4) Map 생성
  map = new Map({
    target: 'map',
    layers: [baseLayer, wmsLayer, markerLayer],
    view: new View({
      center: fromLonLat([126.9780, 37.5665]),
      zoom: 13,
      minZoom: 7,
      maxZoom: 19
    })
  })

  // 5) 팝업 Overlay
  const popupEl = document.createElement('div')
  popupEl.style.background = 'white'
  popupEl.style.padding = '8px'
  popupEl.style.borderRadius = '4px'
  popupEl.style.border = '1px solid #333'

  popupOverlay = new Overlay({
    element: popupEl,
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -10]
  })
  map.addOverlay(popupOverlay)

  map.on('singleclick', (evt) => {
    map.forEachFeatureAtPixel(evt.pixel, (feature) => {
      const props = feature.getProperties()
      if (props.name) {
        popupEl.innerHTML = `<strong>${props.name}</strong><br>${props.address || ''}`
        popupOverlay.setPosition(evt.coordinate)
      }
    })
  })
}

// 마커 초기화
function clearMarkers() {
  markerLayer.getSource().clear()
}

// 마커 추가
function addMarker(lon, lat, name, address) {
  const feature = new Feature({
    geometry: new Point(fromLonLat([lon, lat])),
    name,
    address
  })
  feature.setStyle(new Style({
    image: new Icon({
      src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      scale: 0.05
    })
  }))
  markerLayer.getSource().addFeature(feature)
}

// 현재 위치 가져오기
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('브라우저에서 위치 정보 지원 불가')
    navigator.geolocation.getCurrentPosition(
        (pos) => resolve({lat: pos.coords.latitude, lon: pos.coords.longitude}),
        (err) => reject(err),
        {enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
    )
  })
}

// 현재 위치 버튼
async function handleCurrentLocation() {
  loading.value = true
  try {
    const loc = await getCurrentLocation()
    map.getView().setCenter(fromLonLat([loc.lon, loc.lat]))
    map.getView().setZoom(15)
    addMarker(loc.lon, loc.lat, '현재 위치')
    const radiusInMeters = (radius.value || 0.1) * 1000
    const res = await getRestaurantsByLocation({
      lat: loc.lat,
      lon: loc.lon,
      radius: radiusInMeters,
      limit: limit.value || 20
    })
    updateMapWithRestaurants(res)
    $q.notify({type: 'positive', message: '현재 위치 기준으로 주변 식당 검색 완료'})
  } catch (e) {
    console.error(e)
    $q.notify({type: 'negative', message: '현재 위치 검색 실패'})
  } finally {
    loading.value = false
  }
}

// 주소 검색
async function handleSearch() {
  const addr = address.value.trim()
  if (!addr) return $q.notify({type: 'warning', message: '주소를 입력해주세요.'})
  loading.value = true
  try {
    const res = await getNearbyRestaurants({
      address: addr,
      radius: radius.value || 0.1,
      limit: limit.value || 20
    })
    updateMapWithRestaurants(res)
  } catch (e) {
    console.error(e)
    $q.notify({type: 'negative', message: '주변 식당 조회 실패'})
  } finally {
    loading.value = false
  }
}

// 지도에 식당 표시
function updateMapWithRestaurants(list) {
  clearMarkers()
  const valid = list.filter(it => Number.isFinite(it?.lat) && Number.isFinite(it?.lon))
  if (!valid.length) return $q.notify({type: 'info', message: '좌표 정보가 있는 가게가 없습니다.'})
  const center = valid[0]
  map.getView().setCenter(fromLonLat([center.lon, center.lat]))
  map.getView().setZoom(15)
  valid.forEach(r => addMarker(r.lon, r.lat, r.restaurantName || '', r.address || ''))
}
</script>-->
