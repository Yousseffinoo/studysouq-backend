import mongoose from 'mongoose';

const aiConfigSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'mistral', 'groq'],
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true,
    select: false // Don't return API key by default
  },
  model: {
    type: String,
    required: true
  },
  availableModels: [{
    type: String
  }],
  isEnabled: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  maxTokens: {
    type: Number,
    default: 2000
  },
  temperature: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 2
  },
  systemPrompt: {
    type: String,
    default: 'You are a helpful educational tutor assistant.'
  },
  requestCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  config: {
    type: mongoose.Schema.Types.Mixed, // For provider-specific configs
    default: {}
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one default provider
aiConfigSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('AIConfig').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const AIConfig = mongoose.model('AIConfig', aiConfigSchema);

export default AIConfig;

