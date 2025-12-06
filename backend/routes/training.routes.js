import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import * as trainingController from '../controllers/training.controller.js';

const router = express.Router();

// All training routes require admin access
router.use(protect, admin);

// Upload training PDFs
router.post('/upload', trainingController.uploadTrainingPDFs);

// Get training stats
router.get('/stats', trainingController.getTrainingStats);

// Batch management
router.get('/batches', trainingController.getAllBatches);
router.get('/batch/:id', trainingController.getBatchStatus);
router.delete('/batch/:id', trainingController.deleteBatch);
router.post('/batch/:id/reprocess', trainingController.reprocessBatch);

// Question management
router.get('/questions', trainingController.getTrainingQuestions);
router.put('/questions/:id', trainingController.updateTrainingQuestion);
router.delete('/questions/:id', trainingController.deleteTrainingQuestion);

export default router;

