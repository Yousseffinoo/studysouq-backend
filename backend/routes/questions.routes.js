import express from 'express';
import { protect, admin, checkPremium } from '../middleware/auth.js';
import * as questionsController from '../controllers/questions.controller.js';

const router = express.Router();

// ==================== ADMIN ROUTES ====================
// All admin routes require authentication + admin role

// Question CRUD
router.get('/admin/all', protect, admin, questionsController.getQuestions);
router.get('/admin/:id', protect, admin, questionsController.getQuestion);
router.post('/admin/create', protect, admin, questionsController.createQuestion);
router.put('/admin/:id', protect, admin, questionsController.updateQuestion);
router.delete('/admin/:id', protect, admin, questionsController.deleteQuestion);

// PDF Upload & AI Extraction
router.post('/admin/upload-questions-pdf', protect, admin, questionsController.uploadQuestionsPDF);
router.post('/admin/upload-markscheme-pdf', protect, admin, questionsController.uploadMarkschemePDF);
router.post('/admin/merge-and-save', protect, admin, questionsController.mergeAndSaveQuestions);

// AI Generation
router.post('/admin/generate', protect, admin, questionsController.generateQuestions);
router.post('/admin/save-generated', protect, admin, questionsController.saveGeneratedQuestions);
router.post('/admin/:id/regenerate-explanation', protect, admin, questionsController.regenerateExplanation);

// ==================== STUDENT ROUTES ====================
// Require authentication, some features require premium

// Get questions for a lesson (public but limited for non-premium)
router.get('/by-lesson/:lessonId', protect, questionsController.getQuestionsByLesson);

// Quiz Session
router.post('/session/start', protect, checkPremium, questionsController.startQuizSession);
router.get('/session/current', protect, questionsController.getCurrentSession);
router.post('/session/:sessionId/end', protect, questionsController.endQuizSession);

// Submit Answer
router.post('/submit', protect, checkPremium, questionsController.submitAnswer);

// Student Analytics & Progress
router.get('/progress', protect, questionsController.getStudentProgress);
router.get('/recommendations', protect, questionsController.getRecommendations);
router.get('/lesson-stats/:lessonId', protect, questionsController.getLessonStats);

export default router;

