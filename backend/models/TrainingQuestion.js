import mongoose from 'mongoose';

const trainingQuestionSchema = new mongoose.Schema({
  // Source info
  paperCode: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    index: true
  },
  session: {
    type: String, // 'Jan', 'May', 'Oct', etc.
  },
  paperNumber: {
    type: String // '1', '2', 'Pure1', 'Stats', etc.
  },
  
  // Subject level
  subjectLevel: {
    type: String,
    required: true,
    enum: ['O-Level', 'AS-Level', 'A2-Level'],
    index: true
  },
  
  // Auto-detected lesson mapping
  detectedTopics: [{
    type: String
  }],
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    index: true
  },
  lessonTitle: {
    type: String
  },
  
  // Question content
  questionNumber: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionImages: [{
    type: String // URLs to extracted images
  }],
  
  // Subparts
  subparts: [{
    label: String,
    questionText: String,
    answerText: String,
    marks: Number,
    images: [String],
    markschemeNotes: [String]
  }],
  
  // Answer/Markscheme
  answerText: {
    type: String
  },
  solutionSteps: [{
    step: Number,
    content: String,
    marks: Number
  }],
  markschemeNotes: [{
    type: String // Examiner notes like "allow", "reject", "BOD"
  }],
  
  // Marks
  totalMarks: {
    type: Number,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    index: true
  },
  
  // Question characteristics for AI learning
  questionType: {
    type: String, // 'calculation', 'proof', 'application', 'graphical', 'word_problem'
  },
  mathConcepts: [{
    type: String // Tags like 'differentiation', 'integration', 'algebra'
  }],
  requiresGraph: {
    type: Boolean,
    default: false
  },
  requiresDiagram: {
    type: Boolean,
    default: false
  },
  
  // Training metadata
  uploadBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingBatch',
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Full raw content for AI context
  rawQuestionPDF: {
    type: String // Base64 or extracted text
  },
  rawMarkscheme: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
trainingQuestionSchema.index({ subjectLevel: 1, lessonId: 1 });
trainingQuestionSchema.index({ subjectLevel: 1, detectedTopics: 1 });
trainingQuestionSchema.index({ totalMarks: 1, difficulty: 1 });

// Virtual for full question with subparts
trainingQuestionSchema.virtual('fullQuestion').get(function() {
  let full = this.questionText;
  if (this.subparts && this.subparts.length > 0) {
    this.subparts.forEach(sp => {
      full += `\n(${sp.label}) ${sp.questionText}`;
    });
  }
  return full;
});

// Static method to get stats by subject level
trainingQuestionSchema.statics.getStatsByLevel = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$subjectLevel',
        totalQuestions: { $sum: 1 },
        totalMarks: { $sum: '$totalMarks' },
        avgMarks: { $avg: '$totalMarks' },
        verified: { $sum: { $cond: ['$verified', 1, 0] } },
        uniquePapers: { $addToSet: '$paperCode' },
        topics: { $addToSet: '$detectedTopics' }
      }
    },
    {
      $project: {
        _id: 1,
        totalQuestions: 1,
        totalMarks: 1,
        avgMarks: { $round: ['$avgMarks', 1] },
        verified: 1,
        uniquePapersCount: { $size: '$uniquePapers' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get questions by topic for AI training
trainingQuestionSchema.statics.getTrainingDataForTopic = async function(subjectLevel, topic, limit = 50) {
  return this.find({
    subjectLevel,
    $or: [
      { detectedTopics: { $in: [new RegExp(topic, 'i')] } },
      { lessonTitle: new RegExp(topic, 'i') },
      { mathConcepts: { $in: [new RegExp(topic, 'i')] } }
    ]
  })
  .select('questionText answerText solutionSteps totalMarks difficulty markschemeNotes subparts')
  .limit(limit)
  .lean();
};

const TrainingQuestion = mongoose.model('TrainingQuestion', trainingQuestionSchema);
export default TrainingQuestion;

