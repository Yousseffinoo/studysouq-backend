import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default in queries
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'github'],
    default: 'local'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: {
    type: Date,
    default: null
  },
  premiumPlan: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime', null],
    default: null
  },
  premiumStartDate: {
    type: Date,
    default: null
  },
  lastPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) return next();
  
  // Don't hash if password is empty (social login)
  if (!this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If lock has expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Check if premium is active
userSchema.methods.isPremiumActive = function() {
  if (!this.isPremium) return false;
  if (!this.premiumExpiry) return true; // Lifetime premium
  return this.premiumExpiry > Date.now();
};

// Activate premium subscription
userSchema.methods.activatePremium = function(planType, paymentId) {
  this.isPremium = true;
  this.premiumPlan = planType;
  this.premiumStartDate = new Date();
  this.lastPaymentId = paymentId;
  
  // Calculate expiry based on plan type
  if (planType === 'monthly') {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    this.premiumExpiry = expiry;
  } else if (planType === 'yearly') {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    this.premiumExpiry = expiry;
  } else if (planType === 'lifetime') {
    this.premiumExpiry = null; // No expiry for lifetime
  }
  
  return this.save();
};

// Deactivate premium (for expired subscriptions)
userSchema.methods.deactivatePremium = function() {
  this.isPremium = false;
  // Keep history: don't reset premiumPlan, premiumStartDate, premiumExpiry
  return this.save();
};

// Transform output (remove sensitive fields)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.loginAttempts;
  delete user.lockUntil;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;

