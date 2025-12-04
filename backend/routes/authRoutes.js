import express from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  signupValidation,
  loginValidation,
  emailValidation,
  passwordResetValidation,
  validate
} from '../middleware/validator.js';

const router = express.Router();

// Local Authentication Routes
router.post('/signup', signupValidation, validate, signup);
router.post('/register', signupValidation, validate, signup); // Alias for /signup to match admin panel
router.post('/login', loginValidation, validate, login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', protect, resendVerificationEmail);
router.post('/forgot-password', emailValidation, validate, forgotPassword);
router.post('/reset-password', passwordResetValidation, validate, resetPassword);
router.get('/me', protect, getMe);

export default router;

