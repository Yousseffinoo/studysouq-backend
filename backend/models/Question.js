import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  questionImage: {
    url: String,
    publicId: String
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    image: {
      url: String,
      publicId: String
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: Number, // Index of correct option
    required: [true, 'Correct answer is required']
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required']
  },
  hint: {
    type: String,
    default: null
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
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  marks: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['mcq', 'true-false', 'fill-blank', 'numerical'],
    default: 'mcq'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  timesAnswered: {
    type: Number,
    default: 0
  },
  timesCorrect: {
    type: Number,
    default: 0
  },
  accuracy: {
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

// Calculate accuracy when times answered changes
questionSchema.pre('save', function(next) {
  if (this.timesAnswered > 0) {
    this.accuracy = (this.timesCorrect / this.timesAnswered) * 100;
  }
  next();
});

// Indexes
questionSchema.index({ subject: 1, class: 1, chapter: 1 });
questionSchema.index({ lesson: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ isPremium: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
