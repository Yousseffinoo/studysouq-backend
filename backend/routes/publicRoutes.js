import express from 'express';
import * as subjectsController from '../controllers/public/subjects.controller.js';
import * as sectionsController from '../controllers/public/sections.controller.js';
import * as lessonsController from '../controllers/public/lessons.controller.js';
import * as notesController from '../controllers/public/notes.controller.js';
import * as questionsController from '../controllers/public/questions.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ==================== SUBJECTS ROUTES (Public) ====================
router.get('/subjects', subjectsController.getSubjects);
router.get('/subjects/:id', subjectsController.getSubjectById);
router.get('/subjects/:id/sections', sectionsController.getSectionsBySubject);

// ==================== SECTIONS ROUTES (Public) ====================
router.get('/sections', sectionsController.getSections);
router.get('/sections/:id', sectionsController.getSectionById);
router.get('/sections/:id/lessons', lessonsController.getLessonsBySection);

// ==================== LESSONS ROUTES (Public) ====================
router.get('/lessons', lessonsController.getLessons);
router.get('/lessons/:id', lessonsController.getLessonById);
// Note: getLessonsBySection uses subject from section since Lesson model doesn't have section field

// ==================== NOTES ROUTES (Public - Premium filtering) ====================
// Optional auth for premium content
router.get('/notes', notesController.getNotes);
router.get('/notes/:id', notesController.getNoteById);

// ==================== QUESTIONS ROUTES (Public - Premium filtering) ====================
// Optional auth for premium content
router.get('/questions', questionsController.getQuestions);
router.get('/questions/random', questionsController.getRandomQuestions);
router.get('/questions/:id', questionsController.getQuestionById);
router.post('/questions/:id/answer', questionsController.submitAnswer);

export default router;

