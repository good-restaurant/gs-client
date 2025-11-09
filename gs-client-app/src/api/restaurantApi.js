import { httpRequest } from './httpClient';

export async function listRestaurants(limit = 100) {
    const res = await httpRequest('/restaurant/all', { params: { limit } });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    return [...list].sort((a, b) =>
        String(a.restaurantName || '').localeCompare(String(b.restaurantName || ''), 'ko')
    );
}

export async function createRestaurant(payload) {
    return httpRequest('/restaurant/create', {
        method: 'POST',
        body: payload,
    });
}

export async function updateRestaurant(payload) {
    return httpRequest('/restaurant/update', {
        method: 'PATCH',
        body: payload,
    });
}

export async function deleteRestaurant(restaurantId) {
    return httpRequest('/restaurant/delete', {
        method: 'DELETE',
        params: { restaurantId },
    });
}
