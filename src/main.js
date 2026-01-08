import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import Swal from 'sweetalert2'
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

// Helper function to show session expired alert
const showSessionExpiredAlert = () => {
  const locale = localStorage.getItem('locale') || 'en'
  const title = locale === 'ar' ? 'انتهت الجلسة' : 'Session Expired'
  const text = locale === 'ar'
    ? 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.'
    : 'Your session has expired. Please log in again.'
  const buttonText = locale === 'ar' ? 'تسجيل الدخول' : 'Login'

  Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    confirmButtonText: buttonText,
    allowOutsideClick: false,
    allowEscapeKey: false
  }).then(() => {
    router.push('/login')
  })
}

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
        showSessionExpiredAlert()
        return Promise.reject({ message: 'Session expired', isSessionExpired: true })
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
    // Skip if already handled as session expired
    if (error.isSessionExpired) {
      return Promise.reject(error)
    }

    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      const authStore = useAuthStore()
      await authStore.logout()

      // Redirect to login if not already there
      if (router.currentRoute.value.path !== '/login') {
        showSessionExpiredAlert()
      }
    }
    return Promise.reject(error)
  }
)

app.use(router)
app.use(i18n)

app.mount('#app')
