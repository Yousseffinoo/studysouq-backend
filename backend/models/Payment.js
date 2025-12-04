import mongoose from 'mongoose';

/**
 * Payment Model
 * Stores all payment transactions and their status
 * Paymob integration ke liye designed
 */
const paymentSchema = mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Paymob Order Details
    paymobOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Payment details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'EGP', // Egyptian Pound (Paymob default)
      enum: ['EGP', 'USD', 'EUR', 'GBP'],
    },

    // Plan details
    planType: {
      type: String,
      required: true,
      enum: ['monthly', 'yearly', 'lifetime'],
    },

    planName: {
      type: String,
      required: true,
    },

    // Payment status
    status: {
      type: String,
      required: true,
      enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Paymob transaction details
    paymobTransactionId: {
      type: String,
      index: true,
    },

    paymobPaymentKey: {
      type: String,
    },

    // Webhook data (full response from Paymob)
    webhookData: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Payment method used
    paymentMethod: {
      type: String,
      enum: ['card', 'wallet', 'cash', 'installment', 'other'],
    },

    // Customer billing info
    billingData: {
      email: String,
      firstName: String,
      lastName: String,
      phone: String,
      country: String,
      city: String,
      postalCode: String,
      address: String,
    },

    // Subscription dates (for premium plans)
    subscriptionStart: {
      type: Date,
    },

    subscriptionEnd: {
      type: Date,
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Error details (if payment failed)
    errorMessage: {
      type: String,
    },

    errorCode: {
      type: String,
    },

    // HMAC verification status
    hmacVerified: {
      type: Boolean,
      default: false,
    },

    // Payment completed timestamp
    completedAt: {
      type: Date,
    },

    // Refund details
    refundedAt: {
      type: Date,
    },

    refundReason: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paymobOrderId: 1, status: 1 });

// Virtual for checking if payment is successful
paymentSchema.virtual('isSuccessful').get(function () {
  return this.status === 'success';
});

// Method to mark payment as successful
paymentSchema.methods.markAsSuccess = function (transactionId, webhookData = {}) {
  this.status = 'success';
  this.paymobTransactionId = transactionId;
  this.webhookData = webhookData;
  this.completedAt = new Date();
  this.hmacVerified = true;
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function (errorMessage, errorCode = null) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  return this.save();
};

// Static method to get user's payment history
paymentSchema.statics.getUserPayments = function (userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-webhookData') // Exclude sensitive webhook data
    .lean();
};

// Static method to get successful payments only
paymentSchema.statics.getSuccessfulPayments = function (userId) {
  return this.find({ user: userId, status: 'success' })
    .sort({ createdAt: -1 })
    .lean();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

