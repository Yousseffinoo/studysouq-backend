import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  level: {
    type: String,
    enum: ['igcse', 'a-level'],
    required: [true, 'Level is required']
  },
  icon: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#2F6FED'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
subjectSchema.index({ level: 1 });
subjectSchema.index({ isActive: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;

