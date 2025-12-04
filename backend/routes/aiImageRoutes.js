import express from 'express';
import { analyzeImage } from '../controllers/aiImageController.js';

const router = express.Router();

/**
 * AI Image Analysis Routes
 * Endpoint for analyzing student homework images
 * Now uses Cloudinary instead of Multer
 */

/**
 * @route   POST /api/ai/analyze-image
 * @desc    Analyze uploaded homework image using OpenAI Vision
 * @access  Public (can add auth middleware: protect)
 */
router.post('/analyze-image', analyzeImage);

export default router;
