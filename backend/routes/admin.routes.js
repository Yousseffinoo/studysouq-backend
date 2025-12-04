import express from 'express';
import { protect, admin } from '../middleware/auth.js';

// Import controllers
import * as usersController from '../controllers/admin/users.controller.js';
import * as lessonsController from '../controllers/admin/lessons.controller.js';
import * as notesController from '../controllers/admin/notes.controller.js';
import * as questionsController from '../controllers/admin/questions.controller.js';
import * as imagesController from '../controllers/admin/images.controller.js';
import * as dashboardController from '../controllers/admin/dashboard.controller.js';
import * as pricingController from '../controllers/admin/pricing.controller.js';
import * as aiConfigController from '../controllers/admin/aiConfig.controller.js';
import * as subjectsController from '../controllers/admin/subjects.controller.js';
import * as sectionsController from '../controllers/admin/sections.controller.js';
import * as paymentsController from '../controllers/admin/payments.controller.js';
import * as settingsController from '../controllers/admin/settings.controller.js';

const router = express.Router();

// Apply protect and admin middleware to all routes
router.use(protect, admin);

// ==================== DASHBOARD ROUTES ====================
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/activities', dashboardController.getRecentActivities);
router.get('/dashboard/analytics', dashboardController.getAnalytics);

// ==================== USERS ROUTES ====================
router.get('/users/stats', usersController.getUserStats);
router.get('/users', usersController.getAllUsers);
router.get('/users/:id', usersController.getUserById);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);
router.patch('/users/:id/ban', usersController.toggleUserBan);

// ==================== LESSONS ROUTES ====================
router.get('/lessons/stats', lessonsController.getLessonStats);
router.get('/lessons', lessonsController.getAllLessons);
router.get('/lessons/:id', lessonsController.getLessonById);
router.post('/lessons', lessonsController.createLesson);
router.put('/lessons/:id', lessonsController.updateLesson);
router.delete('/lessons/:id', lessonsController.deleteLesson);

// ==================== NOTES ROUTES ====================
router.get('/notes', notesController.getAllNotes);
router.get('/notes/:id', notesController.getNoteById);
router.post('/notes', notesController.createNote);
router.put('/notes/:id', notesController.updateNote);
router.delete('/notes/:id', notesController.deleteNote);

// ==================== QUESTIONS ROUTES ====================
router.get('/questions', questionsController.getAllQuestions);
router.get('/questions/:id', questionsController.getQuestionById);
router.post('/questions', questionsController.createQuestion);
router.put('/questions/:id', questionsController.updateQuestion);
router.delete('/questions/:id', questionsController.deleteQuestion);

// ==================== IMAGES ROUTES ====================
// Now using Cloudinary - no multer middleware needed
router.get('/images', imagesController.getAllImages);
router.post('/images', imagesController.uploadImage);
router.patch('/images/:id/approve', imagesController.approveImage);
router.patch('/images/:id/reject', imagesController.rejectImage);
router.delete('/images/:id', imagesController.deleteImage);

// ==================== PRICING ROUTES ====================
router.get('/pricing', pricingController.getAllPricingPlans);
router.get('/pricing/:id', pricingController.getPricingPlanById);
router.post('/pricing', pricingController.createPricingPlan);
router.put('/pricing/:id', pricingController.updatePricingPlan);
router.delete('/pricing/:id', pricingController.deletePricingPlan);
router.put('/pricing/payment-config', pricingController.updatePaymentConfig);

// ==================== AI CONFIG ROUTES ====================
router.get('/ai-config', aiConfigController.getAllAIConfigs);
router.get('/ai-config/:provider', aiConfigController.getAIConfigByProvider);
router.post('/ai-config', aiConfigController.upsertAIConfig);
router.delete('/ai-config/:provider', aiConfigController.deleteAIConfig);
router.patch('/ai-config/:provider/toggle', aiConfigController.toggleAIProvider);
router.patch('/ai-config/:provider/set-default', aiConfigController.setDefaultAIProvider);

// ==================== SUBJECTS ROUTES ====================
router.get('/subjects', subjectsController.getAllSubjects);
router.get('/subjects/:id', subjectsController.getSubjectById);
router.post('/subjects', subjectsController.createSubject);
router.put('/subjects/:id', subjectsController.updateSubject);
router.delete('/subjects/:id', subjectsController.deleteSubject);

// ==================== SECTIONS ROUTES ====================
router.get('/sections', sectionsController.getAllSections);
router.get('/sections/:id', sectionsController.getSectionById);
router.post('/sections', sectionsController.createSection);
router.put('/sections/:id', sectionsController.updateSection);
router.delete('/sections/:id', sectionsController.deleteSection);

// ==================== PAYMENTS ROUTES ====================
router.get('/payments/stats', paymentsController.getPaymentStats);
router.get('/payments', paymentsController.getAllPayments);
router.get('/payments/:id', paymentsController.getPaymentById);
router.post('/payments', paymentsController.createPayment);
router.put('/payments/:id', paymentsController.updatePayment);

// ==================== SETTINGS ROUTES ====================
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

export default router;
