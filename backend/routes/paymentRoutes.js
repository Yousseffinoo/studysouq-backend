import express from 'express';
import {
  startPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentDetails,
  verifyPayment,
  getPricingPlans,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Payment Routes
 * 
 * Public routes:
 * - GET /api/payments/plans - Get pricing plans
 * - POST /api/payments/webhook - Paymob webhook (HMAC verified)
 * 
 * Protected routes (require authentication):
 * - POST /api/payments/start - Start payment process
 * - GET /api/payments/history - Get user's payment history
 * - GET /api/payments/:paymentId - Get specific payment details
 * - POST /api/payments/verify/:paymentId - Manually verify payment status
 */

// Public routes
router.get('/plans', getPricingPlans);
router.post('/webhook', handleWebhook); // Paymob webhook (no auth, HMAC verified)

// Protected routes
router.post('/start', protect, startPayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId', protect, getPaymentDetails);
router.post('/verify/:paymentId', protect, verifyPayment);

export default router;

