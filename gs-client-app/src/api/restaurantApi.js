import { httpRequest } from './httpClient';

// const API_BASE = 'https://gs-main-api.i4624.info';

/** v3 전체 목록 */
export async function listRestaurants(limit = 100) {
    const res = await httpRequest('/v3/restaurant/all', { params: { limit } });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    return [...list].sort((a, b) =>
        String(a.restaurantName || '').localeCompare(String(b.restaurantName || ''), 'ko')
    );
}

export async function listRandomRestaurants(limit = 100) {
    const res = await httpRequest('/v3/restaurant/random', { params: { limit } });
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

/** v3 위치 기반 조회 /v3/restaurant/location */
export async function getRestaurantsByLocation({ lat, lon, radius = 250, limit = 20 }) {
    return httpRequest('/v3/restaurant/location', {
        params: { lat, lon, radius, limit },
    });
}

/** v3 읍면동 기준 조회 /v3/restaurant/emd */
export async function getRestaurantsByEmd(emd, limit = 20) {
    return httpRequest('/v3/restaurant/emd', {
        params: { emd, limit },
    });
}

/** v3 통합 검색 기능 /v3/restaurant/search */
export async function searchRestaurants(searchQuery, limit = 100) {
    const res = await httpRequest('/v3/restaurant/search', {
        params: { searchQuery, limit },
    });

    const list = Array.isArray(res) ? res : res?.data ?? [];
    return list;
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

/** 댓글 생성 */
export async function createComment({ restaurantId, content, rating = 0, displayName }) {
    // 백엔드 Example: { content, rating, restaurant: { id } ... }
    const body = {
        content,
        rating,
        ...(displayName ? { displayName } : {}),
        restaurant: { id: restaurantId },
    };
    return httpRequest('/restaurant-comment', {
        method: 'POST',
        body,
    });
}

/** 댓글 수정 */
export async function updateComment(id, { content, rating = 0, displayName }) {
    const body = { content, rating, ...(displayName ? { displayName } : {}) };
    return httpRequest(`/restaurant-comment/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body,
    });
}

/** 댓글 삭제 */
export async function deleteComment(id) {
    return httpRequest(`/restaurant-comment/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

/** 식당의 댓글 목록 조회 (pageable 사용) */
export async function getRestaurantComments(restaurantId, { page = 0, size = 10, sort = 'createdAt,desc' } = {}) {
    // swagger상 pageable은 query로 전달
    return httpRequest(`/restaurant-comment/view/${encodeURIComponent(restaurantId)}`, {
        params: { page, size, sort },
    });
}

/** 댓글 단건 조회 */
export async function getCommentById(id) {
    return httpRequest(`/restaurant-comment/view-comment/${encodeURIComponent(id)}`);
}

/** 최근 댓글 20개 조회 (응답에서 content만 뽑기, pageable default 값으로 사용) */
export async function getRecentComments(size = 20, page = 0) {
  const res = await httpRequest('/restaurant-comment/recent', {
    params: {
      page,
      size,
      sort: 'createdAt,desc',
    },
  });

  const content = Array.isArray(res?.content)
    ? res.content
    : Array.isArray(res?.data?.content)
    ? res.data.content
    : [];

  return content.map((item) => ({
    id: item.id,
    content: item.content,
    rating: item.rating,
    displayName: item.displayName,
    restaurantId: item.restaurant?.id,
    restaurantName: item.restaurant?.restaurantName,
    createdAt: item.createdAt,
  }));
}
