// src/api/authRestaurantApi.ts
import api from './axiosClient'
import type {
    RestaurantDetailDto,
    RestaurantDto
} from './types/restaurant.d'

export async function listRestaurants(limit = 100): Promise<RestaurantDto[]> {
  const res = await api.get('/v3/restaurant/all', { params: { limit } })
  return res.data
}

export async function listRandomRestaurants(limit = 100): Promise<RestaurantDto[]> {
  const res = await api.get('/v3/restaurant/random', { params: { limit } })
  return res.data
}

export async function createRestaurant(payload: RestaurantDto) {
  const res = await api.post('/v3/restaurant/create', payload)
  return res.data
}

export async function updateRestaurant(payload: RestaurantDto) {
  const res = await api.patch('/v3/restaurant/update', payload)
  return res.data
}

export async function deleteRestaurant(restaurantId: number) {
  const res = await api.delete('/v3/restaurant/delete', {
    params: { restaurantId },
  })
  return res.data
}

export async function getRestaurant(id: number): Promise<RestaurantDetailDto> {
  const res = await api.get(`/v3/restaurant/view/${id}`)
  return res.data
}
