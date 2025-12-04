/**
 * Toast utility - Centralized toast notifications using react-hot-toast
 * This provides consistent toast messages across the app
 */

import toast from 'react-hot-toast'

export const showSuccess = (message) => {
  toast.success(message)
}

export const showError = (message) => {
  toast.error(message)
}

export const showLoading = (message) => {
  return toast.loading(message)
}

export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  })
}

export default toast

