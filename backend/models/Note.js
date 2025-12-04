import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['physics', 'chemistry', 'mathematics', 'biology', 'computer-science'],
    default: 'physics'
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['9th', '10th', '11th', '12th'],
    default: '9th'
  },
  chapter: {
    type: Number,
    required: [true, 'Chapter number is required']
  },
  type: {
    type: String,
    enum: ['formula', 'definition', 'theorem', 'example', 'summary', 'tips'],
    default: 'summary'
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    caption: String,
    publicId: String // For Cloudinary
  }],
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
  likes: {
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
noteSchema.pre('save', function(next) {
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

// Indexes
noteSchema.index({ subject: 1, class: 1, chapter: 1 });
noteSchema.index({ slug: 1 });
noteSchema.index({ lesson: 1 });
noteSchema.index({ tags: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;

