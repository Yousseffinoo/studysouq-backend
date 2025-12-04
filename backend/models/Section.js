import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
sectionSchema.index({ subject: 1, order: 1 });
sectionSchema.index({ isActive: 1 });

const Section = mongoose.model('Section', sectionSchema);

export default Section;

