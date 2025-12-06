import { create } from 'zustand'
import { API } from '@/lib/apiClient'

const TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    const userStr = localStorage.getItem(USER_KEY)

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        set({ user, isAuthenticated: true, isLoading: false })
      } catch {
        get().clearAuth()
      }
    } else {
      set({ isLoading: false })
    }
  },

  login: async (credentials) => {
    try {
      const response = await API.post('/api/auth/login', credentials)
      
      const token = response.data?.accessToken || response.accessToken
      const refreshToken = response.data?.refreshToken || response.refreshToken
      const user = response.data?.user || response.user

      if (!token || !user) {
        throw new Error('Invalid login response')
      }

      if (user.role !== 'admin') {
        throw new Error('Admin access required')
      }

      localStorage.setItem(TOKEN_KEY, token)
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      }
      localStorage.setItem(USER_KEY, JSON.stringify(user))

      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      }
    }
  },

  logout: async () => {
    try {
      await API.post('/api/auth/logout')
    } catch {
      // Ignore logout errors
    } finally {
      get().clearAuth()
    }
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  updateUser: (userData) => {
    const user = { ...get().user, ...userData }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ user })
  },
}))

