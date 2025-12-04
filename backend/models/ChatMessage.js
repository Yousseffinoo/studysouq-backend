import mongoose from 'mongoose';

/**
 * Chat Message Schema
 * Stores AI tutor chat conversations with image analysis
 */
const chatMessageSchema = new mongoose.Schema({
  // User reference (optional - can be null for anonymous users)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // Session ID for grouping messages (generated on frontend)
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Lesson context (if chat is related to a specific lesson)
  lessonId: {
    type: String,
    required: false
  },

  lessonTitle: {
    type: String,
    required: false
  },

  // Message content
  message: {
    text: {
      type: String,
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    // For image messages
    image: {
      type: String, // Base64 or URL
      required: false
    },
    imageFile: {
      type: String, // Original filename
      required: false
    },
    imageUrl: {
      type: String, // Server URL to uploaded image
      required: false
    },
    // AI response metadata
    confidence: {
      type: String,
      required: false
    }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for fast retrieval
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

// Static method to get chat history by session
chatMessageSchema.statics.getChatHistory = async function(sessionId, limit = 50) {
  return this.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
};

// Static method to get user's recent chats
chatMessageSchema.statics.getUserChats = async function(userId, limit = 100) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;

