import Question from '../../models/Question.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all questions
// @route   GET /api/admin/questions
// @access  Admin
export const getAllQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subject = '', difficulty = '', lessonId = '' } = req.query;

    const query = {};
    
    if (search) {
      query.questionText = { $regex: search, $options: 'i' };
    }
    
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (lessonId) query.lesson = lessonId;

    const questions = await Question.find(query)
      .populate('createdBy', 'name email')
      .populate('lesson', 'title')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        questions,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllQuestions", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single question
// @route   GET /api/admin/questions/:id
// @access  Admin
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lesson', 'title');
    
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
    console.error("ERROR ORIGIN: getQuestionById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new question
// @route   POST /api/admin/questions
// @access  Admin
export const createQuestion = async (req, res) => {
  try {
    // Log request data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== CREATE QUESTION REQUEST ===');
      console.log('User:', req.user?._id, req.user?.email);
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login again.'
      });
    }

    // Validate required fields
    if (!req.body.questionText || !req.body.questionText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required'
      });
    }

    if (!req.body.explanation || !req.body.explanation.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Explanation is required'
      });
    }

    if (!req.body.subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    // Map subject slug to enum value
    const subjectSlug = String(req.body.subject).toLowerCase().trim();
    const subjectMap = {
      'math': 'mathematics',
      'mathematics': 'mathematics',
      'physics': 'physics',
      'chemistry': 'chemistry',
      'biology': 'biology',
      'computer-science': 'computer-science',
      'cs': 'computer-science',
      'computer science': 'computer-science'
    };
    
    const mappedSubject = subjectMap[subjectSlug] || subjectSlug;
    
    // Validate subject is in enum
    const validSubjects = ['physics', 'chemistry', 'mathematics', 'biology', 'computer-science'];
    if (!validSubjects.includes(mappedSubject)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subject "${req.body.subject}". Must be one of: ${validSubjects.join(', ')}`
      });
    }

    // Validate class
    if (!req.body.class) {
      return res.status(400).json({
        success: false,
        message: 'Class is required'
      });
    }

    const validClasses = ['9th', '10th', '11th', '12th'];
    if (!validClasses.includes(req.body.class)) {
      return res.status(400).json({
        success: false,
        message: `Invalid class "${req.body.class}". Must be one of: ${validClasses.join(', ')}`
      });
    }

    // Validate chapter
    if (!req.body.chapter || isNaN(req.body.chapter) || req.body.chapter < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid chapter number is required (must be at least 1)'
      });
    }

    // Validate options
    if (!req.body.options || !Array.isArray(req.body.options) || req.body.options.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one option is required'
      });
    }

    // Validate correctAnswer
    if (req.body.correctAnswer === undefined || req.body.correctAnswer === null) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer index is required'
      });
    }

    if (req.body.correctAnswer < 0 || req.body.correctAnswer >= req.body.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer index must be within options range'
      });
    }

    // Prepare question data
    const questionData = {
      questionText: req.body.questionText.trim(),
      explanation: req.body.explanation.trim(),
      hint: req.body.hint ? req.body.hint.trim() : null,
      subject: mappedSubject,
      class: req.body.class,
      chapter: parseInt(req.body.chapter),
      difficulty: req.body.difficulty || 'medium',
      marks: req.body.marks ? parseInt(req.body.marks) : 1,
      type: req.body.type || 'mcq',
      isPremium: req.body.isPremium === true || req.body.isPremium === 'true',
      isVisible: req.body.isVisible !== false && req.body.isVisible !== 'false',
      lesson: req.body.lesson || null,
      options: req.body.options.map((opt, index) => ({
        text: typeof opt === 'string' ? opt : (opt.text || opt),
        image: opt.image || null,
        isCorrect: opt.isCorrect || index === req.body.correctAnswer
      })),
      correctAnswer: parseInt(req.body.correctAnswer),
      questionImage: req.body.questionImage || null,
      createdBy: req.user._id
    };

    const question = await Question.create(questionData);

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'question_created',
        'question',
        question._id,
        { questionText: question.questionText?.substring(0, 100) || '' }
      );
    } catch (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in createQuestion:', logError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    console.error("ERROR ORIGIN: createQuestion", error);
    console.error("ERROR STACK: createQuestion", error.stack);
    console.error("ERROR DETAILS:", {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors
    });
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.length > 0 ? errors : [error.message]
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate field value entered.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code
      } : undefined
    });
  }
};

// @desc    Update question
// @route   PUT /api/admin/questions/:id
// @access  Admin
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await createActivityLog(
      req.user,
      'question_updated',
      'question',
      question._id
    );

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updateQuestion", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/admin/questions/:id
// @access  Admin
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.deleteOne();

    await createActivityLog(
      req.user,
      'question_deleted',
      'question',
      question._id
    );

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deleteQuestion", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

