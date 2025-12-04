import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['monthly', 'yearly', 'subject', 'lifetime'],
    required: true
  },
  subject: {
    type: String,
    enum: ['physics', 'chemistry', 'mathematics', 'biology', 'computer-science', 'all'],
    default: 'all'
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  duration: {
    type: Number, // in days
    required: true
  },
  features: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  stripePriceId: {
    type: String // For Stripe integration
  },
  paymobIntegrationId: {
    type: String // For Paymob integration
  }
}, {
  timestamps: true
});

// Indexes
pricingSchema.index({ type: 1, subject: 1 });
pricingSchema.index({ isActive: 1 });

const Pricing = mongoose.model('Pricing', pricingSchema);

export default Pricing;

