/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

import { API } from '../../lib/apiClient'

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  return await API.get('/api/admin/dashboard/stats')
}

/**
 * Get recent activities
 */
export const getRecentActivities = async (limit = 20) => {
  return await API.get(`/api/admin/dashboard/activities?limit=${limit}`)
}

/**
 * Get analytics data
 */
export const getAnalytics = async (period = 30) => {
  return await API.get(`/api/admin/dashboard/analytics?period=${period}`)
}

export default {
  getDashboardStats,
  getRecentActivities,
  getAnalytics,
}






