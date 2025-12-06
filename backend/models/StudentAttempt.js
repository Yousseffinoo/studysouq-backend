import mongoose from 'mongoose';

const studentAttemptSchema = new mongoose.Schema({
  // References
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionSession',
    default: null
  },

  // Student's answer
  answerType: {
    type: String,
    enum: ['text', 'canvas', 'image', 'pdf', 'instant'],
    required: true
  },
  answerText: {
    type: String,
    default: ''
  },
  answerImageUrl: {
    type: String,
    default: null
  },
  answerImagePublicId: {
    type: String,
    default: null
  },

  // AI Evaluation
  isCorrect: {
    type: Boolean,
    default: null
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  marksAwarded: {
    type: Number,
    default: null
  },
  maxMarks: {
    type: Number,
    default: null
  },

  // AI Feedback
  aiExplanation: {
    type: String,
    default: ''
  },
  aiSteps: [{
    stepNumber: Number,
    content: String,
    isCorrect: Boolean
  }],
  aiFeedback: {
    type: String,
    default: ''
  },
  aiSuggestions: [{
    type: String
  }],

  // Metadata
  timeSpentSeconds: {
    type: Number,
    default: 0
  },
  attemptNumber: {
    type: Number,
    default: 1
  },

  // Context for analytics
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    index: true
  },
  subject: {
    type: String,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  }
}, {
  timestamps: true
});

// Compound indexes for analytics queries
studentAttemptSchema.index({ student: 1, createdAt: -1 });
studentAttemptSchema.index({ student: 1, lessonId: 1 });
studentAttemptSchema.index({ student: 1, subject: 1 });
studentAttemptSchema.index({ student: 1, isCorrect: 1 });
studentAttemptSchema.index({ student: 1, difficulty: 1, isCorrect: 1 });

// Static method to get student stats for a lesson
studentAttemptSchema.statics.getLessonStats = async function(studentId, lessonId) {
  const stats = await this.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId), lessonId: new mongoose.Types.ObjectId(lessonId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        averageScore: { $avg: '$score' },
        averageTime: { $avg: '$timeSpentSeconds' },
        totalTime: { $sum: '$timeSpentSeconds' }
      }
    }
  ]);
  return stats[0] || { totalAttempts: 0, correctAttempts: 0, averageScore: 0, averageTime: 0, totalTime: 0 };
};

// Static method to get weak topics
studentAttemptSchema.statics.getWeakTopics = async function(studentId, limit = 5) {
  const weakTopics = await this.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: '$lessonId',
        subject: { $first: '$subject' },
        totalAttempts: { $sum: 1 },
        correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        averageScore: { $avg: '$score' }
      }
    },
    {
      $addFields: {
        successRate: {
          $multiply: [
            { $divide: ['$correctAttempts', { $max: ['$totalAttempts', 1] }] },
            100
          ]
        }
      }
    },
    { $match: { totalAttempts: { $gte: 3 } } }, // Only consider lessons with enough attempts
    { $sort: { successRate: 1 } }, // Sort by worst performance first
    { $limit: limit },
    {
      $lookup: {
        from: 'lessons',
        localField: '_id',
        foreignField: '_id',
        as: 'lesson'
      }
    },
    { $unwind: { path: '$lesson', preserveNullAndEmptyArrays: true } }
  ]);
  return weakTopics;
};

// Static method to get difficulty progression
studentAttemptSchema.statics.getDifficultyProgress = async function(studentId) {
  const progress = await this.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId) } },
    {
      $group: {
        _id: '$difficulty',
        totalAttempts: { $sum: 1 },
        correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        averageScore: { $avg: '$score' }
      }
    },
    {
      $addFields: {
        successRate: {
          $multiply: [
            { $divide: ['$correctAttempts', { $max: ['$totalAttempts', 1] }] },
            100
          ]
        }
      }
    }
  ]);
  
  // Format into object
  const result = { easy: null, medium: null, hard: null };
  progress.forEach(p => {
    result[p._id] = {
      totalAttempts: p.totalAttempts,
      correctAttempts: p.correctAttempts,
      averageScore: Math.round(p.averageScore || 0),
      successRate: Math.round(p.successRate || 0)
    };
  });
  return result;
};

const StudentAttempt = mongoose.model('StudentAttempt', studentAttemptSchema);

export default StudentAttempt;

