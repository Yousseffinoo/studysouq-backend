import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Pricing from '../models/Pricing.js';
import paymobService from '../services/paymob.service.js';

/**
 * Payment Controller
 * Handles all payment-related operations
 * Paymob integration ke sare endpoints yahan hain
 */

/**
 * @desc    Start payment process (Complete flow)
 * @route   POST /api/payments/start
 * @access  Private (Authenticated users only)
 */
export const startPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planType, planName, amount, currency = 'EGP' } = req.body;

    // Validation
    if (!planType || !planName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Plan type, name, and amount are required',
      });
    }

    // Validate plan type
    const validPlans = ['monthly', 'yearly', 'lifetime'];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type. Must be monthly, yearly, or lifetime',
      });
    }

    // Check if Paymob is configured
    if (!paymobService.isConfigured()) {
      // TEST MODE: Return fake payment data for testing
      console.log('⚠️  TEST MODE: Paymob not configured, returning test payment URL');
      
      const testPaymentId = `test_payment_${Date.now()}`;
      
      return res.status(200).json({
        success: true,
        message: 'TEST MODE: Payment initiated (Paymob not configured)',
        data: {
          paymentId: testPaymentId,
          orderId: `test_order_${Date.now()}`,
          paymentKey: 'test_payment_key',
          iframeId: 'TEST_IFRAME',
          iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/TEST_IFRAME?payment_token=test_token_${Date.now()}`,
          amount: amount,
          currency: currency,
          planName: planName,
          isTestMode: true,
        },
      });
    }

    // DEMO MODE: Bypass Paymob if credentials are invalid (for UI testing only)
    // Remove this in production!
    if (process.env.PAYMOB_DEMO_MODE === 'true') {
      console.log('🎭 DEMO MODE: Simulating successful payment (no real transaction)');
      
      const demoPaymentId = await Payment.create({
        user: userId,
        paymobOrderId: `demo_order_${Date.now()}`,
        amount: amount,
        currency: currency,
        planType: planType,
        planName: planName,
        status: 'success',
        paymobTransactionId: `demo_txn_${Date.now()}`,
        billingData: {
          email: user.email,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
        },
        completedAt: new Date(),
        hmacVerified: true,
        metadata: {
          demoMode: true,
          note: 'This is a demo payment for UI testing only',
        },
      });

      // Activate premium
      await user.activatePremium(planType, demoPaymentId._id);

      return res.status(200).json({
        success: true,
        message: 'DEMO MODE: Payment simulated successfully',
        data: {
          paymentId: demoPaymentId._id,
          orderId: `demo_order_${Date.now()}`,
          isDemoMode: true,
          premiumActivated: true,
        },
      });
    }

    // Get user details for billing
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate unique merchant order ID
    const merchantOrderId = `ORDER_${userId}_${Date.now()}`;

    // Convert amount to cents
    const amountCents = paymobService.toCents(amount);

    console.log(`💰 Starting payment: ${user.email} - ${planName} - ${amount} ${currency}`);

    // Prepare billing data
    const billingData = {
      email: user.email,
      firstName: user.name.split(' ')[0] || 'User',
      lastName: user.name.split(' ').slice(1).join(' ') || 'Name',
      phone: req.body.phone || '+201000000000', // Required by Paymob
      apartment: 'NA',
      floor: 'NA',
      street: 'NA',
      building: 'NA',
      city: req.body.city || 'Cairo',
      country: req.body.country || 'Egypt',
      state: 'NA',
      postalCode: req.body.postalCode || '00000',
    };

    // Initiate payment with Paymob
    const paymentResult = await paymobService.initiatePayment({
      amountCents,
      currency,
      merchantOrderId,
      billingData,
      items: [
        {
          name: planName,
          amount_cents: amountCents,
          description: `${planType} subscription plan`,
          quantity: 1,
        },
      ],
    });

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate payment',
        error: paymentResult.error,
      });
    }

    // Create payment record in database
    const payment = await Payment.create({
      user: userId,
      paymobOrderId: paymentResult.orderId,
      amount: amount,
      currency: currency,
      planType: planType,
      planName: planName,
      status: 'pending',
      paymobPaymentKey: paymentResult.paymentKey,
      billingData: billingData,
      metadata: {
        merchantOrderId,
        userEmail: user.email,
        userName: user.name,
      },
    });

    console.log('✅ Payment record created:', payment._id);

    // Return payment URL and details
    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        paymentId: payment._id,
        orderId: paymentResult.orderId,
        paymentKey: paymentResult.paymentKey,
        iframeId: paymentResult.iframeId,
        iframeUrl: paymentResult.iframeUrl,
        amount: amount,
        currency: currency,
        planName: planName,
      },
    });
  } catch (error) {
    console.error('❌ Payment start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Paymob Webhook Handler
 * @route   POST /api/payments/webhook
 * @access  Public (Called by Paymob)
 * 
 * IMPORTANT: Yeh route public hai lekin HMAC se verify hota hai
 */
export const handleWebhook = async (req, res) => {
  try {
    console.log('🔔 Webhook received from Paymob');

    const webhookData = req.body;

    // Extract important fields
    const {
      id: transactionId,
      success,
      pending,
      order,
      amount_cents,
      currency,
      source_data_type,
      source_data_sub_type,
    } = webhookData;

    // Step 1: Verify HMAC signature
    const isValid = paymobService.verifyHmac(webhookData);
    if (!isValid) {
      console.error('❌ Invalid HMAC signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    console.log('✅ HMAC verified');

    // Step 2: Find payment record by Paymob order ID
    let orderId = order;
    if (typeof order === 'object') {
      orderId = order.id;
    }

    const payment = await Payment.findOne({ paymobOrderId: orderId });
    if (!payment) {
      console.error('❌ Payment record not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    console.log('📄 Payment found:', payment._id);

    // Step 3: Update payment status based on webhook data
    if (success && !pending) {
      // Payment successful
      console.log('✅ Payment successful');

      // Mark payment as successful
      await payment.markAsSuccess(transactionId, webhookData);

      // Get user and activate premium
      const user = await User.findById(payment.user);
      if (user) {
        await user.activatePremium(payment.planType, payment._id);
        console.log(`✅ Premium activated for user: ${user.email}`);
      }

      // Update payment with subscription dates
      payment.subscriptionStart = new Date();
      if (payment.planType === 'monthly') {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        payment.subscriptionEnd = expiry;
      } else if (payment.planType === 'yearly') {
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        payment.subscriptionEnd = expiry;
      }
      payment.paymentMethod = source_data_sub_type || source_data_type || 'card';
      await payment.save();
    } else if (pending) {
      // Payment still pending
      console.log('⏳ Payment pending');
      // Keep status as pending
    } else {
      // Payment failed
      console.log('❌ Payment failed');
      await payment.markAsFailed('Payment was not successful', 'PAYMENT_FAILED');
    }

    // Return success to Paymob
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's payment history
 * @route   GET /api/payments/history
 * @access  Private
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const payments = await Payment.getUserPayments(userId, limit);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error('❌ Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific payment details
 * @route   GET /api/payments/:paymentId
 * @access  Private
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId,
    }).select('-webhookData');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('❌ Payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify payment status (Manual check)
 * @route   POST /api/payments/verify/:paymentId
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentId } = req.params;

    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // If already successful, return success
    if (payment.status === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Payment is already successful',
        data: {
          status: payment.status,
          isPremium: true,
        },
      });
    }

    // Check with Paymob if payment is pending
    if (payment.paymobTransactionId) {
      try {
        const transactionDetails = await paymobService.getTransactionDetails(
          payment.paymobTransactionId
        );

        // Update based on current status
        if (transactionDetails.success) {
          await payment.markAsSuccess(payment.paymobTransactionId, transactionDetails);
          
          const user = await User.findById(userId);
          if (user) {
            await user.activatePremium(payment.planType, payment._id);
          }

          return res.status(200).json({
            success: true,
            message: 'Payment verified and premium activated',
            data: {
              status: 'success',
              isPremium: true,
            },
          });
        }
      } catch (error) {
        console.error('Transaction verification error:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved',
      data: {
        status: payment.status,
        isPremium: payment.status === 'success',
      },
    });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Get available pricing plans
 * @route   GET /api/payments/plans
 * @access  Public
 */
export const getPricingPlans = async (req, res) => {
  try {
    // Fetch active pricing plans from database
    const plans = await Pricing.find({ isActive: true })
      .sort('displayOrder')
      .select('name type subject price currency duration features displayOrder _id')
      .lean();

    // Transform plans to match frontend format
    const transformedPlans = plans.map(plan => ({
      id: plan._id.toString(),
      _id: plan._id.toString(),
      name: plan.name,
      type: plan.type,
      subject: plan.subject || 'all',
      price: plan.price,
      currency: plan.currency || 'PKR',
      duration: plan.duration, // in days
      durationText: plan.duration === 30 ? '1 month' : 
                    plan.duration === 365 ? '1 year' : 
                    plan.duration === 730 ? '2 years' :
                    `${plan.duration} days`,
      features: plan.features || [],
      displayOrder: plan.displayOrder || 0,
      popular: plan.displayOrder === 1 || plan.type === 'monthly', // Mark first or monthly as popular
    }));

    // If no plans in database, return empty array
    res.status(200).json({
      success: true,
      data: transformedPlans,
    });
  } catch (error) {
    console.error('❌ Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default {
  startPayment,
  handleWebhook,
  getPaymentHistory,
  getPaymentDetails,
  verifyPayment,
  getPricingPlans,
};

