/**
 * Pricing Service
 * Handles all pricing plan management API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get all pricing plans
 */
export const getPricingPlans = async () => {
  return await API.get('/api/admin/pricing')
}

/**
 * Get single pricing plan
 */
export const getPricingPlan = async (id) => {
  return await API.get(`/api/admin/pricing/${id}`)
}

/**
 * Create pricing plan
 */
export const createPricingPlan = async (data) => {
  return await API.post('/api/admin/pricing', data)
}

/**
 * Update pricing plan
 */
export const updatePricingPlan = async (id, data) => {
  return await API.put(`/api/admin/pricing/${id}`, data)
}

/**
 * Delete pricing plan
 */
export const deletePricingPlan = async (id) => {
  return await API.delete(`/api/admin/pricing/${id}`)
}

/**
 * Update payment gateway configuration
 */
export const updatePaymentConfig = async (data) => {
  return await API.put('/api/admin/pricing/payment-config', data)
}

export default {
  getPricingPlans,
  getPricingPlan,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  updatePaymentConfig,
}






