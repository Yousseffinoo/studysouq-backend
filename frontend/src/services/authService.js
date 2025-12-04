import api from '../config/api';

// Signup
export const signup = async (name, email, password) => {
  try {
    const response = await api.post('/auth/signup', {
      name,
      email,
      password,
    });
    
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store tokens and user
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
      errors: error.response?.data?.errors,
    };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    const { user, accessToken, refreshToken } = response.data.data;
    
    // Store tokens and user
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    const { user } = response.data.data;
    
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user',
    };
  }
};

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Email verification failed',
    };
  }
};

// Forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send reset email',
    };
  }
};

// Reset password
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Password reset failed',
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get stored user
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
