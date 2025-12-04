import Question from '../../models/Question.js';
import mongoose from 'mongoose';

// @desc    Get all questions (public - premium filtering handled)
// @route   GET /api/questions
// @access  Public (premium content may require auth)
export const getQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      subject = '', 
      class: classFilter = '',
      lesson = '',
      difficulty = ''
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subject) query.subject = subject;
    if (classFilter) query.class = classFilter;
    if (lesson) {
      // Ensure lesson is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(lesson)) {
        query.lesson = new mongoose.Types.ObjectId(lesson);
      } else {
        query.lesson = lesson;
      }
    }
    if (difficulty) query.difficulty = difficulty;

    // Always show visible questions
    query.isVisible = true;

    // Check if user is authenticated and premium
    const user = req.user; // From protect middleware if present
    const isPremium = user?.isPremium || false;

    // If not premium, only show non-premium questions
    if (!isPremium) {
      query.isPremium = false;
    }

    // Log query for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('=== GET QUESTIONS QUERY ===');
      console.log('Query:', JSON.stringify(query, null, 2));
      console.log('Lesson ID:', lesson);
      console.log('Is Premium User:', isPremium);
    }

    const questions = await Question.find(query)
      .populate('lesson', 'title slug')
      .select('questionText questionImage options correctAnswer explanation subject class chapter difficulty isPremium order isVisible hint _id')
      .sort({ order: 1, createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    // Additional filter for invisible questions (safety check)
    const visibleQuestions = questions.filter(q => q.isVisible !== false && q.isVisible !== undefined);

    // Count with same query
    const count = await Question.countDocuments(query);

    // Log response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('=== QUESTIONS RESPONSE ===');
      console.log('Found questions:', visibleQuestions.length);
      console.log('Total count:', count);
      if (visibleQuestions.length > 0) {
        console.log('First question:', {
          id: visibleQuestions[0]._id,
          lesson: visibleQuestions[0].lesson,
          isVisible: visibleQuestions[0].isVisible,
          isPremium: visibleQuestions[0].isPremium
        });
      }
    }

    res.status(200).json({
      success: true,
      data: visibleQuestions.length > 0 ? visibleQuestions : []
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getQuestions", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get random questions for quiz (public)
// @route   GET /api/questions/random
// @access  Public
export const getRandomQuestions = async (req, res) => {
  try {
    const { count = 10, subject = '', class: classFilter = '', difficulty = '' } = req.query;

    const query = {};
    
    if (subject) query.subject = subject;
    if (classFilter) query.class = classFilter;
    if (difficulty) query.difficulty = difficulty;

    // Check if user is authenticated and premium
    const user = req.user; // From protect middleware if present
    const isPremium = user?.isPremium || false;

    // If not premium, only show non-premium questions
    if (!isPremium) {
      query.isPremium = false;
    }

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } }
    ]);

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getRandomQuestions", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching random questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single question (public)
// @route   GET /api/questions/:id
// @access  Public (premium content may require auth)
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('lesson', 'title')
      .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check premium access
    const user = req.user; // From protect middleware if present
    const isPremium = user?.isPremium || false;

    if (question.isPremium && !isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Premium content requires subscription'
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

// @desc    Submit answer and get feedback
// @route   POST /api/questions/:id/answer
// @access  Public (optional auth)
export const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const question = await Question.findById(req.params.id).lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const isCorrect = question.correctAnswer === parseInt(answer);
    const correctAnswerIndex = question.correctAnswer;
    const correctAnswerText = question.options[correctAnswerIndex] || '';

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: correctAnswerIndex,
        correctAnswerText,
        explanation: question.explanation
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: submitAnswer", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

