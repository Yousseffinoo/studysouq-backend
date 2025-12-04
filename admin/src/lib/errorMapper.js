/**
 * Error Mapper
 * Standardizes error handling across the application
 */

/**
 * Map API error to normalized error format
 */
export const mapError = (error) => {
  // Already normalized
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error
    
    return {
      status: apiError.status,
      message: apiError.message,
      fieldErrors: apiError.fieldErrors,
      code: apiError.code,
      isValidationError: apiError.status === 400 && !!apiError.fieldErrors,
      isAuthError: apiError.status === 401 || apiError.status === 403,
      isNotFound: apiError.status === 404,
      isServerError: apiError.status >= 500,
      isNetworkError: apiError.status === 0,
    }
  }

  // Generic error
  return {
    status: 500,
    message: error?.message || 'An unexpected error occurred',
    isValidationError: false,
    isAuthError: false,
    isNotFound: false,
    isServerError: true,
    isNetworkError: false,
  }
}

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.isValidationError) {
    return error.message || 'Please check the form for errors'
  }

  if (error.isAuthError) {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again.'
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action.'
    }
  }

  if (error.isNotFound) {
    return 'The requested resource was not found.'
  }

  if (error.isNetworkError) {
    return 'Network error. Please check your internet connection.'
  }

  if (error.isServerError) {
    return 'A server error occurred. Please try again later.'
  }

  return error.message || 'An error occurred'
}

/**
 * Apply field errors to form
 */
export const applyFieldErrors = (error, setFieldError) => {
  if (error.fieldErrors) {
    Object.entries(error.fieldErrors).forEach(([field, message]) => {
      setFieldError(field, message)
    })
  }
}

/**
 * Get first field error message (for display)
 */
export const getFirstFieldError = (error) => {
  if (error.fieldErrors) {
    const entries = Object.entries(error.fieldErrors)
    if (entries.length > 0) {
      return entries[0][1]
    }
  }
  return null
}

/**
 * Check if error is of specific type
 */
export const isValidationError = (error) => {
  const normalized = mapError(error)
  return normalized.isValidationError
}

export const isAuthError = (error) => {
  const normalized = mapError(error)
  return normalized.isAuthError
}

export const isNotFoundError = (error) => {
  const normalized = mapError(error)
  return normalized.isNotFound
}

/**
 * Create error handler for forms
 */
export const createFormErrorHandler = (setFieldError, setFormError) => {
  return (error) => {
    const normalized = mapError(error)
    
    // Apply field errors if validation error
    if (normalized.isValidationError && normalized.fieldErrors) {
      applyFieldErrors(normalized, setFieldError)
    }
    
    // Set general form error
    const message = getErrorMessage(normalized)
    setFormError(message)
  }
}

export default {
  mapError,
  getErrorMessage,
  applyFieldErrors,
  getFirstFieldError,
  isValidationError,
  isAuthError,
  isNotFoundError,
  createFormErrorHandler,
}






