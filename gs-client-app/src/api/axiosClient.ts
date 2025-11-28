// src/api/axiosClient.ts
import { keycloak } from '@/keycloak'
import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: 'https://gs-main-api.i4624.info',
})

// 요청 시 자동으로 Authorization 헤더 추가
api.interceptors.request.use(async (config) => {

  if (keycloak?.token) {
    try {
      // 만료 30초 전이면 refresh
      await keycloak.updateToken(30)

    } catch (err: any) {
      console.error('Keycloak token refresh failed', err)

      // 1) keycloak 서버 unreachable → 재시도 가능
      if (err?.message?.includes('Network')) {
        // 한번 더 시도
        try {
          await keycloak.updateToken(30)
        } catch (error_) {
          console.error('Keycloak refresh retry failed', error_)
        }
      }

      // 2) refresh token 자체가 만료됨
      //    → 사용자 로그인 필요
      if (keycloak.isTokenExpired(0)) {
        keycloak.login()
      }
    }

    config.headers = config.headers || {} as AxiosRequestHeaders
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${keycloak.token}`
  }

  return config
})


export default api
