<!-- src/views/RestaurantListView.vue -->
<template>
  <q-page class="q-pa-md bg-white">
    <div class="column q-gutter-md">

      <!-- 상단 히어로 / 요약 영역 -->
      <q-card flat bordered class="list-hero">
        <q-card-section class="row items-center justify-between no-wrap">
          <div class="row items-center q-gutter-md">
            <q-avatar size="56px" color="primary" text-color="white" class="list-hero__avatar">
              <q-icon name="restaurant" size="30px" />
            </q-avatar>

            <div>
              <div class="text-h5 text-weight-bold text-primary">
                모범음식점 목록
              </div>
            </div>
          </div>

          <div class="column items-end q-gutter-sm">
            <q-chip square color="white" text-color="primary" icon="store" class="text-weight-medium">
              총 {{ rows.length }}곳
            </q-chip>
          </div>
        </q-card-section>
      </q-card>

      <!-- 실제 목록 카드 -->
      <q-card flat bordered class="bg-white">
        <!-- 검색 / 필터 영역 -->
        <q-card-section class="row items-center q-col-gutter-sm q-pb-none">
          <q-input dense outlined v-model="search" placeholder="이름 / 주소 / 카테고리 검색" clearable class="col-12 col-md-5"
            prepend-inner-icon="search" @keyup.enter="triggerSearch" />
          <!-- ↑ 검색창 내부 스피너 제거 -->

          <q-select dense outlined v-model="categoryFilter" :options="categoryOptions" class="col-12 col-md-3"
            emit-value map-options :option-label="opt => opt.label" :option-value="opt => opt.value" clear-icon="close"
            label="카테고리 필터" :disable="loading || searching">
            <template #prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>

          <q-space />

          <q-btn flat icon="refresh" label="새로고침" @click="load" :disable="loading || searching" />
        </q-card-section>

        <q-card-section class="row q-col-gutter-sm q-pt-sm">
          <!-- 시도(Province) -->
          <q-select class="col-12 col-md-3" dense outlined use-input input-debounce="200" v-model="selectedProvince"
            :options="provinceOptions" :loading="addrLoading" label="시/도" hint="예) 서울특별시" clearable
            @filter="filterProvince" @update:model-value="onProvinceChange" />

          <!-- 시/구(City) -->
          <div class="col-12 col-md-3">
            <q-select dense outlined use-input input-debounce="200" v-model="selectedCity"
              :options="cityOptions" :loading="addrLoading" label="시/구" hint="예) 강남구"
              clearable @filter="filterCity" @update:model-value="onCityChange">
              <template #prepend>
                <q-icon name="info" color="grey-6" size="sm">
                  <q-tooltip class="bg-grey-9" :offset="[0, 8]">
                    <div class="text-body2" style="max-width: 300px; white-space: normal;">
                      <div class="text-weight-bold q-mb-xs">구 단위 주소 조회 안내</div>
                      <div class="text-body2">
                        • "부천시 소사구"와 같이 시와 구가 함께 표시되는 경우<br/>
                        &nbsp;&nbsp;데이터에는 "부천시"만 저장되어 있어 시 단위로 검색됩니다.<br/>
                        • 서울특별시와 같은 광역 자치시의 경우 구 단위로 검색됩니다.<br/>
                      </div>
                    </div>
                  </q-tooltip>
                </q-icon>
              </template>
            </q-select>
          </div>

          <!-- 동/읍/면(Town/EMD) -->
          <div class="col-12 col-md-3">
            <q-select ref="townSelectRef" dense outlined use-input input-debounce="200" v-model="selectedTown"
              :options="townOptions" :loading="addrLoading" label="동/읍/면" hint="예) 역삼1동"
              clearable @filter="filterTown" @update:model-value="onTownChange">
              <template #prepend>
                <q-icon name="info" color="grey-6" size="sm">
                  <q-tooltip class="bg-grey-9" :offset="[0, 8]">
                    <div class="text-body2" style="max-width: 300px; white-space: normal;">
                      <div class="text-weight-bold q-mb-xs">동/읍/면 단위 검색 안내</div>
                      <div class="text-body2">
                        • 해당 동/읍/면에 해당되는 가게가 없으면<br/>
                        &nbsp;&nbsp;임의의 결과가 반환됩니다.
                      </div>
                    </div>
                  </q-tooltip>
                </q-icon>
              </template>
            </q-select>
          </div>

          <!-- 적용 버튼 (기존 흐름 보존, 최소 변경) -->
          <div class="col-auto q-ml-sm">
            <q-btn size="md" color="primary" label="주소필터 적용" :disable="addrApplyDisabled" @click="applyAddressFilter" />
          </div>
        </q-card-section>

        <!-- 최근 검색어 영역 (칩 UI) -->
        <q-card-section v-if="recentSearches.length" class="recent-section q-pt-sm q-pb-sm">
          <div class="row items-center no-wrap">
            <!-- 왼쪽: 칩들 -->
            <div class="col">
              <div class="row items-center q-gutter-xs recent-chip-row">
                <q-chip v-for="keyword in recentSearches" :key="keyword" dense clickable outline color="primary"
                  text-color="primary" class="recent-chip" @click="applyRecent(keyword)">
                  <q-icon name="history" size="14px" class="q-mr-xs text-grey-6" />
                  <span class="ellipsis">{{ keyword }}</span>
                  <q-icon name="close" size="14px" class="q-ml-xs text-grey-5" @click.stop="removeRecent(keyword)" />
                </q-chip>
              </div>
            </div>

            <!-- 오른쪽: 전체 삭제 버튼 -->
            <div class="col-auto">
              <q-btn flat dense size="sm" class="text-primary" icon="delete_outline" label="전체 삭제"
                @click="clearRecent" />
            </div>
          </div>
        </q-card-section>

        <q-separator spaced />

        <!-- 리스트 영역 -->
        <q-card-section class="q-pt-none">
          <q-inner-loading :showing="loading">
            <q-spinner size="50px" />
          </q-inner-loading>

          <q-list bordered separator v-if="!loading && filtered.length" class="rounded-borders">
            <q-item v-for="(r, idx) in filtered" :key="r.id" clickable class="restaurant-item" @click="goDetail(r.id)">
              <!-- 번호 -->
              <q-item-section side class="gt-sm">
                <q-badge color="grey-3" text-color="grey-8" class="text-weight-medium">
                  {{ idx + 1 }}
                </q-badge>
              </q-item-section>

              <!-- 본문 -->
              <q-item-section>
                <q-item-label class="text-weight-medium text-body1" v-html="highlight(r.restaurantName || '이름 없음')" />
                <q-item-label caption class="text-grey-7 q-mt-xs" v-html="highlight(r.address || '-')" />
                <div class="row items-center q-gutter-xs q-mt-xs">
                  <q-chip v-if="r.category" dense size="sm" color="primary" text-color="white" icon="local_dining">
                    {{ CATEGORY_LABEL_MAP[r.category] || r.category }}
                  </q-chip>
                  <q-chip v-if="r.lat && r.lon" dense size="sm" outline color="grey-6" icon="place">
                    {{ r.lat }}, {{ r.lon }}
                  </q-chip>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else-if="!loading" class="text-grey text-center q-mt-xl">
            표시할 데이터가 없습니다. <br />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import {
  getRestaurantsByAddress,
  getTownListByCity,
  listRandomRestaurants,
  searchCity,
  searchProvince,
  searchRestaurants,
  searchTown
} from '@/api/restaurantApi'
import { useQuasar } from 'quasar'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// 카테고리 정의
const CATEGORY_LABEL_MAP = {
  ETC: '기타',
  KOREAN: '한식',
  CHINESE: '중식',
  JAPANESE: '일식',
  WESTERN: '양식'
}

// 최근 검색어 저장 키
const RECENT_SEARCH_KEY = 'goodrestaurant_recent_searches'

const $q = useQuasar()
const router = useRouter()

const loading = ref(false)
const searching = ref(false)
const search = ref('')
const rows = ref([])

const searchDebounceTimer = ref(null)

// 최근 검색어 목록
const recentSearches = ref([])

// 카테고리 필터
const categoryFilter = ref('all')
const categoryOptions = computed(() => {
  const set = new Set()
  rows.value.forEach(r => {
    if (r.category) set.add(r.category)
  })
  const list = Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
  return [
    { label: '전체 카테고리', value: 'all' },
    ...list.map(c => ({
      label: CATEGORY_LABEL_MAP[c] || c,
      value: c
    }))
  ]
})

const filtered = computed(() => {
  const q = (search.value ?? '').trim().toLowerCase()
  const cat = categoryFilter.value

  const filteredList = rows.value.filter(r => {
    const name = (r.restaurantName || '').toLowerCase()
    const category = (r.category || '').toLowerCase()
    const addr = (r.address || '').toLowerCase()

    const matchSearch =
      !q || name.includes(q) || category.includes(q) || addr.includes(q)

    const matchCategory =
      cat === 'all' || (r.category && r.category === cat)

    return matchSearch && matchCategory
  })

  // 이름 매칭 → 주소 매칭 → 그 외, 각 그룹 내에서는 이름 가나다순
  return filteredList.sort((a, b) => {
    const qLower = q

    const aName = (a.restaurantName || '').toLowerCase()
    const bName = (b.restaurantName || '').toLowerCase()
    const aAddr = (a.address || '').toLowerCase()
    const bAddr = (b.address || '').toLowerCase()

    const aMatchName = qLower && aName.includes(qLower)
    const bMatchName = qLower && bName.includes(qLower)
    if (aMatchName && !bMatchName) return -1
    if (!aMatchName && bMatchName) return 1

    const aMatchAddr = qLower && aAddr.includes(qLower)
    const bMatchAddr = qLower && bAddr.includes(qLower)
    if (aMatchAddr && !bMatchAddr) return -1
    if (!aMatchAddr && bMatchAddr) return 1

    return String(a.restaurantName || '').localeCompare(
      String(b.restaurantName || ''),
      'ko'
    )
  })
})

onMounted(() => {
  loadRecentSearches()
  load()
})

watch(search, async v => {
  const raw = v ?? ''
  const text = raw.trim()

  // X 버튼 등으로 완전히 비워졌을 때
  if (!raw) {
    if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
    searching.value = false
    await load()
    return
  }

  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
  searching.value = true
  searchDebounceTimer.value = setTimeout(async () => {
    await load()
    searching.value = false
  }, 1000)
})

async function triggerSearch() {
  const text = (search.value ?? '').trim()

  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)

  if (!text) {
    searching.value = false
    await load()
    return
  }

  searching.value = true
  await load()
  searching.value = false
}

async function load() {
  loading.value = true
  try {
    const qRaw = search.value ?? ''
    const q = qRaw.trim()

    if (q) {
      rows.value = await searchRestaurants(q, 100)
      addRecentSearch(q) // 검색 성공 시 최근 검색어에 추가
    } else {
      rows.value = await listRandomRestaurants(100)
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message || '목록 조회 실패' })
  } finally {
    loading.value = false
  }
}

function goDetail(id) {
  if (!id) return
  router.push({ name: 'restaurant-detail', params: { id } })
}

/* ========= 최근 검색어 관련 함수들 ========= */

function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY)
    const data = raw ? JSON.parse(raw) : []
    if (Array.isArray(data)) {
      recentSearches.value = data
    }
  } catch (e) {
    recentSearches.value = []
  }
}

function saveRecentSearches() {
  try {
    localStorage.setItem(
      RECENT_SEARCH_KEY,
      JSON.stringify(recentSearches.value)
    )
  } catch (e) {
    // 로컬스토리지 막혀 있어도 앱이 깨지진 않게 무시
  }
}

function addRecentSearch(keyword) {
  const k = keyword.trim()
  if (!k) return

  const list = recentSearches.value.filter(item => item !== k)
  list.unshift(k)
  recentSearches.value = list.slice(0, 10) // 최대 10개까지
  saveRecentSearches()
}

function applyRecent(keyword) {
  search.value = keyword
  triggerSearch()
}

function removeRecent(keyword) {
  recentSearches.value = recentSearches.value.filter(k => k !== keyword)
  saveRecentSearches()
}

function clearRecent() {
  recentSearches.value = []
  saveRecentSearches()
}

/* ========= 하이라이트 관련 ========= */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlight(text) {
  const base = text ?? ''
  const q = (search.value ?? '').trim()
  if (!q) return escapeHtml(base)

  const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escapedQuery, 'gi')
  const matches = base.match(regex)
  if (!matches) return escapeHtml(base)

  const parts = base.split(regex)
  let result = ''
  parts.forEach((part, idx) => {
    result += escapeHtml(part)
    if (idx < matches.length) {
      result += `<span class="text-negative text-weight-bold">${escapeHtml(
        matches[idx]
      )}</span>`
    }
  })
  return result
}
const addrLoading = ref(false);
const selectedProvince = ref(null);
const selectedCity = ref(null);
const selectedTown = ref(null);

const provinceOptions = ref([]);
const cityOptions = ref([]);
const townOptions = ref([]);

const townSelectRef = ref(null);

// 주소 필터 적용 버튼 활성/비활성
const addrApplyDisabled = computed(() => {
  // 시/도만 선택해도 적용 가능(광역 단위 조회), 시/구만 선택도 가능
  // 동까지 입력하면 클라이언트에서 한 번 더 필터링
  return !selectedProvince.value && !selectedCity.value && !selectedTown.value;
});

// --- [자동완성 필터러] ---
async function filterProvince(val, update) {
  if (!val) { update(() => (provinceOptions.value = [])); return; }
  addrLoading.value = true;
  const list = await searchProvince(val, 20); // 문자열 배열 응답
  update(() => { provinceOptions.value = Array.isArray(list) ? list : (list?.data ?? []); });
  addrLoading.value = false;
}

async function filterCity(val, update) {
  if (!val) { update(() => (cityOptions.value = [])); return; }
  addrLoading.value = true;
  const list = await searchCity(val, 20);
  update(() => { cityOptions.value = Array.isArray(list) ? list : (list?.data ?? []); });
  addrLoading.value = false;
}

async function filterTown(val, update) {
  if (!val) { 
    // 빈 값일 때: 시/구가 선택되어 있으면 시/구 기반 목록 표시, 없으면 빈 배열
    if (selectedCity.value) {
      addrLoading.value = true;
      try {
        const list = await getTownListByCity(selectedCity.value);
        update(() => { townOptions.value = Array.isArray(list) ? list : (list?.data ?? []); });
      } catch (e) {
        update(() => { townOptions.value = []; });
      } finally {
        addrLoading.value = false;
      }
    } else {
      update(() => { townOptions.value = []; });
    }
    return; 
  }
  
  addrLoading.value = true;
  
  // 시/구가 선택되어 있고 1글자일 때는 시/구 기반 목록 조회, 그 외에는 검색 API 사용
  const trimmedVal = val.trim();
  let list;
  if (selectedCity.value && trimmedVal.length === 1) {
    // 시/구가 선택되어 있고 1글자일 때: 시/구 기반 목록 조회
    list = await getTownListByCity(selectedCity.value);
  } else {
    // 그 외: 기존 검색 API 사용
    list = await searchTown(val, 20);
  }
  
  update(() => { townOptions.value = Array.isArray(list) ? list : (list?.data ?? []); });
  addrLoading.value = false;
}

// --- [선택 체인지 핸들러] ---
function onProvinceChange() {
  // 상위가 바뀌면 하위 초기화
  selectedCity.value = null;
  selectedTown.value = null;
  cityOptions.value = [];
  townOptions.value = [];
}
async function onCityChange() {
  selectedTown.value = null;
  townOptions.value = [];
  
  // 시/구가 선택되면 동/읍/면 목록을 자동으로 로드하고 포커스 이동
  if (selectedCity.value) {
    // 먼저 목록을 로드
    addrLoading.value = true;
    try {
      const list = await getTownListByCity(selectedCity.value);
      townOptions.value = Array.isArray(list) ? list : (list?.data ?? []);
    } catch (e) {
      console.error('동/읍/면 목록 조회 실패:', e);
      townOptions.value = [];
    } finally {
      addrLoading.value = false;
    }
    
    // DOM 업데이트 후 포커스 이동 및 드롭다운 열기
    await nextTick();
    setTimeout(() => {
      if (townSelectRef.value) {
        const selectEl = townSelectRef.value.$el;
        if (selectEl) {
          const input = selectEl.querySelector('input');
          if (input) {
            // 포커스 설정
            input.focus();
            
            // 실제로 한 글자를 입력하여 필터 트리거하고 드롭다운 열기
            // ' ' (공백)을 입력하면 filterTown이 호출되고 목록이 표시됨
            input.value = ' ';
            
            // 여러 이벤트를 발생시켜 q-select가 인식하도록
            const events = [
              new Event('input', { bubbles: true, cancelable: true }),
              new Event('keydown', { bubbles: true, cancelable: true }),
              new Event('keyup', { bubbles: true, cancelable: true }),
              new MouseEvent('click', { bubbles: true, cancelable: true })
            ];
            
            events.forEach(event => {
              input.dispatchEvent(event);
            });
            
            // 약간의 지연 후 입력값을 지워서 사용자가 선택할 수 있도록
            setTimeout(() => {
              input.value = '';
              const clearEvent = new Event('input', { bubbles: true, cancelable: true });
              input.dispatchEvent(clearEvent);
            }, 200);
          }
        }
      }
    }, 150);
  }
}
function onTownChange() {
  // 동이 확정되면 바로 적용하고 싶다면 여기서 applyAddressFilter() 호출 가능
  // 지금은 사용자가 '주소필터 적용' 버튼을 누를 때만 호출(기존 UX 방해 최소화)
}

async function applyAddressFilter() {
  try {
    loading.value = true;

    // 동/읍/면이 선택되어 있으면 서버에 town 파라미터 전달
    const townValue = selectedTown.value ? selectedTown.value.trim() : undefined;

    // city 값 처리: "부천시 소사구" 같은 경우를 파싱
    // DB의 sig_kor_nm 컬럼에는 "부천시" 또는 "소사구"로만 저장되어 있을 가능성이 높음
    // "부천시 소사구" -> "부천시"만 추출하여 전달
    let cityValue = selectedCity.value ? selectedCity.value.trim() : undefined;
    
    if (cityValue) {
      // "부천시 소사구" -> "부천시"만 추출
      // "서울특별시 강남구" -> "서울특별시"만 추출
      // "세종특별자치시" -> "세종특별자치시" 그대로 유지
      const cityMatch = cityValue.match(/^(.+?시)(?:\s+.+구)?$/);
      if (cityMatch) {
        cityValue = cityMatch[1]; // "부천시" 또는 "서울특별시"만 추출
      }
    }

    // 시/도 + 시/구 + 동/읍/면 기준으로 서버에서 목록 조회
    const res = await getRestaurantsByAddress({
      province: selectedProvince.value ?? undefined,
      city: cityValue,
      town: townValue,
      limit: 300, // 필요하면 조정
    });

    const list = Array.isArray(res) ? res : (res?.data ?? []);

    rows.value = list;
    // 이름/주소/카테고리 검색어는 초기화 (주소 필터만 적용)
    search.value = '';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.list-hero {
  border-radius: 16px;
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}

.list-hero__avatar {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.45);
}

/* 리스트 hover 효과 */
.restaurant-item {
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.restaurant-item:hover {
  background-color: #f5f7fb;
}

/* 최근 검색어 영역 */
.recent-section {
  margin-top: 4px;
  border-radius: 8px;
  background-color: #fafafa;
}

.recent-chip-row {
  flex-wrap: wrap;
}

.recent-chip {
  max-width: 180px;
  background-color: #ffffff;
}

.ellipsis {
  display: inline-block;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
