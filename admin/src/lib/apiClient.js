/**
 * API Client - Single Source of Truth for All Backend Communication
 * Handles authentication, token refresh, error normalization, and request/response interceptors
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const TOKEN_STORAGE_KEY = 'accessToken'
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Normalize API errors into consistent format
 */
function normalizeError(error) {
  // Already normalized
  if (error.status && error.message) {
    return error
  }

  // Axios error
  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    // Backend validation errors
    if (status === 400 && data.errors && Array.isArray(data.errors)) {
      const fieldErrors = {}
      data.errors.forEach((err) => {
        fieldErrors[err.field] = err.message
      })

      return {
        status,
        message: data.message || 'Validation failed',
        fieldErrors,
      }
    }

    return {
      status,
      message: data.message || 'An error occurred',
      code: data.code,
    }
  }

  // Generic error
  return {
    status: 500,
    message: error.message || 'An unexpected error occurred',
  }
}

/**
 * Handle logout - clear tokens and redirect
 */
function handleLogout() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem('user')
  
  // Redirect to login
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Request Interceptor - Add Authorization Header
apiClient.interceptors.request.use(
  (config) => {
    // For FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    // Don't add auth header for public auth endpoints
    const isPublicAuthEndpoint = config.url?.includes('/api/auth/login') || 
                                 config.url?.includes('/api/auth/signup') ||
                                 config.url?.includes('/api/auth/register') ||
                                 config.url?.includes('/api/auth/refresh-token') ||
                                 config.url?.includes('/api/auth/forgot-password') ||
                                 config.url?.includes('/api/auth/reset-password') ||
                                 config.url?.includes('/api/auth/verify-email')
    
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    
    if (token && config.headers && !isPublicAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`
      
      // Debug logging in development
      if (import.meta.env.DEV) {
        console.log('🔐 Adding auth token to request:', {
          url: config.url,
          hasToken: !!token,
          tokenLength: token?.length,
          isFormData: config.data instanceof FormData
        })
      }
    } else if (!isPublicAuthEndpoint && import.meta.env.DEV) {
      console.warn('⚠️ No token found for protected endpoint:', config.url)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor - Handle Errors and Token Refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Network Error
    if (!error.response) {
      const errorMessage = error.code === 'ECONNREFUSED' 
        ? `Cannot connect to backend server at ${API_BASE_URL}. Please make sure the server is running.`
        : error.message || 'Network error. Please check your connection and ensure the backend server is running.'
      
      toast.error(errorMessage)
      return Promise.reject(normalizeError({
        status: 0,
        message: errorMessage,
      }))
    }

    // Skip token refresh for auth endpoints (login failures are legitimate 401s)
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login') || 
                          originalRequest.url?.includes('/api/auth/signup') ||
                          originalRequest.url?.includes('/api/auth/register') ||
                          originalRequest.url?.includes('/api/auth/refresh-token') ||
                          originalRequest.url?.includes('/api/auth/forgot-password') ||
                          originalRequest.url?.includes('/api/auth/reset-password') ||
                          originalRequest.url?.includes('/api/auth/verify-email')

    // 401 Unauthorized - Try Token Refresh (but not for auth endpoints)
    if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

      if (!refreshToken) {
        // No refresh token, logout
        handleLogout()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          { refreshToken }
        )

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          
          // Store new tokens
          localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
          localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken)

          // Update authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }

          processQueue(null, accessToken)

          // Retry original request
          return apiClient(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        handleLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 403 Forbidden
    if (error.response.status === 403) {
      const message = error.response.data?.message || 'Access denied. Admin privileges required.'
      toast.error(message)
      
      // If not admin, redirect to login
      if (message.includes('Admin privileges')) {
        handleLogout()
      }
    }

    // 404 Not Found
    if (error.response.status === 404) {
      const message = error.response.data?.message || 'Resource not found'
      toast.error(message)
    }

    // 429 Rate Limit
    if (error.response.status === 429) {
      toast.error('Too many requests. Please try again later.')
    }

    // 500 Server Error
    if (error.response.status >= 500) {
      const message = error.response.data?.message || 'Server error. Please try again later.'
      toast.error(message)
    }

    // Normalize and reject error
    return Promise.reject(normalizeError(error))
  }
)

/**
 * Helper Functions
 */

export const API = {
  /**
   * GET request
   */
  async get(url, config = {}) {
    try {
      const response = await apiClient.get(url, config)
      // Backend returns { success: true, data: {...} } or { success: true, ... }
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * POST request
   */
  async post(url, data, config = {}) {
    try {
      const response = await apiClient.post(url, data, config)
      
      // Show success toast if message provided
      if (response.data.message) {
        toast.success(response.data.message)
      }
      
      // For login/signup, return full response, otherwise return data
      if (url.includes('/api/auth/login') || url.includes('/api/auth/signup') || url.includes('/api/auth/register')) {
        return response.data
      }
      
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * PUT request
   */
  async put(url, data, config = {}) {
    try {
      const response = await apiClient.put(url, data, config)
      
      if (response.data.message) {
        toast.success(response.data.message)
      }
      
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * PATCH request
   */
  async patch(url, data, config = {}) {
    try {
      const response = await apiClient.patch(url, data, config)
      
      if (response.data.message) {
        toast.success(response.data.message)
      }
      
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config)
      
      if (response.data.message) {
        toast.success(response.data.message)
      }
      
      return response.data.data !== undefined ? response.data.data : response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Upload file with progress
   */
  async upload(url, formData, onProgress) {
    try {
      console.log('Upload request:', { url, formDataType: formData instanceof FormData })
      
      // For FormData, don't set Content-Type - browser will set it with boundary
      const config = {
        headers: formData instanceof FormData ? {} : {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        },
      }
      
      // Log FormData contents in development
      if (process.env.NODE_ENV === 'development' && formData instanceof FormData) {
        console.log('FormData entries:')
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value)
        }
      }
      
      const response = await apiClient.post(url, formData, config)
      
      // Handle response structure
      // Backend returns: { success: true, message: "...", data: image }
      // API.post returns: response.data = { success: true, message: "...", data: image }
      const result = response.data?.data || response.data
      
      if (response.data?.message) {
        toast.success(response.data.message)
      }
      
      return result
    } catch (error) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  },
}

export { normalizeError, handleLogout }
export default apiClient



