import axios from 'axios'
import { API_URL } from "../config/api";
import { useAuthStore } from '../stores/auth'
const authStore = useAuthStore()
const instance = axios.create({
  isFile: false,
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*'
  }

})
instance.interceptors.request.use((config) => {
  const locale = localStorage.getItem('locale') || 'en'
  const token = localStorage.getItem('token')
  config.headers['Accept-language'] = locale
  if (token) config.headers['Authorization'] = 'Bearer ' + token
  if (config.isFile) config.headers['Content-Type'] = 'multipart/form-data'

  return config
})

instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    switch (error.response.status) {
      case 401: // Unauthorized
        console.log('Unauthorized')
        authStore.flush()
        break
      case 403: // Forbidden
        //   router.push('/login')
        console.log('Not Have Premissions')
        break
      case 422: // Unprocessable Content
        console.log('Has Errors')
        break
      case 404: // Request Not Found
        console.log('No Have Data')
        break
      case 500: // Server Error
        // window.location.replace("/server-error");
        break
    }
    return Promise.reject(error)
  }
)

export default instance
