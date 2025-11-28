// src/api/authRestaurantApi.ts
import api from './axiosClient'
import type {
    RestaurantDetailDto,
    RestaurantDto
} from './types/restaurant.d'

export async function listRestaurants(page = 0, size = 100): Promise<RestaurantDto[]> {
    const res = await api.get('/v1/restaurant-admin/view', {
      params: {
        page: 0,
        size: size,
        sort: 'createdAt,desc',
      }
    })
    return res.data
  }

export async function adminRestaurantView(restaurantId: number): Promise<RestaurantDto[]> {
    const res = await api.get(`/v1/restaurant-admin/view/${restaurantId}`)
    return res.data
  }

export async function listRandomRestaurants(limit = 100): Promise<RestaurantDto[]> {
  const res = await api.get('/v3/restaurant/random', { params: { limit } })
  return res.data
}

export async function createRestaurant(payload: RestaurantDto) {
  const res = await api.post('/v1/restaurant-admin', payload)
  return res.data
}

export async function updateRestaurant(payload: RestaurantDto) {
  const res = await api.patch('/v1/restaurant-admin', payload)
  return res.data
}

export async function deleteRestaurant(restaurantId: number) {
  const res = await api.delete('/v1/restaurant-admin', {
    params: { restaurantId },
  })
  return res.data
}

export async function getRestaurant(id: number): Promise<RestaurantDetailDto> {
  const res = await api.get(`/v1/restaurant-admin/view/${id}`)
  return res.data
}
