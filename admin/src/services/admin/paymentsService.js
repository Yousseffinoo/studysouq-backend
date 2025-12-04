/**
 * Payments Service
 * Handles all payment management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get all payments with pagination and filters
 */
export const getPayments = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.status) queryParams.append('status', params.status)
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)
  
  const queryString = queryParams.toString()
  const url = `/api/admin/payments${queryString ? `?${queryString}` : ''}`
  
  return await API.get(url)
}

/**
 * Get single payment by ID
 */
export const getPayment = async (id) => {
  return await API.get(`/api/admin/payments/${id}`)
}

/**
 * Get payment statistics
 */
export const getPaymentStats = async () => {
  return await API.get('/api/admin/payments/stats')
}

/**
 * Create payment
 */
export const createPayment = async (data) => {
  return await API.post('/api/admin/payments', data)
}

/**
 * Update payment
 */
export const updatePayment = async (id, data) => {
  return await API.put(`/api/admin/payments/${id}`, data)
}

export default {
  getPayments,
  getPayment,
  getPaymentStats,
  createPayment,
  updatePayment,
}






