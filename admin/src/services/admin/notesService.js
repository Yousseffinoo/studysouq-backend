/**
 * Notes Service
 * Handles all note management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get all notes with pagination and filters
 */
export const getNotes = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.lessonId) queryParams.append('lessonId', params.lessonId)
  if (params.isPremium !== '' && params.isPremium !== undefined) {
    queryParams.append('isPremium', params.isPremium.toString())
  }
  
  const queryString = queryParams.toString()
  const url = `/api/admin/notes${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Get single note by ID
 */
export const getNote = async (id) => {
  return await API.get(`/api/admin/notes/${id}`)
}

/**
 * Create new note
 */
export const createNote = async (data) => {
  return await API.post('/api/admin/notes', data)
}

/**
 * Update note
 */
export const updateNote = async (id, data) => {
  return await API.put(`/api/admin/notes/${id}`, data)
}

/**
 * Delete note
 */
export const deleteNote = async (id) => {
  return await API.delete(`/api/admin/notes/${id}`)
}

export default {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
}






