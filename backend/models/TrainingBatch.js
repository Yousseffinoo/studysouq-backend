import mongoose from 'mongoose';

const trainingBatchSchema = new mongoose.Schema({
  // Paper identification
  paperCode: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  session: {
    type: String
  },
  paperNumber: {
    type: String
  },
  
  // Subject level
  subjectLevel: {
    type: String,
    required: true,
    enum: ['O-Level', 'AS-Level', 'A2-Level'],
    index: true
  },
  
  // PDF Files
  questionPdfUrl: {
    type: String
  },
  markschemePdfUrl: {
    type: String
  },
  questionPdfText: {
    type: String // Extracted text
  },
  markschemePdfText: {
    type: String // Extracted text
  },
  
  // Processing status
  status: {
    type: String,
    enum: ['uploaded', 'extracting', 'pairing', 'mapping_topics', 'completed', 'failed'],
    default: 'uploaded',
    index: true
  },
  processingError: {
    type: String
  },
  
  // Extraction results
  extractedQuestions: {
    type: Number,
    default: 0
  },
  pairedQuestions: {
    type: Number,
    default: 0
  },
  topicsMapped: {
    type: Number,
    default: 0
  },
  
  // Metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedAt: {
    type: Date
  },
  
  // Processing logs
  processingLogs: [{
    timestamp: { type: Date, default: Date.now },
    stage: String,
    message: String,
    success: Boolean
  }]
}, {
  timestamps: true
});

// Index for efficient querying
trainingBatchSchema.index({ subjectLevel: 1, status: 1 });
trainingBatchSchema.index({ year: -1, subjectLevel: 1 });

// Static method to get upload stats
trainingBatchSchema.statics.getUploadStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$subjectLevel',
        totalBatches: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        totalQuestions: { $sum: '$extractedQuestions' },
        totalPaired: { $sum: '$pairedQuestions' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const TrainingBatch = mongoose.model('TrainingBatch', trainingBatchSchema);
export default TrainingBatch;

