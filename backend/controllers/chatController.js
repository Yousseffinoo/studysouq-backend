import ChatMessage from '../models/ChatMessage.js';

/**
 * Chat Controller
 * Handles saving and retrieving chat messages
 */

/**
 * Save a chat message
 * @route POST /api/chat/save
 */
export const saveMessage = async (req, res) => {
  try {
    const { sessionId, message, lessonId, lessonTitle } = req.body;

    // Validate required fields
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and message are required'
      });
    }

    // Get userId from auth (if user is logged in)
    const userId = req.user?._id || null;

    // Create chat message
    const chatMessage = await ChatMessage.create({
      userId,
      sessionId,
      lessonId,
      lessonTitle,
      message
    });

    return res.status(201).json({
      success: true,
      data: chatMessage,
      message: 'Message saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving message:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save message'
    });
  }
};

/**
 * Get chat history by session ID
 * @route GET /api/chat/history/:sessionId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    const messages = await ChatMessage.getChatHistory(sessionId, limit);

    return res.status(200).json({
      success: true,
      data: messages,
      count: messages.length
    });

  } catch (error) {
    console.error('❌ Error retrieving chat history:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve chat history'
    });
  }
};

/**
 * Get all chat sessions for a user
 * @route GET /api/chat/sessions
 */
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get unique sessions for this user
    const sessions = await ChatMessage.aggregate([
      { $match: { userId: userId } },
      { 
        $group: {
          _id: '$sessionId',
          lastMessage: { $last: '$message.text' },
          lastMessageDate: { $last: '$createdAt' },
          messageCount: { $sum: 1 },
          lessonTitle: { $last: '$lessonTitle' }
        }
      },
      { $sort: { lastMessageDate: -1 } },
      { $limit: 20 }
    ]);

    return res.status(200).json({
      success: true,
      data: sessions
    });

  } catch (error) {
    console.error('❌ Error retrieving user sessions:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve sessions'
    });
  }
};

/**
 * Delete a chat session
 * @route DELETE /api/chat/session/:sessionId
 */
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    // Delete all messages in this session
    const result = await ChatMessage.deleteMany({ 
      sessionId,
      ...(userId && { userId }) // Only delete if it's user's session
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} messages`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Error deleting session:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete session'
    });
  }
};

export default {
  saveMessage,
  getChatHistory,
  getUserSessions,
  deleteSession
};

