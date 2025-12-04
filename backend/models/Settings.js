import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // General Settings
  platformName: {
    type: String,
    default: 'Educational Platform'
  },
  supportEmail: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  
  // AI Tutor Settings
  aiModelName: {
    type: String,
    default: ''
  },
  aiApiEndpoint: {
    type: String,
    default: ''
  },
  
  // Payment Settings
  paymobPublicKey: {
    type: String,
    default: ''
  },
  paymobSecretKey: {
    type: String,
    default: ''
  },
  paymobHmac: {
    type: String,
    default: ''
  },
  paymobIntegrationId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;

