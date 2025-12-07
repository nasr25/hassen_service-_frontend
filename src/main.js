import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './style.css'

// Configure axios defaults
axios.interceptors.request.use(
  (config) => {
    // Get current locale from localStorage (set by i18n)
    const locale = localStorage.getItem('locale') || 'en'
    // Add Accept-Language header to all axios requests
    config.headers['Accept-Language'] = locale
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
