// src/api/authRestaurantCommentApi.ts
import api from './axiosClient'
import type { CommentDto } from './types/restaurant.d'

// Admin용 댓글 API
export async function adminUpdateComment(commentId: number, payload: CommentDto) {
  const res = await api.put(`/v1/restaurant-admin/comment/${commentId}`, payload)
  return res.data
}

export async function adminDeleteComment(commentId: number) {
  const res = await api.delete(`/v1/restaurant-admin/comment/${commentId}`)
  return res.data
}
