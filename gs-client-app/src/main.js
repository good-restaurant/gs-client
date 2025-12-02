import '@quasar/extras/material-icons/material-icons.css'
import { createPinia } from 'pinia'
import { Dialog, Notify, Quasar } from 'quasar'
import quasarIconSet from 'quasar/icon-set/material-icons'
import 'quasar/src/css/index.sass'
import { createApp } from 'vue'

import App from './App.vue'
import keycloak from './keycloak'
import router from './router'

import axios from 'axios'
import { buildKeycloakOptions } from './keycloak-config'

const bootstrap = async () => {
  let kcInitSuccess = true

  // Keycloak 초기화
  try {
    await keycloak.init(buildKeycloakOptions())
  } catch (err) {
    kcInitSuccess = false
    console.warn("Keycloak init failed → fallback to unauthenticated mode", err)
  }

  // Vue 앱 생성
  const app = createApp(App)

  // axios 인스턴스
  const api = axios.create({
    baseURL: 'https://gs-main-api.i4624.info'
  })

  // attachToken interceptor
  api.interceptors.request.use(async (config) => {
    try {
      if (keycloak.authenticated && keycloak.token) {

        // 토큰 만료 30초 전 refresh 시도
        if (keycloak.isTokenExpired(30)) {
          try {
            await keycloak.updateToken(30)
          } catch (refreshErr) {
            console.warn("Token refresh failed", refreshErr)
          }
        }

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${keycloak.token}`
        }
      }
    } catch (err) {
      console.warn("Keycloak token attach error", err)
    }

    return config
  })

  // Vue plugins
  app.use(createPinia())
  app.use(router)
  app.use(Quasar, {
    plugins: { Notify, Dialog },
    iconSet: quasarIconSet
  })

  // 전역 등록
  app.config.globalProperties.$keycloak = keycloak
  app.config.globalProperties.$api = api
  app.config.globalProperties.$kcInitSuccess = kcInitSuccess

  // mount
  app.mount('#app')
}

bootstrap()
