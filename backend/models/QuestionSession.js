import mongoose from 'mongoose';

const questionSessionSchema = new mongoose.Schema({
  // Session owner
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Session configuration
  subject: {
    type: String,
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    default: null
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  
  // Quiz settings
  numberOfQuestions: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  sourceType: {
    type: String,
    enum: ['past_paper', 'ai_generated', 'manual', 'mixed'],
    default: 'mixed'
  },
  answerMode: {
    type: String,
    enum: ['instant', 'write', 'upload'],
    default: 'instant'
  },

  // Session questions
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      default: null // null for AI-generated
    },
    aiQuestion: {
      type: mongoose.Schema.Types.Mixed,
      default: null // Store AI question data directly
    },
    order: Number,
    answered: {
      type: Boolean,
      default: false
    },
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentAttempt',
      default: null
    }
  }],

  // Flag for AI-generated sessions
  isAIGenerated: {
    type: Boolean,
    default: false
  },

  // Session state
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },

  // Results
  totalQuestions: {
    type: Number,
    default: 0
  },
  questionsAnswered: {
    type: Number,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  maxPossibleScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },

  // Timing
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  totalTimeSeconds: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for finding active sessions
questionSessionSchema.index({ student: 1, status: 1 });
questionSessionSchema.index({ student: 1, createdAt: -1 });

// Method to complete session
questionSessionSchema.methods.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.totalTimeSeconds = Math.floor((this.completedAt - this.startedAt) / 1000);
  
  if (this.questionsAnswered > 0) {
    this.averageScore = Math.round(this.totalScore / this.questionsAnswered);
  }
  
  await this.save();
  return this;
};

// Method to update progress
questionSessionSchema.methods.recordAnswer = async function(questionIndex, attemptId, isCorrect, score) {
  if (this.questions[questionIndex]) {
    this.questions[questionIndex].answered = true;
    this.questions[questionIndex].attempt = attemptId;
  }
  
  this.questionsAnswered += 1;
  if (isCorrect) {
    this.questionsCorrect += 1;
  }
  this.totalScore += score;
  this.currentQuestionIndex = questionIndex + 1;
  
  // Auto-complete if all questions answered
  if (this.questionsAnswered >= this.totalQuestions) {
    await this.complete();
  } else {
    await this.save();
  }
  
  return this;
};

// Static method to get or create active session
questionSessionSchema.statics.getActiveSession = async function(studentId) {
  return await this.findOne({
    student: studentId,
    status: 'active'
  }).populate('questions.question');
};

const QuestionSession = mongoose.model('QuestionSession', questionSessionSchema);

export default QuestionSession;

