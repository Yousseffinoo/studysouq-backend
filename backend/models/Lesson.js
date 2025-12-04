import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    // Removed enum restriction to allow any subject slug from Subject model
    default: 'physics'
  },
  chapter: {
    type: Number,
    required: [true, 'Chapter number is required']
  },
  order: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  videoUrl: {
    type: String,
    default: null
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
lessonSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Indexes for better query performance
lessonSchema.index({ subject: 1, chapter: 1 });
lessonSchema.index({ slug: 1 });
lessonSchema.index({ isPremium: 1 });
lessonSchema.index({ isVisible: 1 });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
