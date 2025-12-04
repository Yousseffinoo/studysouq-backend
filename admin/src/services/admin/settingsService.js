/**
 * Settings Service
 * Handles all platform settings API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get platform settings
 */
export const getSettings = async () => {
  return await API.get('/api/admin/settings')
}

/**
 * Update platform settings
 */
export const updateSettings = async (data) => {
  return await API.put('/api/admin/settings', data)
}

export default {
  getSettings,
  updateSettings,
}






