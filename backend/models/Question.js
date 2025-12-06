import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  // Relationship fields
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    index: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    default: null // Only for A-Level subjects
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson is required'],
    index: true
  },

  // Question content
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  questionImages: [{
    url: String,
    publicId: String,
    caption: String
  }],

  // Answer content
  answerText: {
    type: String,
    required: [true, 'Answer text is required']
  },
  answerImages: [{
    url: String,
    publicId: String,
    caption: String
  }],

  // AI-generated explanation (stored for reuse)
  explanation: {
    type: String,
    default: ''
  },
  steps: [{
    stepNumber: Number,
    content: String
  }],

  // Metadata
  marks: {
    type: Number,
    default: 1,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true
  },
  source: {
    type: String,
    enum: ['manual', 'past_paper', 'ai_generated'],
    default: 'manual',
    index: true
  },
  paperYear: {
    type: String,
    default: null // e.g., "2023", "May 2022"
  },
  paperSession: {
    type: String,
    default: null // e.g., "May/June", "Oct/Nov"
  },
  examBoard: {
    type: String,
    default: null // e.g., "Cambridge", "Edexcel"
  },

  // Original question reference (for past papers)
  originalQuestionNumber: {
    type: String,
    default: null // e.g., "1a", "2b"
  },
  
  // Tags for filtering and searching
  tags: [{
    type: String,
    trim: true
  }],

  // Examiner notes (from markscheme)
  examinerNotes: [{
    type: String
  }],

  // Statistics
  timesAttempted: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false // Admin has verified the question
  },

  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
questionSchema.index({ subject: 1, lesson: 1 });
questionSchema.index({ subject: 1, section: 1, lesson: 1 });
questionSchema.index({ difficulty: 1, source: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ '$**': 'text' }); // Full-text search

// Virtual for success rate
questionSchema.virtual('successRate').get(function() {
  if (this.timesAttempted === 0) return 0;
  return Math.round((this.timesCorrect / this.timesAttempted) * 100);
});

// Method to update statistics
questionSchema.methods.updateStats = async function(isCorrect, score) {
  this.timesAttempted += 1;
  if (isCorrect) {
    this.timesCorrect += 1;
  }
  // Update rolling average
  this.averageScore = ((this.averageScore * (this.timesAttempted - 1)) + score) / this.timesAttempted;
  await this.save();
};

const Question = mongoose.model('Question', questionSchema);

export default Question;
