/**
 * Images Service
 * Handles all image management API calls including Cloudinary uploads
 */

import { API } from '../../lib/apiClient'

/**
 * Get all images with pagination and filters
 */
export const getImages = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.status) queryParams.append('status', params.status)
  if (params.category) queryParams.append('category', params.category)
  if (params.subject) queryParams.append('subject', params.subject)
  
  const queryString = queryParams.toString()
  const url = `/api/admin/images${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Upload new image
 */
export const uploadImage = async (data, onProgress) => {
  const formData = new FormData()
  formData.append('image', data.image)
  
  if (data.title) formData.append('title', data.title)
  if (data.description) formData.append('description', data.description)
  if (data.category) formData.append('category', data.category)
  if (data.subject) formData.append('subject', data.subject)
  if (data.tags) formData.append('tags', JSON.stringify(data.tags))
  
  return await API.upload('/api/admin/images', formData, onProgress)
}

/**
 * Approve image
 */
export const approveImage = async (id) => {
  return await API.patch(`/api/admin/images/${id}/approve`)
}

/**
 * Reject image
 */
export const rejectImage = async (id, reason) => {
  return await API.patch(`/api/admin/images/${id}/reject`, { reason })
}

/**
 * Delete image
 */
export const deleteImage = async (id) => {
  return await API.delete(`/api/admin/images/${id}`)
}

export default {
  getImages,
  uploadImage,
  approveImage,
  rejectImage,
  deleteImage,
}






