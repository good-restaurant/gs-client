import { createRouter, createWebHistory } from 'vue-router'
import { keycloak } from '../keycloak'
import AdminView from '../views/AdminView.vue'
import HomeView from '../views/HomeView.vue'
import MapView from '../views/MapView.vue'
import RestaurantDetailView from '../views/RestaurantDetailView.vue'
import RestaurantListView from '../views/RestaurantListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/restaurants',
      name: 'restaurants',
      component: RestaurantListView
    },
    {
      path: '/restaurants/:id',
      name: 'restaurant-detail',
      component: RestaurantDetailView
    },
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      beforeEnter: async (to, from, next) => {
        if (!keycloak) {
          console.error('Keycloak instance is not initialized')
          return next(false)
        }

        if (!keycloak.authenticated) {
          try {
            await keycloak.login({
              redirectUri: `${globalThis.location.origin}${to.fullPath}`
            })
          } catch (err) {
            console.error('Keycloak login failed', err)
            return next(false)
          }
        }

        next()
      }
    }
  ]
})

export default router
