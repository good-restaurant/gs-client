import { httpRequest } from './httpClient';

const API_BASE = 'https://gs-main-api.i4624.info';

/** v3 전체 목록 */
export async function listRestaurants(limit = 100) {
    const res = await httpRequest('/v3/restaurant/all', { params: { limit } });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    return [...list].sort((a, b) =>
        String(a.restaurantName || '').localeCompare(String(b.restaurantName || ''), 'ko')
    );
}

/** v3 생성 */
export async function createRestaurant(payload) {
    return httpRequest('/v3/restaurant/create', {
        method: 'POST',
        body: payload,
    });
}

/** v3 수정 */
export async function updateRestaurant(payload) {
    return httpRequest('/v3/restaurant/update', {
        method: 'PATCH',
        body: payload,
    });
}

/** v3 삭제 (쿼리 파라미터 restaurantId) */
export async function deleteRestaurant(restaurantId) {
    return httpRequest('/v3/restaurant/delete', {
        method: 'DELETE',
        params: { restaurantId },
    });
}

/** v3 단건 조회 /v3/restaurant/view/{id} */
export async function getRestaurant(id) {
    return httpRequest(`/v3/restaurant/view/${encodeURIComponent(id)}`);
}

/** v3 랜덤 조회 /v3/restaurant/random */
export async function getRandomRestaurants(limit = 100) {
    return httpRequest('/v3/restaurant/random', {
        params: { limit },
    });
}

/** v3 근처 조회 /v3/restaurant/nearby */
export async function getNearbyRestaurants({ address, radius = 0.1, limit = 20 }) {
    return httpRequest('/v3/restaurant/nearby', {
        params: { address, radius, limit },
    });
}

/** v3 읍면동 기준 조회 /v3/restaurant/emd */
export async function getRestaurantsByEmd(emd, limit = 20) {
    return httpRequest('/v3/restaurant/emd', {
        params: { emd, limit },
    });
}

// 필요하면 getRestaurantById 를 그대로 쓸 수 있게, 기존 v3 단건 조회를 래핑
export async function getRestaurantById(id) {
    return getRestaurant(id);
}

/** v1 사진 업로드 /v1/signed-upload/restaurant/{restaurantId} */
export async function uploadRestaurantPicture(restaurantId, file) {
    const form = new FormData();
    form.append('file', file);

    return httpRequest(
        `/v1/signed-upload/restaurant/${encodeURIComponent(restaurantId)}`,
        {
            method: 'POST',
            body: form,
        }
    );
}

/** v1 사진 다운로드 URL 조회 /v1/signed-download/{pictureId} */
export async function getPictureSignedUrl(pictureId) {
    return httpRequest(
        `/v1/signed-download/${encodeURIComponent(pictureId)}`
    );
}
