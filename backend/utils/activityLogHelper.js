import ActivityLog from '../models/ActivityLog.js';

/**
 * Safely create an activity log entry
 * Non-blocking - errors are logged but don't break the request
 */
export const createActivityLog = async (user, action, entity, entityId, details = {}) => {
  try {
    // Only create log if user exists
    if (!user || !user._id) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('ActivityLog: User not available, skipping log creation');
      }
      return null;
    }

    // Validate action is in enum
    const validActions = [
      'user_created', 'user_updated', 'user_deleted', 'user_banned', 'user_unbanned',
      'lesson_created', 'lesson_updated', 'lesson_deleted',
      'note_created', 'note_updated', 'note_deleted',
      'question_created', 'question_updated', 'question_deleted',
      'image_uploaded', 'image_approved', 'image_rejected', 'image_deleted',
      'pricing_updated', 'ai_config_updated', 'settings_updated',
      'subject_created', 'subject_updated', 'subject_deleted',
      'section_created', 'section_updated', 'section_deleted',
      'payment_created', 'payment_updated',
      'login', 'logout', 'password_changed'
    ];

    if (!validActions.includes(action)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`ActivityLog: Invalid action "${action}", skipping log creation`);
      }
      return null;
    }

    const log = await ActivityLog.create({
      user: user._id,
      action,
      entity,
      entityId,
      details,
      status: 'success'
    });

    return log;
  } catch (error) {
    // Log error but don't throw - activity logging should never break requests
    if (process.env.NODE_ENV === 'development') {
      console.error('ActivityLog creation error:', error.message);
      console.error('ActivityLog error stack:', error.stack);
    }
    return null;
  }
};

