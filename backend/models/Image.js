import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  publicId: {
    type: String, // Cloudinary public ID
    default: null // Optional - can be null if not using Cloudinary
  },
  format: {
    type: String, // jpg, png, svg, etc
    required: true
  },
  size: {
    type: Number, // in bytes
    required: true
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  category: {
    type: String,
    enum: ['diagram', 'graph', 'formula', 'illustration', 'photo', 'question', 'answer', 'profile', 'other'],
    default: 'other'
  },
  subject: {
    type: String,
    enum: ['physics', 'chemistry', 'mathematics', 'biology', 'computer-science', 'general'],
    default: 'general'
  },
  relatedTo: {
    type: String,
    enum: ['lesson', 'note', 'question', 'other'],
    default: 'other'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedTo'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
imageSchema.index({ uploadedBy: 1 });
imageSchema.index({ status: 1 });
imageSchema.index({ subject: 1 });
imageSchema.index({ category: 1 });
imageSchema.index({ tags: 1 });

const Image = mongoose.model('Image', imageSchema);

export default Image;

