import express from 'express';
import { 
  saveMessage, 
  getChatHistory, 
  getUserSessions, 
  deleteSession 
} from '../controllers/chatController.js';
// Import auth middleware (optional - for authenticated users)
// import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Chat Routes
 * Routes for saving and retrieving chat messages
 */

/**
 * @route   POST /api/chat/save
 * @desc    Save a chat message
 * @access  Public (can add protect middleware for authenticated users)
 */
router.post('/save', saveMessage);

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history by session ID
 * @access  Public
 */
router.get('/history/:sessionId', getChatHistory);

/**
 * @route   GET /api/chat/sessions
 * @desc    Get all chat sessions for authenticated user
 * @access  Private (requires authentication)
 */
// Uncomment this line if you want to require authentication:
// router.get('/sessions', protect, getUserSessions);
router.get('/sessions', getUserSessions);

/**
 * @route   DELETE /api/chat/session/:sessionId
 * @desc    Delete a chat session
 * @access  Public/Private
 */
router.delete('/session/:sessionId', deleteSession);

export default router;

