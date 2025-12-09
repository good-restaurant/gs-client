<template>
  <q-page class="q-pa-md bg-grey-1">
    <q-card class="q-pa-sm shadow-3" style="border-radius: 16px;">

      <!-- HEADER -->
      <q-card-section class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" @click="goBack" />
        <div class="text-h6 text-weight-bold">
          [관리자] {{ restaurant?.restaurantName || '가게 상세 정보' }}
        </div>
        <q-space />
        <q-chip
          v-if="restaurant?.category"
          outline
          color="primary"
          text-color="primary"
        >
          {{ CATEGORY_LABEL_MAP[restaurant.category] || restaurant.category }}
        </q-chip>
      </q-card-section>

      <q-separator />

      <!-- LOADING -->
      <q-inner-loading :showing="loading">
        <q-spinner size="40px" />
      </q-inner-loading>

      <!-- TABS -->
      <q-tabs
        v-model="currentTab"
        dense
        active-color="primary"
        indicator-color="primary"
        align="justify"
        class="q-mt-sm"
      >
        <q-tab name="home" label="기본 정보" />
        <q-tab name="photos" :label="`사진 (${pictureUrls.length})`" />
        <q-tab name="menus" :label="`메뉴 (${menus.length})`" />
        <q-tab name="reviews" :label="`리뷰 (${reviews.length})`" />
      </q-tabs>

      <q-separator />

      <!-- TAB PANELS -->
      <q-tab-panels v-model="currentTab" animated>

        <!-- ▣ HOME TAB -->
        <q-tab-panel name="home">
          <q-card-section v-if="restaurant">
            <div class="q-mb-sm">
              <div class="text-subtitle1 text-weight-bold">주소</div>
              <div class="text-body2 text-grey-8">
                {{ restaurant.address || '-' }}
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-12 col-md-4">
                <div class="label">위도(lat)</div>
                <div class="value">{{ restaurant.lat ?? '-' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="label">경도(lon)</div>
                <div class="value">{{ restaurant.lon ?? '-' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="label">전화번호</div>
                <div class="value">{{ restaurant.phoneNumber || '-' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-tab-panel>

        <!-- ▣ PHOTOS TAB -->
        <q-tab-panel name="photos">
          <!-- 사진 업로드 -->
          <q-card-section>
            <div class="row items-center q-col-gutter-sm">
              <div class="text-subtitle1 text-weight-medium col-12 col-md-3">
                사진 업로드
              </div>
              <div class="col-12 col-md-6">
                <q-file
                  v-model="selectedFile"
                  dense outlined
                  accept="image/*"
                  label="이미지 파일 선택"
                  :disable="uploading"
                  clearable
                />
              </div>
              <div class="col-12 col-md-3">
                <q-btn
                  color="primary"
                  label="업로드"
                  :loading="uploading"
                  :disable="!selectedFile || uploading"
                  @click="handleUpload"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <!-- 사진 리스트 -->
          <q-card-section>
            <div class="row q-col-gutter-md">
              <div
                v-for="p in pictureUrls"
                :key="p.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card flat bordered class="shadow-1 rounded-borders picture-card">
                  <div class="relative-position">
                    <q-img
                      :src="p.url"
                      :ratio="4/3"
                      basic
                      spinner-color="primary"
                    />
                    <!-- 삭제 버튼 (hover 시 표시) -->
                    <div class="picture-actions absolute-top-right q-pa-xs">
                      <q-btn
                        round
                        dense
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="confirmDeletePicture(p.id)"
                        :loading="deletingPictureId === p.id"
                        class="picture-action-btn"
                      />
                    </div>
                  </div>
                  <q-card-section class="q-pa-sm">
                    <div class="text-caption text-grey-7">
                      pictureId: {{ p.id }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div v-if="pictureUrls.length === 0" class="text-grey q-mt-sm">
              사진이 없습니다.
            </div>
          </q-card-section>
        </q-tab-panel>

        <!-- ▣ MENUS TAB -->
        <q-tab-panel name="menus">
          <!-- 메뉴 추가 폼 -->
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-subtitle1 text-weight-bold">메뉴 관리</div>
              <q-space />
              <q-btn
                color="primary"
                icon="add"
                label="메뉴 추가"
                @click="openMenuDialog()"
                :disable="!restaurantId"
              />
            </div>

            <q-separator class="q-mb-md" />

            <!-- 메뉴 목록 -->
            <div v-if="menus.length" class="column q-gutter-sm">
              <q-card
                v-for="menu in menus"
                :key="menu.id"
                flat
                bordered
                class="menu-card"
              >
                <q-card-section class="row items-center">
                  <div class="col">
                    <div class="text-body1 text-weight-medium">{{ menu.name }}</div>
                    <div v-if="menu.description" class="text-caption text-grey-7 q-mt-xs">
                      {{ menu.description }}
                    </div>
                    <div class="text-body2 text-primary text-weight-bold q-mt-xs">
                      {{ menu.price ? menu.price.toLocaleString('ko-KR') + '원' : '가격 미정' }}
                    </div>
                  </div>
                  <div class="col-auto q-gutter-xs">
                    <q-btn
                      flat
                      dense
                      icon="edit"
                      color="primary"
                      @click="openMenuDialog(menu)"
                    />
                    <q-btn
                      flat
                      dense
                      icon="delete"
                      color="negative"
                      @click="confirmDeleteMenu(menu.id)"
                      :loading="deletingMenuId === menu.id"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div v-else class="text-grey q-mt-sm">등록된 메뉴가 없습니다.</div>
          </q-card-section>
        </q-tab-panel>

        <!-- ▣ REVIEWS TAB -->
        <q-tab-panel name="reviews">
          <q-card-section>
            <CommentsPanel :restaurant-id="restaurantId" admin />
          </q-card-section>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>

    <!-- 메뉴 추가/수정 다이얼로그 -->
    <q-dialog v-model="menuDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            {{ editingMenuId ? '메뉴 수정' : '메뉴 추가' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="menuForm.name"
            label="메뉴 이름 *"
            outlined
            dense
            autofocus
            :rules="[val => !!val || '메뉴 이름을 입력하세요']"
          />
          <q-input
            v-model="menuForm.description"
            label="설명"
            outlined
            dense
            type="textarea"
            rows="3"
            class="q-mt-md"
            hint="선택사항"
          />
          <q-input
            v-model.number="menuForm.price"
            label="가격 (원)"
            outlined
            dense
            type="number"
            class="q-mt-md"
            hint="선택사항"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="취소" color="grey" v-close-popup />
          <q-btn
            flat
            label="저장"
            color="primary"
            @click="saveMenu"
            :loading="savingMenu"
            :disable="savingMenu"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  createMenu,
  deleteMenu,
  deleteRestaurantPicture,
  getRestaurant,
  updateMenu
} from '@/api/authRestaurantApi'
import { getPictureSignedUrl, uploadRestaurantPicture } from '@/api/restaurantApi'
import CommentsPanel from '@/components/CommentsPanel.vue'

const CATEGORY_LABEL_MAP = {
  ETC: '기타',
  KOREAN: '한식',
  CHINESE: '중식',
  JAPANESE: '일식',
  WESTERN: '양식'
}

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const currentTab = ref('home')

const restaurantId = computed(() => Number(route.params.id))

const restaurant = ref(null)
const loading = ref(false)

const selectedFile = ref(null)
const uploading = ref(false)
const deletingPictureId = ref(null)

const pictureUrls = ref([])

// 메뉴 관련 상태
const menus = computed(() => restaurant.value?.restaurantMenus ?? [])
const menuDialog = ref(false)
const menuForm = ref({ 
  name: '', 
  description: null, 
  price: undefined, 
  pictureUuid: null,
  restaurantId: undefined 
})
const editingMenuId = ref(null)
const deletingMenuId = ref(null)
const savingMenu = ref(false)

const reviews = computed(() => restaurant.value?.restaurantComments ?? [])

/* ▣ 데이터 로드 */
async function loadDetail() {
  loading.value = true
  try {
    const data = await getRestaurant(restaurantId.value)
    restaurant.value = data
    await loadPictureUrls()
    // 메뉴는 restaurant 데이터에 포함되어 있으므로 별도 로드 불필요
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: '가게 정보를 불러오지 못했습니다.' })
  } finally {
    loading.value = false
  }
}

/* ▣ 메뉴 목록 로드 (메뉴 추가/수정/삭제 후 갱신용) */
async function loadMenus() {
  if (!restaurantId.value) return
  try {
    // restaurant 데이터를 다시 로드하여 메뉴 목록 갱신
    const data = await getRestaurant(restaurantId.value)
    restaurant.value = data
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: '메뉴 목록을 불러오지 못했습니다.' })
  }
}

async function loadPictureUrls() {
  pictureUrls.value = []

  const pics = restaurant.value?.restaurantPictures
  if (!pics?.length) return

  const results = await Promise.all(
    pics.map(async p => {
      try {
        const url = await getPictureSignedUrl(p.id)
        return { id: p.id, url }
      } catch (e) {
        console.error('signed-url 조회 실패:', e)
        return null
      }
    })
  )
  pictureUrls.value = results.filter(Boolean)
}

/* ▣ 사진 업로드 */
async function handleUpload() {
  const file = Array.isArray(selectedFile.value)
    ? selectedFile.value[0]
    : selectedFile.value

  if (!file) {
    $q.notify({ type: 'warning', message: '업로드할 파일을 선택하세요.' })
    return
  }

  uploading.value = true
  try {
    await uploadRestaurantPicture(restaurantId.value, file)
    $q.notify({ type: 'positive', message: '사진이 업로드되었습니다.' })
    selectedFile.value = null
    await loadDetail()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: '업로드 실패' })
  } finally {
    uploading.value = false
  }
}

/* ▣ 사진 삭제 확인 */
function confirmDeletePicture(pictureId) {
  $q.dialog({
    title: '사진 삭제 확인',
    message: '이 사진을 가게에서 제거하시겠습니까?<br><small class="text-grey-7"></small>',
    cancel: true,
    persistent: true,
    html: true
  }).onOk(async () => {
    await handleDeletePicture(pictureId)
  })
}

/* ▣ 사진 삭제 처리 */
async function handleDeletePicture(pictureId) {
  deletingPictureId.value = pictureId
  try {
    await deleteRestaurantPicture(pictureId)
    $q.notify({ 
      type: 'positive', 
      message: '사진이 가게에서 제거되었습니다.' 
    })
    // 목록 갱신
    await loadDetail()
  } catch (e) {
    console.error(e)
    $q.notify({ 
      type: 'negative', 
      message: e.message || '사진 삭제에 실패했습니다.' 
    })
  } finally {
    deletingPictureId.value = null
  }
}

/* ▣ 메뉴 다이얼로그 열기 */
function openMenuDialog(menu) {
  if (menu) {
    // 수정 모드
    menuForm.value = {
      id: menu.id,
      name: menu.name || '',
      description: menu.description || null,
      price: menu.price,
      pictureUuid: menu.pictureUuid || null,
      restaurantId: restaurantId.value
    }
    editingMenuId.value = menu.id || null
  } else {
    // 추가 모드
    menuForm.value = {
      name: '',
      description: null,
      price: undefined,
      pictureUuid: null,
      restaurantId: restaurantId.value
    }
    editingMenuId.value = null
  }
  menuDialog.value = true
}

/* ▣ 메뉴 저장 */
async function saveMenu() {
  if (!menuForm.value.name?.trim()) {
    $q.notify({ type: 'warning', message: '메뉴 이름을 입력하세요.' })
    return
  }

  savingMenu.value = true
  try {
    const payload = {
      name: menuForm.value.name.trim(),
      description: menuForm.value.description?.trim() || null,
      price: menuForm.value.price ? Number(menuForm.value.price) : undefined,
      pictureUuid: menuForm.value.pictureUuid || null,
      restaurantId: restaurantId.value
    }

    if (editingMenuId.value) {
      // 수정
      await updateMenu(editingMenuId.value, payload)
      $q.notify({ type: 'positive', message: '메뉴가 수정되었습니다.' })
    } else {
      // 추가
      await createMenu(payload, restaurantId.value)
      $q.notify({ type: 'positive', message: '메뉴가 추가되었습니다.' })
    }

    menuDialog.value = false
    await loadMenus()
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e.message || '메뉴 저장에 실패했습니다.'
    })
  } finally {
    savingMenu.value = false
  }
}

/* ▣ 메뉴 삭제 확인 */
function confirmDeleteMenu(menuId) {
  $q.dialog({
    title: '메뉴 삭제 확인',
    message: '이 메뉴를 삭제하시겠습니까?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await handleDeleteMenu(menuId)
  })
}

/* ▣ 메뉴 삭제 처리 */
async function handleDeleteMenu(menuId) {
  deletingMenuId.value = menuId
  try {
    await deleteMenu(menuId)
    $q.notify({ type: 'positive', message: '메뉴가 삭제되었습니다.' })
    await loadMenus()
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e.message || '메뉴 삭제에 실패했습니다.'
    })
  } finally {
    deletingMenuId.value = null
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}

.hover-light:hover {
  background: #f5faff;
  transition: 0.2s;
}

.label {
  font-size: 13px;
  color: #666;
}
.value {
  font-size: 14px;
  font-weight: 600;
}

.picture-card {
  position: relative;
  transition: transform 0.2s;
}

.picture-card:hover {
  transform: translateY(-2px);
}

.picture-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.picture-card:hover .picture-actions {
  opacity: 1;
}

.picture-action-btn {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.picture-action-btn:hover {
  background: rgba(244, 67, 54, 0.9);
}

.menu-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

