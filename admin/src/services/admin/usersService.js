/**
 * Users Service
 * Handles all user management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  return await API.get('/api/admin/users/stats')
}

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.role) queryParams.append('role', params.role)
  if (params.sort) queryParams.append('sort', params.sort)
  
  const queryString = queryParams.toString()
  const url = `/api/admin/users${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Get single user by ID
 */
export const getUser = async (id) => {
  return await API.get(`/api/admin/users/${id}`)
}

/**
 * Create new user
 */
export const createUser = async (data) => {
  return await API.post('/api/admin/users', data)
}

/**
 * Update user
 */
export const updateUser = async (id, data) => {
  return await API.put(`/api/admin/users/${id}`, data)
}

/**
 * Delete user
 */
export const deleteUser = async (id) => {
  return await API.delete(`/api/admin/users/${id}`)
}

/**
 * Ban/Unban user
 */
export const toggleUserBan = async (id) => {
  return await API.patch(`/api/admin/users/${id}/ban`)
}

export default {
  getUserStats,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserBan,
}






