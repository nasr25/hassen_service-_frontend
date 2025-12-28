import { defineStore } from 'pinia'
import axios from 'axios'
import { API_URL } from '../config/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    permissions: [],
    roles: [],
    isLoading: false,
    error: null,
    lastActivity: localStorage.getItem('lastActivity') || null,
    sessionTimeout: 30 * 60 * 1000 // 30 minutes in milliseconds
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager',
    isUser: (state) => state.user?.role === 'user',

    // Permission-based getters
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },
    hasAnyPermission: (state) => (permissions) => {
      return permissions.some(permission => state.permissions.includes(permission))
    },
    hasAllPermissions: (state) => (permissions) => {
      return permissions.every(permission => state.permissions.includes(permission))
    },
    hasRole: (state) => (role) => {
      return state.roles.includes(role)
    }
  },

  actions: {
    async login(username, password) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          username,
          password
        })

        this.token = response.data.token
        this.user = response.data.user
        this.permissions = response.data.permissions || []
        this.roles = response.data.roles || []

        localStorage.setItem('token', this.token)
        localStorage.setItem('permissions', JSON.stringify(this.permissions))
        localStorage.setItem('roles', JSON.stringify(this.roles))

        // Set initial activity time
        this.updateLastActivity()

        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return { success: true }
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (this.token) {
          await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${this.token}` }
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        this.permissions = []
        this.roles = []
        this.lastActivity = null
        localStorage.removeItem('token')
        localStorage.removeItem('permissions')
        localStorage.removeItem('roles')
        localStorage.removeItem('lastActivity')
        delete axios.defaults.headers.common['Authorization']
      }
    },

    async fetchUser() {
      if (!this.token) return

      try {
        const response = await axios.get(`${API_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${this.token}` }
        })
        this.user = response.data.user
        this.permissions = response.data.permissions || []
        this.roles = response.data.roles || []

        localStorage.setItem('permissions', JSON.stringify(this.permissions))
        localStorage.setItem('roles', JSON.stringify(this.roles))
      } catch (error) {
        console.error('Fetch user error:', error)
        this.logout()
      }
    },

    initializeAuth() {
      if (this.token) {
        // Load permissions and roles from localStorage
        const storedPermissions = localStorage.getItem('permissions')
        const storedRoles = localStorage.getItem('roles')

        if (storedPermissions) {
          try {
            this.permissions = JSON.parse(storedPermissions)
          } catch (e) {
            this.permissions = []
          }
        }

        if (storedRoles) {
          try {
            this.roles = JSON.parse(storedRoles)
          } catch (e) {
            this.roles = []
          }
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.fetchUser()
      }
    },

    updateLastActivity() {
      const now = Date.now()
      this.lastActivity = now
      localStorage.setItem('lastActivity', now.toString())
    },

    checkSessionExpired() {
      if (!this.lastActivity || !this.token) {
        return false
      }

      const now = Date.now()
      const timeSinceLastActivity = now - parseInt(this.lastActivity)

      return timeSinceLastActivity > this.sessionTimeout
    },

    async handleSessionExpired() {
      console.log('Session expired - logging out')
      await this.logout()
      return true
    }
  }
})
