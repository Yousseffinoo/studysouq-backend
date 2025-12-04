import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User actions
      'user_created', 'user_updated', 'user_deleted', 'user_banned', 'user_unbanned',
      // Lesson actions
      'lesson_created', 'lesson_updated', 'lesson_deleted',
      // Note actions
      'note_created', 'note_updated', 'note_deleted',
      // Question actions
      'question_created', 'question_updated', 'question_deleted',
      // Image actions
      'image_uploaded', 'image_approved', 'image_rejected', 'image_deleted',
      // Config actions
      'pricing_updated', 'ai_config_updated', 'settings_updated',
      // Subject actions
      'subject_created', 'subject_updated', 'subject_deleted',
      // Section actions
      'section_created', 'section_updated', 'section_deleted',
      // Payment actions
      'payment_created', 'payment_updated',
      // Other
      'login', 'logout', 'password_changed'
    ]
  },
  entity: {
    type: String,
    enum: ['user', 'lesson', 'note', 'question', 'image', 'pricing', 'ai_config', 'settings', 'auth', 'subject', 'section', 'payment'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entity: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index - automatically delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;

