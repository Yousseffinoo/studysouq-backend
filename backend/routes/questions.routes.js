import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  generateQuestionsForStudent,
  generateMockExamQuestions,
  submitAIAnswer,
  tutorChat,
  uploadPastPaperPDF,
  uploadMarkschemePDF,
  savePastPaperQuestions,
  getQuestions,
  getQuestionsByLesson,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getStudentProgress,
  getRecommendations
} from '../controllers/questions.controller.js';

const router = express.Router();

// Student Routes - AI Generation
router.post('/generate', protect, generateQuestionsForStudent);
router.post('/mock-exam', protect, generateMockExamQuestions);
router.post('/submit', protect, submitAIAnswer);
router.post('/tutor-chat', protect, tutorChat);

// Student Routes - Data
router.get('/by-lesson/:lessonId', protect, getQuestionsByLesson);
router.get('/progress', protect, getStudentProgress);
router.get('/recommendations', protect, getRecommendations);

// Admin Routes
router.get('/', protect, admin, getQuestions);
router.post('/', protect, admin, createQuestion);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);
router.post('/upload/questions-pdf', protect, admin, uploadPastPaperPDF);
router.post('/upload/markscheme-pdf', protect, admin, uploadMarkschemePDF);
router.post('/upload/save', protect, admin, savePastPaperQuestions);

export default router;
