/**
 * Lessons Service
 * Handles all lesson management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get lesson statistics
 */
export const getLessonStats = async () => {
  return await API.get('/api/admin/lessons/stats')
}

/**
 * Get all lessons with pagination and filters
 */
export const getLessons = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.subject) queryParams.append('subject', params.subject)
  if (params.isPremium !== '' && params.isPremium !== undefined) {
    queryParams.append('isPremium', params.isPremium.toString())
  }
  
  const queryString = queryParams.toString()
  const url = `/api/admin/lessons${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Get single lesson by ID
 */
export const getLesson = async (id) => {
  return await API.get(`/api/admin/lessons/${id}`)
}

/**
 * Create new lesson
 */
export const createLesson = async (data) => {
  return await API.post('/api/admin/lessons', data)
}

/**
 * Update lesson
 */
export const updateLesson = async (id, data) => {
  return await API.put(`/api/admin/lessons/${id}`, data)
}

/**
 * Delete lesson
 */
export const deleteLesson = async (id) => {
  return await API.delete(`/api/admin/lessons/${id}`)
}

export default {
  getLessonStats,
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
}



