import { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginService,
  signup as signupService,
  logout as logoutService,
  getCurrentUser,
  isAuthenticated as checkAuth,
  getStoredUser,
} from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (checkAuth()) {
        // Get stored user first
        const storedUser = getStoredUser();
        const storedToken = localStorage.getItem('accessToken');
        setUser(storedUser);
        setIsAuthenticated(true);
        setToken(storedToken);

        // Then fetch fresh user data
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.user);
        } else {
          // If fetch fails, clear auth
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await loginService(email, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setToken(localStorage.getItem('accessToken'));
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await signupService(name, email, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setToken(localStorage.getItem('accessToken'));
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    const result = await getCurrentUser();
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

