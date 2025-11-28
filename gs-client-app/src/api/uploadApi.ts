// src/api/uploadApi.ts
import api from './axiosClient'

export async function uploadRestaurantPicture(restaurantId: number, file: File) {
  const form = new FormData()
  form.append('file', file)

  const res = await api.post(`/v1/signed-upload/restaurant/${restaurantId}`, form)
  return res.data
}

export async function getPictureSignedUrl(pictureId: string) {
  const res = await api.get(`/v1/signed-download/${pictureId}`)
  return res.data
}
