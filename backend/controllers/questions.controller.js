import Question from '../models/Question.js';
import StudentAttempt from '../models/StudentAttempt.js';
import QuestionSession from '../models/QuestionSession.js';
import Lesson from '../models/Lesson.js';
import Subject from '../models/Subject.js';
import {
  generateQuestionsWithAI,
  reviewStudentAnswer,
  extractQuestionsFromPastPaper,
  extractMarkschemeFromPDF,
  mergeAndSavePastPaper
} from '../services/aiQuestionGenerator.js';
import { extractTextFromPDF, cleanPDFText } from '../services/pdfService.js';
import cloudinary from '../config/cloudinary.js';

// ==================== AI QUESTION GENERATION ====================

/**
 * Generate questions on-the-fly with AI (Student endpoint)
 */
export const generateQuestionsForStudent = async (req, res) => {
  try {
    const { lessonId, difficulty = 'medium', numberOfQuestions = 5 } = req.body;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'Lesson ID is required' });
    }

    // Get lesson and subject info
    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Get subject
    const subject = await Subject.findOne({ slug: lesson.subject }).lean();

    console.log('🎯 Generating AI questions for student...');
    console.log(`   Lesson: ${lesson.title}`);
    console.log(`   Difficulty: ${difficulty}`);
    console.log(`   Count: ${numberOfQuestions}`);

    // Generate questions with AI pipeline
    const result = await generateQuestionsWithAI({
      lessonId,
      subject: subject?.name || lesson.subject,
      difficulty,
      numberOfQuestions: Math.min(numberOfQuestions, 20) // Max 20 questions
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate questions',
        error: result.error
      });
    }

    // Format for frontend
    const questions = result.data.map((q, index) => ({
      _id: `ai_${Date.now()}_${index}`, // Temporary ID for AI-generated questions
      questionText: q.questionText,
      answerText: q.answerText,
      marks: q.marks,
      difficulty: q.difficulty,
      explanation: q.explanation,
      steps: q.steps,
      tips: q.tips,
      source: 'ai_generated',
      isAIGenerated: true
    }));

    res.status(200).json({
      success: true,
      message: `Generated ${questions.length} AI questions`,
      data: {
        questions,
        lesson: {
          _id: lesson._id,
          title: lesson.title,
          subject: lesson.subject
        },
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Start AI quiz session
 */
export const startAIQuizSession = async (req, res) => {
  try {
    const { lessonId, difficulty, numberOfQuestions, answerMode = 'instant' } = req.body;
    const studentId = req.user._id;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'Lesson ID is required' });
    }

    // Check for existing active session
    const existingSession = await QuestionSession.findOne({
      student: studentId,
      status: 'active'
    });

    if (existingSession) {
      return res.status(200).json({
        success: true,
        message: 'Resuming existing session',
        data: existingSession
      });
    }

    // Get lesson info
    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const subject = await Subject.findOne({ slug: lesson.subject }).lean();

    // Generate AI questions
    console.log('🚀 Starting AI Quiz Session...');
    const result = await generateQuestionsWithAI({
      lessonId,
      subject: subject?.name || lesson.subject,
      difficulty: difficulty || 'medium',
      numberOfQuestions: numberOfQuestions || 10
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate questions',
        error: result.error
      });
    }

    // Create session with AI-generated questions
    const session = await QuestionSession.create({
      student: studentId,
      subject: lesson.subject,
      lesson: lessonId,
      numberOfQuestions: result.data.length,
      difficulty,
      sourceType: 'ai_generated',
      answerMode,
      questions: result.data.map((q, i) => ({
        question: null, // AI questions aren't stored in DB
        aiQuestion: q, // Store the full AI question data
        order: i + 1,
        answered: false
      })),
      totalQuestions: result.data.length,
      isAIGenerated: true
    });

    res.status(201).json({
      success: true,
      message: 'AI Quiz session started',
      data: {
        ...session.toObject(),
        aiQuestions: result.data,
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('Start AI session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit answer for AI-generated question
 */
export const submitAIAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, question, answerText, answerType = 'text', timeSpent = 0 } = req.body;
    const studentId = req.user._id;

    if (!question || !question.questionText) {
      return res.status(400).json({ success: false, message: 'Question data is required' });
    }

    // Use AI to review the answer
    console.log('🔍 Reviewing student answer with AI...');
    const reviewResult = await reviewStudentAnswer(question, answerText, answerType);

    if (!reviewResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to review answer',
        error: reviewResult.error
      });
    }

    const review = reviewResult.data;

    // Create attempt record
    const attempt = await StudentAttempt.create({
      student: studentId,
      question: null, // AI-generated, not in DB
      session: sessionId,
      answerType,
      answerText,
      isCorrect: review.isCorrect,
      score: review.score,
      marksAwarded: review.marksAwarded,
      maxMarks: review.maxMarks,
      aiExplanation: review.feedback,
      aiSteps: review.markBreakdown?.map((m, i) => ({
        stepNumber: i + 1,
        content: m.criterion,
        isCorrect: m.awarded
      })),
      aiFeedback: review.feedback,
      aiSuggestions: review.improvements,
      timeSpentSeconds: timeSpent,
      lessonId: req.body.lessonId,
      subject: req.body.subject,
      difficulty: question.difficulty
    });

    // Update session if provided
    if (sessionId) {
      const session = await QuestionSession.findById(sessionId);
      if (session) {
        session.questionsAnswered += 1;
        if (review.isCorrect) {
          session.questionsCorrect += 1;
        }
        session.totalScore += review.score || 0;
        session.currentQuestionIndex = questionIndex + 1;
        
        if (session.questions[questionIndex]) {
          session.questions[questionIndex].answered = true;
          session.questions[questionIndex].attempt = attempt._id;
        }
        
        await session.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Answer reviewed',
      data: {
        attempt,
        review: {
          isCorrect: review.isCorrect,
          marksAwarded: review.marksAwarded,
          maxMarks: review.maxMarks,
          score: review.score,
          feedback: review.feedback,
          correctSolution: review.correctSolution,
          markBreakdown: review.markBreakdown,
          improvements: review.improvements
        },
        correctAnswer: question.answerText,
        explanation: question.explanation,
        steps: question.steps
      }
    });

  } catch (error) {
    console.error('Submit AI answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADMIN: PAST PAPER UPLOAD ====================

/**
 * Upload past paper PDF and extract questions
 */
export const uploadPastPaperPDF = async (req, res) => {
  try {
    if (!req.files || !req.files.questionsPdf) {
      return res.status(400).json({ success: false, message: 'Questions PDF is required' });
    }

    const { subject, lessonId, paperYear, paperSession, examBoard } = req.body;

    if (!subject || !lessonId) {
      return res.status(400).json({ success: false, message: 'Subject and lesson are required' });
    }

    const pdfFile = req.files.questionsPdf;

    console.log('📄 Processing past paper PDF...');

    // Extract text from PDF
    const extraction = await extractTextFromPDF(pdfFile.data);
    if (!extraction.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract PDF text',
        error: extraction.error
      });
    }

    const cleanedText = cleanPDFText(extraction.text);

    // Extract questions with AI
    console.log('🤖 Extracting questions with AI...');
    const questionsResult = await extractQuestionsFromPastPaper(cleanedText, {
      subject,
      paperYear,
      paperSession,
      examBoard
    });

    if (!questionsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to extract questions',
        error: questionsResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Questions extracted successfully',
      data: {
        questions: questionsResult.data,
        pdfInfo: {
          pages: extraction.metadata?.pages,
          textLength: cleanedText.length
        },
        metadata: {
          subject,
          lessonId,
          paperYear,
          paperSession,
          examBoard
        }
      }
    });

  } catch (error) {
    console.error('Upload past paper error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload markscheme PDF and extract answers
 */
export const uploadMarkschemePDF = async (req, res) => {
  try {
    if (!req.files || !req.files.markschemePdf) {
      return res.status(400).json({ success: false, message: 'Markscheme PDF is required' });
    }

    const pdfFile = req.files.markschemePdf;

    console.log('📄 Processing markscheme PDF...');

    // Extract text from PDF
    const extraction = await extractTextFromPDF(pdfFile.data);
    if (!extraction.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract PDF text',
        error: extraction.error
      });
    }

    const cleanedText = cleanPDFText(extraction.text);

    // Extract markscheme with AI
    console.log('🤖 Extracting markscheme with AI...');
    const markschemeResult = await extractMarkschemeFromPDF(cleanedText);

    if (!markschemeResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to extract markscheme',
        error: markschemeResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Markscheme extracted successfully',
      data: markschemeResult.data
    });

  } catch (error) {
    console.error('Upload markscheme error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Merge questions and markscheme, save to database
 */
export const savePastPaperQuestions = async (req, res) => {
  try {
    const { questionsData, markschemeData, metadata } = req.body;
    const { subject, lessonId, paperYear, examBoard } = metadata;

    if (!questionsData || !markschemeData) {
      return res.status(400).json({
        success: false,
        message: 'Questions and markscheme data are required'
      });
    }

    console.log('🔗 Merging questions with markscheme...');

    // Merge and format for database
    const mergedQuestions = await mergeAndSavePastPaper(questionsData, markschemeData, {
      subject,
      lessonId,
      paperYear,
      examBoard
    });

    // Save to database
    const savedQuestions = [];
    for (const q of mergedQuestions) {
      const question = await Question.create({
        ...q,
        createdBy: req.user._id
      });
      savedQuestions.push(question);
    }

    console.log(`✅ Saved ${savedQuestions.length} questions to database`);

    res.status(201).json({
      success: true,
      message: `${savedQuestions.length} questions saved successfully`,
      data: {
        count: savedQuestions.length,
        questions: savedQuestions
      }
    });

  } catch (error) {
    console.error('Save past paper error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXISTING CRUD OPERATIONS ====================

export const getQuestions = async (req, res) => {
  try {
    const { page = 1, limit = 20, subject, lesson, difficulty, source, search } = req.query;

    const query = { isActive: true };
    if (subject) query.subject = subject;
    if (lesson) query.lesson = lesson;
    if (difficulty) query.difficulty = difficulty;
    if (source) query.source = source;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('lesson', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Question.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuestionsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { difficulty, source, limit = 50 } = req.query;

    const query = { lesson: lessonId, isActive: true };
    if (difficulty && difficulty !== 'mixed') query.difficulty = difficulty;
    if (source && source !== 'mixed') query.source = source;

    const questions = await Question.find(query)
      .sort({ difficulty: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Get lesson questions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user._id,
      source: req.body.source || 'manual'
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT PROGRESS ====================

export const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [overallStats, difficultyProgress, subjectStats, recentSessions] = await Promise.all([
      StudentAttempt.aggregate([
        { $match: { student: studentId } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
            averageScore: { $avg: '$score' },
            totalTime: { $sum: '$timeSpentSeconds' }
          }
        }
      ]),
      StudentAttempt.getDifficultyProgress(studentId),
      StudentAttempt.aggregate([
        { $match: { student: studentId } },
        {
          $group: {
            _id: '$subject',
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
            averageScore: { $avg: '$score' }
          }
        }
      ]),
      QuestionSession.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('lesson', 'title')
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0] || { totalAttempts: 0, correctAttempts: 0, averageScore: 0, totalTime: 0 },
        byDifficulty: difficultyProgress,
        bySubject: subjectStats,
        recentSessions
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;
    const weakTopics = await StudentAttempt.getWeakTopics(studentId);

    res.status(200).json({
      success: true,
      data: { weakTopics }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  generateQuestionsForStudent,
  startAIQuizSession,
  submitAIAnswer,
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
};
