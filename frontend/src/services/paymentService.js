import { API_BASE_URL } from '../config/api';

/**
 * Payment Service
 * Frontend service for handling all payment-related API calls
 */

class PaymentService {
  /**
   * Get available pricing plans
   */
  async getPricingPlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/plans`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get plans error:', error);
      throw error;
    }
  }

  /**
   * Start payment process
   */
  async startPayment(token, paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Start payment error:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(token, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/history?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get history error:', error);
      throw error;
    }
  }

  /**
   * Get specific payment details
   */
  async getPaymentDetails(token, paymentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get payment details error:', error);
      throw error;
    }
  }

  /**
   * Verify payment status manually
   */
  async verifyPayment(token, paymentId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/verify/${paymentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const paymentService = new PaymentService();
export default paymentService;

