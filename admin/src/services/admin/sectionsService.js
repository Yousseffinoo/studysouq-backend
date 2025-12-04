/**
 * Sections Service
 * Handles all section management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get all sections with pagination and filters
 */
export const getSections = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.subjectId) queryParams.append('subjectId', params.subjectId)
  if (params.status) queryParams.append('status', params.status)
  
  const queryString = queryParams.toString()
  const url = `/api/admin/sections${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Get single section by ID
 */
export const getSection = async (id) => {
  return await API.get(`/api/admin/sections/${id}`)
}

/**
 * Create new section
 */
export const createSection = async (data) => {
  return await API.post('/api/admin/sections', data)
}

/**
 * Update section
 */
export const updateSection = async (id, data) => {
  return await API.put(`/api/admin/sections/${id}`, data)
}

/**
 * Delete section
 */
export const deleteSection = async (id) => {
  return await API.delete(`/api/admin/sections/${id}`)
}

export default {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
}






