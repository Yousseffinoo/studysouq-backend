import { verifyAccessToken } from '../utils/tokenUtils.js';
import User from '../models/User.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (case-insensitive)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer '))) {
      token = authHeader.split(' ')[1];
    } 
    // Check in cookies
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // Check in query params (for testing only - not recommended for production)
    else if (req.query?.token && process.env.NODE_ENV === 'development') {
      token = req.query.token;
    }

    if (!token) {
      // Log for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Token missing - Request details:', {
          url: req.url,
          method: req.method,
          hasAuthHeader: !!authHeader,
          hasCookies: !!req.cookies,
          headers: Object.keys(req.headers).filter(h => h.toLowerCase().includes('auth'))
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token is missing. Please login and include the token in the Authorization header as: Bearer <token>',
        hint: 'Make sure you are logged in and the token is being sent in the request headers.'
      });
    }

    const decoded = verifyAccessToken(token);
    const userId = decoded.userId || decoded.id || decoded.sub;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload' 
      });
    }

    const user = await User.findById(userId).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
};

// Check if user is premium
export const checkPremium = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first'
      });
    }

    if (!req.user.isPremiumActive()) {
      return res.status(403).json({
        success: false,
        message: 'This content is only available for premium users. Please upgrade your plan.',
        isPremiumRequired: true
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking premium status',
      error: error.message
    });
  }
};

// Check if user is admin
export const admin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }
    
    if (req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin middleware error:', error);
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error checking admin privileges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional auth - doesn't require authentication but adds user if available
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('-password -refreshToken');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid but continue without user
        console.log('Optional auth: Token invalid, continuing without user');
      }
    }

    next();
  } catch (error) {
    next();
  }
};

