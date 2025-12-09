// src/api/authRestaurantApi.ts
import api from './axiosClient'
import type {
  MenuDto,
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

export async function updateRestaurant(id: number, payload: RestaurantDto) {
  const res = await api.put(`/v1/restaurant-admin/${id}`, payload)
  return res.data
}

export async function deleteRestaurant(id: number) {
  const res = await api.delete(`/v1/restaurant-admin/${id}`)
  return res.data
}

export async function getRestaurant(id: number): Promise<RestaurantDetailDto> {
  const res = await api.get(`/v1/restaurant-admin/view/${id}`)
  return res.data
}

export async function updateRestaurantPicture(pictureId: number, payload: any) {
  const res = await api.put(`/v1/restaurant-admin/picture/${pictureId}`, payload)
  return res.data
}

export async function deleteRestaurantPicture(pictureId: number) {
  const res = await api.delete(`/v1/restaurant-admin/picture/${pictureId}`)
  return res.data
}

// 메뉴 관리 API
export async function listMenus(restaurantId?: number): Promise<MenuDto[]> {
  const params = restaurantId ? { restaurantId } : {}
  const res = await api.get('/v1/restaurant-menu/view', { params })
  return res.data
}

export async function getMenu(id: number): Promise<MenuDto> {
  const res = await api.get(`/v1/restaurant-menu/view/${id}`)
  return res.data
}

export async function createMenu(payload: MenuDto) {
  const res = await api.post('/v1/restaurant-menu', payload)
  return res.data
}

export async function updateMenu(id: number, payload: MenuDto) {
  const res = await api.put(`/v1/restaurant-menu/${id}`, payload)
  return res.data
}

export async function deleteMenu(id: number) {
  const res = await api.delete(`/v1/restaurant-menu/${id}`)
  return res.data
}
