// src/api/restaurantCommentApi.ts
import api from './axiosClient'
import type { CommentDto } from './types/restaurant.d'

export async function createComment(payload: CommentDto) {
  const res = await api.post('/restaurant-comment', payload)
  return res.data
}

export async function updateComment(id: number, payload: CommentDto) {
  const res = await api.put(`/restaurant-comment/${id}`, payload)
  return res.data
}

export async function deleteComment(id: number) {
  const res = await api.delete(`/restaurant-comment/${id}`)
  return res.data
}

export async function getRestaurantComments(restaurantId: number, page = 0, size = 10) {
  const res = await api.get(`/restaurant-comment/view/${restaurantId}`, {
    params: { page, size },
  })
  return res.data
}
