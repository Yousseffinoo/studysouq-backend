import TrainingBatch from '../models/TrainingBatch.js';
import TrainingQuestion from '../models/TrainingQuestion.js';
import pdfTrainingService from '../services/pdfTrainingService.js';

/**
 * Upload training PDFs (question paper + markscheme)
 * POST /api/training/upload
 */
export const uploadTrainingPDFs = async (req, res) => {
  try {
    const { 
      paperCode, 
      year, 
      session, 
      paperNumber, 
      subjectLevel 
    } = req.body;
    
    // Validate required fields
    if (!paperCode || !year || !subjectLevel) {
      return res.status(400).json({
        success: false,
        message: 'Paper code, year, and subject level are required'
      });
    }
    
    // Validate subject level
    if (!['O-Level', 'AS-Level', 'A2-Level'].includes(subjectLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject level. Must be O-Level, AS-Level, or A2-Level'
      });
    }
    
    // Check for uploaded files
    if (!req.files || !req.files.questionPdf || !req.files.markschemePdf) {
      return res.status(400).json({
        success: false,
        message: 'Both question paper PDF and markscheme PDF are required'
      });
    }
    
    const questionPdf = req.files.questionPdf;
    const markschemePdf = req.files.markschemePdf;
    
    // Validate file types
    if (!questionPdf.mimetype.includes('pdf') || !markschemePdf.mimetype.includes('pdf')) {
      return res.status(400).json({
        success: false,
        message: 'Both files must be PDF format'
      });
    }
    
    // Extract text from PDFs
    console.log('Extracting text from question PDF...');
    const questionPdfText = await pdfTrainingService.extractPDFText(questionPdf.data);
    
    console.log('Extracting text from markscheme PDF...');
    const markschemePdfText = await pdfTrainingService.extractPDFText(markschemePdf.data);
    
    // Create training batch
    const batch = new TrainingBatch({
      paperCode,
      year: parseInt(year),
      session: session || null,
      paperNumber: paperNumber || null,
      subjectLevel,
      questionPdfText,
      markschemePdfText,
      status: 'uploaded',
      uploadedBy: req.user._id,
      processingLogs: [{
        stage: 'upload',
        message: 'PDFs uploaded successfully',
        success: true
      }]
    });
    
    await batch.save();
    
    // Start processing in background
    pdfTrainingService.processTrainingBatch(batch._id)
      .then(result => {
        console.log(`Batch ${batch._id} processed:`, result);
      })
      .catch(err => {
        console.error(`Batch ${batch._id} failed:`, err);
      });
    
    res.status(200).json({
      success: true,
      message: 'PDFs uploaded and processing started',
      data: {
        batchId: batch._id,
        status: batch.status,
        paperCode: batch.paperCode,
        year: batch.year,
        subjectLevel: batch.subjectLevel
      }
    });
    
  } catch (error) {
    console.error('Upload training PDFs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload training PDFs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get training batch status
 * GET /api/training/batch/:id
 */
export const getBatchStatus = async (req, res) => {
  try {
    const batch = await TrainingBatch.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .lean();
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: batch
    });
    
  } catch (error) {
    console.error('Get batch status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batch status'
    });
  }
};

/**
 * Get all training batches
 * GET /api/training/batches
 */
export const getAllBatches = async (req, res) => {
  try {
    const { subjectLevel, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (subjectLevel) query.subjectLevel = subjectLevel;
    if (status) query.status = status;
    
    const batches = await TrainingBatch.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    const total = await TrainingBatch.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get all batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get batches'
    });
  }
};

/**
 * Get training statistics
 * GET /api/training/stats
 */
export const getTrainingStats = async (req, res) => {
  try {
    const stats = await pdfTrainingService.getTrainingStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Get training stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get training statistics'
    });
  }
};

/**
 * Get training questions (for viewing/editing)
 * GET /api/training/questions
 */
export const getTrainingQuestions = async (req, res) => {
  try {
    const { 
      subjectLevel, 
      lessonId, 
      topic,
      verified,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query = {};
    if (subjectLevel) query.subjectLevel = subjectLevel;
    if (lessonId) query.lessonId = lessonId;
    if (topic) {
      query.$or = [
        { detectedTopics: new RegExp(topic, 'i') },
        { mathConcepts: new RegExp(topic, 'i') }
      ];
    }
    if (verified !== undefined) query.verified = verified === 'true';
    
    const questions = await TrainingQuestion.find(query)
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    const total = await TrainingQuestion.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get training questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get training questions'
    });
  }
};

/**
 * Update training question (verify, edit, map to lesson)
 * PUT /api/training/questions/:id
 */
export const updateTrainingQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If verifying, add verified by
    if (updates.verified === true) {
      updates.verifiedBy = req.user._id;
    }
    
    const question = await TrainingQuestion.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate('lessonId', 'title');
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: question
    });
    
  } catch (error) {
    console.error('Update training question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update question'
    });
  }
};

/**
 * Delete training question
 * DELETE /api/training/questions/:id
 */
export const deleteTrainingQuestion = async (req, res) => {
  try {
    const question = await TrainingQuestion.findByIdAndDelete(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Question deleted'
    });
    
  } catch (error) {
    console.error('Delete training question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete question'
    });
  }
};

/**
 * Delete training batch and all associated questions
 * DELETE /api/training/batch/:id
 */
export const deleteBatch = async (req, res) => {
  try {
    const batch = await TrainingBatch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Delete all questions from this batch
    await TrainingQuestion.deleteMany({ uploadBatchId: batch._id });
    
    // Delete the batch
    await batch.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Batch and all associated questions deleted'
    });
    
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete batch'
    });
  }
};

/**
 * Reprocess a failed batch
 * POST /api/training/batch/:id/reprocess
 */
export const reprocessBatch = async (req, res) => {
  try {
    const batch = await TrainingBatch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Reset status and clear old questions
    batch.status = 'uploaded';
    batch.processingError = null;
    batch.extractedQuestions = 0;
    batch.pairedQuestions = 0;
    batch.topicsMapped = 0;
    batch.processingLogs.push({
      stage: 'reprocess',
      message: 'Reprocessing started',
      success: true
    });
    await batch.save();
    
    // Delete old questions from this batch
    await TrainingQuestion.deleteMany({ uploadBatchId: batch._id });
    
    // Start processing
    pdfTrainingService.processTrainingBatch(batch._id)
      .then(result => {
        console.log(`Batch ${batch._id} reprocessed:`, result);
      })
      .catch(err => {
        console.error(`Batch ${batch._id} reprocess failed:`, err);
      });
    
    res.status(200).json({
      success: true,
      message: 'Reprocessing started',
      data: { batchId: batch._id }
    });
    
  } catch (error) {
    console.error('Reprocess batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reprocess batch'
    });
  }
};

