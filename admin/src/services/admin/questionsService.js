/**
 * Questions Service
 * Handles all question management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get all questions with pagination and filters
 */
export const getQuestions = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.lessonId) queryParams.append('lessonId', params.lessonId)
  if (params.difficulty) queryParams.append('difficulty', params.difficulty)
  if (params.isPremium !== '' && params.isPremium !== undefined) {
    queryParams.append('isPremium', params.isPremium.toString())
  }
  
  const queryString = queryParams.toString()
  const url = `/api/admin/questions${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Get single question by ID
 */
export const getQuestion = async (id) => {
  return await API.get(`/api/admin/questions/${id}`)
}

/**
 * Create new question
 */
export const createQuestion = async (data) => {
  return await API.post('/api/admin/questions', data)
}

/**
 * Update question
 */
export const updateQuestion = async (id, data) => {
  return await API.put(`/api/admin/questions/${id}`, data)
}

/**
 * Delete question
 */
export const deleteQuestion = async (id) => {
  return await API.delete(`/api/admin/questions/${id}`)
}

export default {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
}






