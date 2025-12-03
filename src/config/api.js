/**
 * API Configuration
 *
 * Centralized API configuration that reads from environment variables.
 * This allows easy switching between development, staging, and production environments.
 */

// Get API URL from environment variable
// In development: http://localhost:8000/api
// In production: https://api.yourdomain.com/api
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Get base URL without /api for storage links
export const BASE_URL = API_URL.replace('/api', '')

// Application environment
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development'

// Check if in production
export const IS_PRODUCTION = APP_ENV === 'production'

// Export default config object
export default {
  API_URL,
  BASE_URL,
  APP_ENV,
  IS_PRODUCTION
}
