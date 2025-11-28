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

const bootstrap = async () => {
  try {
    // Keycloak 초기화
    await keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      checkLoginIframe: true
    })

    // Vue 앱 생성
    const app = createApp(App)

    // axios 인스턴스 하나만 사용
    const api = axios.create({
      baseURL: 'https://gs-main-api.i4624.info'
    })

    // attachToken interceptor
    api.interceptors.request.use(async (config) => {
      if (keycloak.authenticated && keycloak.token) {

        // refresh
        if (keycloak.isTokenExpired(30)) {
          await keycloak.updateToken(30)
        }

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${keycloak.token}`
        }
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

    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize Keycloak', error)
  }
}

bootstrap()
