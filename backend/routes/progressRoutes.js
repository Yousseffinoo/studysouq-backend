import express from 'express';
import {
  getLessonProgress,
  updateLessonProgress,
  getSectionProgress,
  getSubjectProgress,
  getAllProgress,
  addQuizScore,
  toggleBookmark,
  getBookmarkedLessons
} from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// General progress routes
router.get('/', getAllProgress);
router.get('/bookmarks', getBookmarkedLessons);

// Lesson progress routes
router.get('/lesson/:lessonId', getLessonProgress);
router.put('/lesson/:lessonId', updateLessonProgress);
router.post('/lesson/:lessonId/quiz', addQuizScore);
router.put('/lesson/:lessonId/bookmark', toggleBookmark);

// Section progress routes
router.get('/section/:sectionId', getSectionProgress);

// Subject progress routes
router.get('/subject/:subjectId', getSubjectProgress);

export default router;

