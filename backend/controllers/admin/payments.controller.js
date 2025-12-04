import Payment from '../../models/Payment.js';
import User from '../../models/User.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Admin
export const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { paymobOrderId: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } },
        { 'billingData.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Transform payments to match frontend expectations
    const transformedPayments = payments.map(payment => ({
      ...payment,
      userName: payment.user?.name || 'Unknown User',
      userEmail: payment.user?.email || '',
      transactionId: payment.paymobTransactionId || payment.paymobOrderId,
      date: payment.createdAt || payment.completedAt
    }));

    const count = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments: transformedPayments,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllPayments", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single payment
// @route   GET /api/admin/payments/:id
// @access  Admin
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .lean();
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Transform to match frontend expectations
    const transformedPayment = {
      ...payment,
      userName: payment.user?.name || 'Unknown User',
      userEmail: payment.user?.email || '',
      transactionId: payment.paymobTransactionId || payment.paymobOrderId,
      date: payment.createdAt || payment.completedAt
    };

    res.status(200).json({
      success: true,
      data: transformedPayment
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getPaymentById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/admin/payments/stats
// @access  Admin
export const getPaymentStats = async (req, res) => {
  try {
    const [
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalRevenue
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'success' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'failed' }),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Revenue by plan type
    const revenueByPlan = await Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$planType',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent payments (last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentPayments = await Payment.countDocuments({
      status: 'success',
      createdAt: { $gte: last30Days }
    });

    // Revenue in last 30 days
    const recentRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: last30Days }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        successfulPayments,
        pendingPayments,
        failedPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentPayments,
        recentRevenue: recentRevenue[0]?.total || 0,
        revenueByPlan,
        // Frontend expects these field names
        completedCount: successfulPayments,
        pendingRevenue: 0 // Calculate if needed
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getPaymentStats", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create payment (manual entry)
// @route   POST /api/admin/payments
// @access  Admin
export const createPayment = async (req, res) => {
  try {
    // Accept both 'user' and 'userId' for frontend compatibility
    const {
      user,
      userId,
      amount,
      currency,
      planType,
      planName,
      status,
      paymentMethod,
      billingData,
      subscriptionStart,
      subscriptionEnd,
      transactionId,
      date
    } = req.body;
    
    const userIdValue = userId || user;

    // Validate user exists
    const userDoc = await User.findById(userIdValue);
    if (!userDoc) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate unique order ID
    const paymobOrderId = `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Map status: 'completed' -> 'success'
    const paymentStatus = status === 'completed' ? 'success' : (status || 'success');

    const payment = await Payment.create({
      user: userIdValue,
      paymobOrderId,
      paymobTransactionId: transactionId || paymobOrderId,
      amount: parseFloat(amount),
      currency: currency || 'EGP',
      planType: planType || 'monthly',
      planName: planName || 'Manual Payment',
      status: paymentStatus,
      paymentMethod: paymentMethod || 'other',
      billingData,
      subscriptionStart: subscriptionStart ? new Date(subscriptionStart) : undefined,
      subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : undefined,
      hmacVerified: true,
      completedAt: paymentStatus === 'success' ? (date ? new Date(date) : new Date()) : null
    });

    // If payment is successful, update user premium status
    if (status === 'success' && subscriptionEnd) {
      userDoc.isPremium = true;
      userDoc.premiumExpiry = subscriptionEnd;
      await userDoc.save();
    }

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'payment_created',
        'payment',
        payment._id,
        { 
          amount: payment.amount, 
          planName: payment.planName,
          status: payment.status
        }
      );
    } catch (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in createPayment:', logError.message);
      }
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name email')
      .lean();

    // Transform to match frontend expectations
    const transformedPayment = {
      ...populatedPayment,
      userName: populatedPayment.user?.name || 'Unknown User',
      userEmail: populatedPayment.user?.email || '',
      transactionId: populatedPayment.paymobTransactionId || populatedPayment.paymobOrderId,
      date: populatedPayment.createdAt || populatedPayment.completedAt
    };

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: transformedPayment
    });
  } catch (error) {
    console.error("ERROR ORIGIN: createPayment", error.stack || error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.length > 0 ? errors : [error.message]
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update payment
// @route   PUT /api/admin/payments/:id
// @access  Admin
export const updatePayment = async (req, res) => {
  try {
    const {
      status,
      amount,
      subscriptionStart,
      subscriptionEnd,
      errorMessage,
      errorCode
    } = req.body;

    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update fields
    if (status) {
      payment.status = status;
      if (status === 'success') {
        payment.completedAt = new Date();
        payment.hmacVerified = true;
      } else if (status === 'failed') {
        payment.errorMessage = errorMessage || payment.errorMessage;
        payment.errorCode = errorCode || payment.errorCode;
      }
    }
    if (amount) payment.amount = amount;
    if (subscriptionStart) payment.subscriptionStart = subscriptionStart;
    if (subscriptionEnd) payment.subscriptionEnd = subscriptionEnd;

    await payment.save();

    // If payment status changed to success, update user premium status
    if (status === 'success' && payment.subscriptionEnd) {
      const userDoc = await User.findById(payment.user);
      if (userDoc) {
        userDoc.isPremium = true;
        userDoc.premiumExpiry = payment.subscriptionEnd;
        await userDoc.save();
      }
    }

    await createActivityLog(
      req.user,
      'payment_updated',
      'payment',
      payment._id,
      { status: payment.status, amount: payment.amount }
    );

    const populatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name email')
      .lean();

    // Transform to match frontend expectations
    const transformedPayment = {
      ...populatedPayment,
      userName: populatedPayment.user?.name || 'Unknown User',
      userEmail: populatedPayment.user?.email || '',
      transactionId: populatedPayment.paymobTransactionId || populatedPayment.paymobOrderId,
      date: populatedPayment.createdAt || populatedPayment.completedAt
    };

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: transformedPayment
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updatePayment", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

