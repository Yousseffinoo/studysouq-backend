import crypto from 'crypto';

/**
 * Paymob Payment Gateway Service
 * Complete integration for payment processing
 * 
 * Documentation: https://docs.paymob.com/docs/accept-standard-redirect
 */

class PaymobService {
  constructor() {
    // Note: Constructor runs before dotenv loads, so we don't validate here
    // Validation happens in isConfigured() method when actually needed
    this.apiKey = null;
    this.publicKey = null;
    this.integrationId = null;
    this.iframeId = null;
    this.hmacSecret = null;
    this.baseUrl = 'https://accept.paymob.com/api';
    this.initialized = false;
  }

  // Lazy load credentials from environment
  _loadCredentials() {
    if (!this.initialized) {
      this.apiKey = process.env.PAYMOB_API_KEY;
      this.publicKey = process.env.PAYMOB_PUBLIC_KEY;
      this.integrationId = process.env.PAYMOB_INTEGRATION_ID;
      this.iframeId = process.env.PAYMOB_IFRAME_ID;
      this.hmacSecret = process.env.PAYMOB_HMAC;
      this.initialized = true;

      // Log status after loading
      if (this.isConfigured()) {
        console.log('✅ Paymob configured successfully');
        console.log('  - Integration ID:', this.integrationId);
        console.log('  - Iframe ID:', this.iframeId);
      } else {
        console.warn('⚠️  Paymob credentials incomplete:');
        console.log('  - API Key:', this.apiKey ? '✅' : '❌ Missing');
        console.log('  - Integration ID:', this.integrationId ? '✅' : '❌ Missing');
        console.log('  - HMAC Secret:', this.hmacSecret ? '✅' : '❌ Missing');
      }
    }
  }

  /**
   * Step 1: Authentication Request
   * Get authentication token from Paymob
   * یہ first step ہے - API key use karke token milta hai
   */
  async authenticate() {
    this._loadCredentials();
    try {
      const response = await fetch(`${this.baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.detail || 'Failed to authenticate with Paymob';
        
        console.error('❌ Paymob authentication failed');
        console.error('   Status:', response.status);
        console.error('   Error:', errorMsg);
        console.error('   API Key (first 20 chars):', this.apiKey?.substring(0, 20) + '...');
        console.error('\n💡 Solutions:');
        console.error('   1. Regenerate API Key from Paymob Dashboard');
        console.error('   2. Check if account is active and verified');
        console.error('   3. Verify Integration ID is correct');
        console.error('   4. Enable DEMO MODE in .env: PAYMOB_DEMO_MODE=true\n');
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('✅ Paymob authentication successful');
      return data.token;
    } catch (error) {
      console.error('❌ Paymob authentication error:', error.message);
      throw new Error(`Paymob authentication failed: ${error.message}`);
    }
  }

  /**
   * Step 2: Order Registration
   * Create order in Paymob system
   * Order create karte hain amount aur delivery info ke sath
   */
  async createOrder(authToken, orderData) {
    try {
      const {
        amountCents, // Amount in cents (e.g., 10000 = 100 EGP)
        currency = 'EGP',
        merchantOrderId,
        items = [],
      } = orderData;

      const response = await fetch(`${this.baseUrl}/ecommerce/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_token: authToken,
          delivery_needed: 'false', // Digital product
          amount_cents: amountCents,
          currency: currency,
          merchant_order_id: merchantOrderId,
          items: items,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create order');
      }

      const data = await response.json();
      console.log('✅ Order created:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Order creation error:', error.message);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Step 3: Payment Key Request
   * Generate payment key for iframe
   * Payment key banate hain jo iframe mein use hogi
   */
  async generatePaymentKey(authToken, paymentData) {
    try {
      const {
        amountCents,
        orderId,
        currency = 'EGP',
        billingData,
      } = paymentData;

      const response = await fetch(`${this.baseUrl}/acceptance/payment_keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amountCents,
          expiration: 3600, // 1 hour expiry
          order_id: orderId,
          billing_data: {
            apartment: billingData.apartment || 'NA',
            email: billingData.email,
            floor: billingData.floor || 'NA',
            first_name: billingData.firstName,
            street: billingData.street || 'NA',
            building: billingData.building || 'NA',
            phone_number: billingData.phone,
            shipping_method: 'NA',
            postal_code: billingData.postalCode || 'NA',
            city: billingData.city || 'Cairo',
            country: billingData.country || 'Egypt',
            last_name: billingData.lastName,
            state: billingData.state || 'NA',
          },
          currency: currency,
          integration_id: this.integrationId,
          lock_order_when_paid: 'true',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate payment key');
      }

      const data = await response.json();
      console.log('✅ Payment key generated');
      return data.token; // This is the payment key
    } catch (error) {
      console.error('❌ Payment key generation error:', error.message);
      throw new Error(`Failed to generate payment key: ${error.message}`);
    }
  }

  /**
   * Complete Payment Flow
   * Sab steps ek sath chalate hain
   * یہ main function ہے جو سب کچھ handle کرتا ہے
   */
  async initiatePayment(orderDetails) {
    try {
      console.log('🚀 Starting payment flow...');

      // Step 1: Authenticate
      const authToken = await this.authenticate();

      // Step 2: Create order
      const order = await this.createOrder(authToken, {
        amountCents: orderDetails.amountCents,
        currency: orderDetails.currency || 'EGP',
        merchantOrderId: orderDetails.merchantOrderId,
        items: orderDetails.items || [],
      });

      // Step 3: Generate payment key
      const paymentKey = await this.generatePaymentKey(authToken, {
        amountCents: orderDetails.amountCents,
        orderId: order.id,
        currency: orderDetails.currency || 'EGP',
        billingData: orderDetails.billingData,
      });

      console.log('✅ Payment flow initiated successfully');

      return {
        success: true,
        orderId: order.id,
        paymentKey: paymentKey,
        iframeId: this.iframeId,
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${this.iframeId}?payment_token=${paymentKey}`,
      };
    } catch (error) {
      console.error('❌ Payment initiation failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify HMAC Signature from Webhook
   * Webhook se aaye data ko verify karte hain
   * Security ke liye bahut zaroori hai
   */
  verifyHmac(webhookData) {
    try {
      const {
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order,
        owner,
        pending,
        source_data_pan,
        source_data_sub_type,
        source_data_type,
        success,
        hmac,
      } = webhookData;

      // Construct the concatenated string (ORDER MATTERS!)
      // یہ order bilkul wesa hi hona chahiye jesa Paymob documentation mein hai
      const concatenatedString = [
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_refunded,
        is_standalone_payment,
        is_voided,
        order?.id || order,
        owner,
        pending,
        source_data_pan,
        source_data_sub_type,
        source_data_type,
        success,
      ].join('');

      // Calculate HMAC
      const calculatedHmac = crypto
        .createHmac('sha512', this.hmacSecret)
        .update(concatenatedString)
        .digest('hex');

      const isValid = calculatedHmac === hmac;

      if (isValid) {
        console.log('✅ HMAC verification successful');
      } else {
        console.error('❌ HMAC verification failed');
        console.log('Expected:', calculatedHmac);
        console.log('Received:', hmac);
      }

      return isValid;
    } catch (error) {
      console.error('❌ HMAC verification error:', error.message);
      return false;
    }
  }

  /**
   * Get transaction details
   * Transaction ki details fetch karte hain
   */
  async getTransactionDetails(transactionId) {
    try {
      const authToken = await this.authenticate();
      
      const response = await fetch(
        `${this.baseUrl}/acceptance/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Transaction fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Convert amount to cents
   * EGP amount ko cents mein convert karte hain
   */
  toCents(amount) {
    return Math.round(amount * 100);
  }

  /**
   * Convert cents to amount
   * Cents ko wapas EGP mein convert karte hain
   */
  fromCents(cents) {
    return cents / 100;
  }

  /**
   * Check if Paymob is configured
   * Environment variables check karte hain
   */
  isConfigured() {
    this._loadCredentials();
    return !!(
      this.apiKey &&
      this.integrationId &&
      this.hmacSecret
    );
  }
}

// Export singleton instance
const paymobService = new PaymobService();
export default paymobService;

