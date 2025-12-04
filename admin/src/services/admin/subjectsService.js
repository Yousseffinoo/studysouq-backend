/**
 * Subjects Service
 * Handles all subject management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get all subjects with pagination and filters
 */
export const getSubjects = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.level) queryParams.append('level', params.level)
  if (params.status) queryParams.append('status', params.status)
  
  const queryString = queryParams.toString()
  const url = `/api/admin/subjects${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Get single subject by ID
 */
export const getSubject = async (id) => {
  return await API.get(`/api/admin/subjects/${id}`)
}

/**
 * Create new subject
 */
export const createSubject = async (data) => {
  return await API.post('/api/admin/subjects', data)
}

/**
 * Update subject
 */
export const updateSubject = async (id, data) => {
  return await API.put(`/api/admin/subjects/${id}`, data)
}

/**
 * Delete subject
 */
export const deleteSubject = async (id) => {
  return await API.delete(`/api/admin/subjects/${id}`)
}

export default {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
}






