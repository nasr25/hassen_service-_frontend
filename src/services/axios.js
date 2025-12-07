import axios from 'axios'
import { API_URL } from '../config/api'

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor to add locale header
axiosInstance.interceptors.request.use(
  (config) => {
    // Get current locale from localStorage (set by i18n)
    const locale = localStorage.getItem('locale') || 'en'

    // Add Accept-Language header
    config.headers['Accept-Language'] = locale

    // Add auth token if exists
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
