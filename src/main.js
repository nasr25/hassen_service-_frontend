import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './assets/fonts.css'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Import auth store after pinia is initialized
import { useAuthStore } from './stores/auth'

// Configure axios request interceptor
axios.interceptors.request.use(
  (config) => {
    // Get current locale from localStorage (set by i18n)
    const locale = localStorage.getItem('locale') || 'en'
    // Add Accept-Language header to all axios requests
    config.headers['Accept-Language'] = locale

    // Update last activity time on every request (if authenticated)
    const authStore = useAuthStore()
    if (authStore.token) {
      // Check if session has expired before making request
      if (authStore.checkSessionExpired()) {
        authStore.handleSessionExpired()
        router.push('/login')
        return Promise.reject({ message: 'Session expired' })
      }

      // Update activity time
      authStore.updateLastActivity()
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Configure axios response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      const authStore = useAuthStore()
      await authStore.logout()

      // Redirect to login if not already there
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

app.use(router)
app.use(i18n)

app.mount('#app')
