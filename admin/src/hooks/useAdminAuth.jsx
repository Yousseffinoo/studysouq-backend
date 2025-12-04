/**
 * useAdminAuth Hook
 * Handles admin authentication, authorization, and session management
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API } from '../lib/apiClient'

export const useAdminAuth = () => {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  })

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('accessToken')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isAdmin: user.role === 'admin',
          })
        } catch (error) {
          console.error('Failed to parse user data:', error)
          clearAuthState()
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()
  }, [])

  /**
   * Clear auth state
   */
  const clearAuthState = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    })
  }, [])

  /**
   * Login
   */
  const login = useCallback(async (credentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      // Backend returns: { success: true, message: "...", data: { user: {...}, accessToken: "...", refreshToken: "..." } }
      const response = await API.post('/api/auth/login', credentials)
      
      // Handle response format - backend wraps everything in data object
      const token = response.data?.accessToken || response.accessToken || response.token
      const user = response.data?.user || response.user
      const refreshToken = response.data?.refreshToken || response.refreshToken

      if (!token || !user) {
        console.error('Invalid login response:', response)
        toast.error('Invalid login response. Please check server connection.')
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.')
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(user))

      // Update state
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: true,
      })

      toast.success(`Welcome back, ${user.name || user.email}!`)
      return true
    } catch (error) {
      console.error('Login error:', error)
      
      // Extract error message from normalized error
      let message = 'Login failed. Please try again.'
      
      // Network error - backend not running or connection issue
      if (!error.response) {
        message = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:5000'
      } else if (error.message) {
        message = error.message
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (typeof error === 'string') {
        message = error
      }
      
      toast.error(message || 'Login failed. Please try again.')
      
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }, [])

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint
      await API.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state regardless of API call result
      clearAuthState()
      toast.success('Logged out successfully')
      navigate('/login')
    }
  }, [navigate, clearAuthState])

  /**
   * Check if user is authenticated and is admin
   */
  const requireAdmin = useCallback(() => {
    if (!authState.isAuthenticated || !authState.isAdmin) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/login')
      return false
    }
    return true
  }, [authState, navigate])

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await API.get('/api/auth/me')
      
      // Handle response structure
      // Backend returns: { success: true, data: { user: {...} } }
      // API.get returns: response.data.data or response.data
      const user = response?.user || (response?.data && response.data.user) || response

      if (user && user.email) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(user))

        setAuthState((prev) => ({
          ...prev,
          user,
          isAdmin: user.role === 'admin',
        }))

        return user
      } else {
        console.error('Invalid user data in response:', response)
        return null
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      return null
    }
  }, [])

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    isAdmin: authState.isAdmin,

    // Methods
    login,
    logout,
    requireAdmin,
    refreshUser,
  }
}

/**
 * Higher-Order Component for Admin Route Protection
 */
export function withAdminAuth(Component) {
  return function ProtectedComponent(props) {
    const { isAuthenticated, isAdmin, isLoading } = useAdminAuth()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated || !isAdmin) {
      return <Navigate to="/login" replace />
    }

    return <Component {...props} />
  }
}

export default useAdminAuth



