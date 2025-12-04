import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson is required']
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section is required']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  // Quiz/Question attempts
  questionsAttempted: {
    type: Number,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  quizScores: [{
    score: Number,
    totalQuestions: Number,
    attemptedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Notes and bookmarks
  notes: {
    type: String,
    default: ''
  },
  isBookmarked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });
progressSchema.index({ user: 1, section: 1 });
progressSchema.index({ user: 1, subject: 1 });
progressSchema.index({ status: 1 });
progressSchema.index({ lastAccessedAt: -1 });

// Virtual for quiz average score
progressSchema.virtual('averageQuizScore').get(function() {
  if (this.quizScores.length === 0) return 0;
  const total = this.quizScores.reduce((sum, quiz) => {
    return sum + (quiz.score / quiz.totalQuestions * 100);
  }, 0);
  return (total / this.quizScores.length).toFixed(2);
});

// Method to update progress
progressSchema.methods.updateProgress = function(percentage) {
  this.progress = Math.min(100, Math.max(0, percentage));
  if (this.progress === 100 && !this.completedAt) {
    this.status = 'completed';
    this.completedAt = Date.now();
  } else if (this.progress > 0 && this.progress < 100) {
    this.status = 'in-progress';
  }
  this.lastAccessedAt = Date.now();
  return this.save();
};

// Method to add quiz score
progressSchema.methods.addQuizScore = function(score, totalQuestions) {
  this.quizScores.push({
    score,
    totalQuestions,
    attemptedAt: Date.now()
  });
  this.questionsAttempted += totalQuestions;
  this.questionsCorrect += score;
  return this.save();
};

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;

