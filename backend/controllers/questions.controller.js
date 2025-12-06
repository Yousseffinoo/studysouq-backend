import Question from '../models/Question.js';
import StudentAttempt from '../models/StudentAttempt.js';
import QuestionSession from '../models/QuestionSession.js';
import Lesson from '../models/Lesson.js';
import aiService from '../services/aiQuestionService.js';
import pdfService from '../services/pdfService.js';
import cloudinary from '../config/cloudinary.js';

// ==================== QUESTION CRUD ====================

/**
 * Get all questions with filters
 */
export const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      subject,
      section,
      lesson,
      difficulty,
      source,
      tags,
      search,
      isActive = true
    } = req.query;

    const query = { isActive: isActive === 'true' || isActive === true };

    if (subject) query.subject = subject;
    if (section) query.section = section;
    if (lesson) query.lesson = lesson;
    if (difficulty) query.difficulty = difficulty;
    if (source) query.source = source;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('lesson', 'title slug')
        .populate('section', 'name')
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
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get questions by lesson
 */
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
    console.error('Error fetching lesson questions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single question
 */
export const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('lesson', 'title slug')
      .populate('section', 'name');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create question manually
 */
export const createQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user._id,
      source: req.body.source || 'manual'
    };

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update question
 */
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
    console.error('Error updating question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete question (soft delete)
 */
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user._id },
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
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PDF UPLOAD & AI EXTRACTION ====================

/**
 * Upload and extract questions from PDF
 */
export const uploadQuestionsPDF = async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const pdfFile = req.files.pdf;
    const { subject, section, lesson, paperYear, examBoard } = req.body;

    // Extract text from PDF
    const extraction = await pdfService.extractTextFromPDF(pdfFile.data);
    if (!extraction.success) {
      return res.status(400).json({ success: false, message: 'Failed to extract PDF text' });
    }

    // Clean the text
    const cleanedText = pdfService.cleanPDFText(extraction.text);

    // Extract questions using AI
    const aiResult = await aiService.extractQuestionsFromPDF(cleanedText, {
      subject, paperYear, examBoard
    });

    if (!aiResult.success) {
      return res.status(500).json({ success: false, message: 'AI extraction failed', error: aiResult.error });
    }

    // Return extracted questions for admin review
    res.status(200).json({
      success: true,
      message: 'Questions extracted successfully',
      data: {
        extractedQuestions: aiResult.data,
        metadata: {
          pages: extraction.metadata?.pages,
          subject,
          section,
          lesson,
          paperYear,
          examBoard
        }
      }
    });
  } catch (error) {
    console.error('Error processing questions PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Upload and extract markscheme from PDF
 */
export const uploadMarkschemePDF = async (req, res) => {
  try {
    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    }

    const pdfFile = req.files.pdf;

    // Extract text from PDF
    const extraction = await pdfService.extractTextFromPDF(pdfFile.data);
    if (!extraction.success) {
      return res.status(400).json({ success: false, message: 'Failed to extract PDF text' });
    }

    // Clean the text
    const cleanedText = pdfService.cleanPDFText(extraction.text);

    // Extract markscheme using AI
    const aiResult = await aiService.extractMarkschemeFromPDF(cleanedText);

    if (!aiResult.success) {
      return res.status(500).json({ success: false, message: 'AI extraction failed', error: aiResult.error });
    }

    res.status(200).json({
      success: true,
      message: 'Markscheme extracted successfully',
      data: {
        extractedMarkscheme: aiResult.data,
        metadata: { pages: extraction.metadata?.pages }
      }
    });
  } catch (error) {
    console.error('Error processing markscheme PDF:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Merge questions and markscheme, then save to database
 */
export const mergeAndSaveQuestions = async (req, res) => {
  try {
    const { questionsJson, markschemeJson, metadata } = req.body;
    const { subject, section, lesson, paperYear, examBoard } = metadata;

    // Merge questions with markscheme
    const mergeResult = await aiService.mergeQuestionsAndMarkscheme(questionsJson, markschemeJson);
    if (!mergeResult.success) {
      return res.status(500).json({ success: false, message: 'Merge failed', error: mergeResult.error });
    }

    // Convert to DB format
    const dbResult = await aiService.convertToDBFormat(mergeResult.data, metadata);
    if (!dbResult.success) {
      return res.status(500).json({ success: false, message: 'Conversion failed', error: dbResult.error });
    }

    // Save questions to database
    const savedQuestions = [];
    for (const q of dbResult.data) {
      const question = await Question.create({
        subject,
        section: section || null,
        lesson,
        questionText: q.questionText,
        answerText: q.answerText,
        marks: q.marks || 1,
        difficulty: q.difficulty || 'medium',
        source: 'past_paper',
        paperYear,
        examBoard,
        originalQuestionNumber: q.originalQuestionNumber,
        tags: q.tags || [],
        examinerNotes: q.notes || [],
        createdBy: req.user._id
      });
      savedQuestions.push(question);
    }

    res.status(201).json({
      success: true,
      message: `${savedQuestions.length} questions saved successfully`,
      data: { count: savedQuestions.length, questions: savedQuestions }
    });
  } catch (error) {
    console.error('Error merging and saving questions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== AI GENERATION ====================

/**
 * Generate questions with AI
 */
export const generateQuestions = async (req, res) => {
  try {
    const { subject, section, lesson, difficulty, numberOfQuestions = 5, context } = req.body;

    // Get lesson details for context
    const lessonDoc = await Lesson.findById(lesson);
    const lessonTitle = lessonDoc?.title || 'Unknown Topic';

    const result = await aiService.generateQuestions({
      subject,
      lesson: lessonTitle,
      difficulty,
      numberOfQuestions,
      context
    });

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Generation failed', error: result.error });
    }

    // Return for admin review (not saved yet)
    res.status(200).json({
      success: true,
      message: `Generated ${result.data.length} questions`,
      data: {
        generatedQuestions: result.data,
        metadata: { subject, section, lesson, difficulty }
      }
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Save AI-generated questions (after admin approval)
 */
export const saveGeneratedQuestions = async (req, res) => {
  try {
    const { questions, metadata } = req.body;
    const { subject, section, lesson } = metadata;

    const savedQuestions = [];
    for (const q of questions) {
      const question = await Question.create({
        subject,
        section: section || null,
        lesson,
        questionText: q.questionText,
        answerText: q.answerText,
        explanation: q.explanation || '',
        steps: q.steps || [],
        marks: q.marks || 1,
        difficulty: q.difficulty || 'medium',
        source: 'ai_generated',
        tags: q.tags || [],
        isVerified: false,
        createdBy: req.user._id
      });
      savedQuestions.push(question);
    }

    res.status(201).json({
      success: true,
      message: `${savedQuestions.length} questions saved`,
      data: savedQuestions
    });
  } catch (error) {
    console.error('Error saving generated questions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Regenerate explanation for a question
 */
export const regenerateExplanation = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const result = await aiService.generateExplanation(question);
    if (!result.success) {
      return res.status(500).json({ success: false, message: 'Generation failed', error: result.error });
    }

    // Update question with new explanation
    question.explanation = result.data.explanation;
    question.steps = result.data.steps;
    await question.save();

    res.status(200).json({
      success: true,
      message: 'Explanation regenerated',
      data: question
    });
  } catch (error) {
    console.error('Error regenerating explanation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT QUIZ SYSTEM ====================

/**
 * Start a new quiz session
 */
export const startQuizSession = async (req, res) => {
  try {
    const { subject, section, lesson, numberOfQuestions, difficulty, sourceType, answerMode } = req.body;
    const studentId = req.user._id;

    // Check for existing active session
    const existingSession = await QuestionSession.findOne({
      student: studentId,
      status: 'active'
    });

    if (existingSession) {
      // Return existing session
      await existingSession.populate('questions.question');
      return res.status(200).json({
        success: true,
        message: 'Resuming existing session',
        data: existingSession
      });
    }

    // Build query for questions
    const query = { lesson, isActive: true };
    if (difficulty && difficulty !== 'mixed') query.difficulty = difficulty;
    if (sourceType && sourceType !== 'mixed') query.source = sourceType;

    // Get random questions
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(numberOfQuestions) } }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for the selected criteria'
      });
    }

    // Create session
    const session = await QuestionSession.create({
      student: studentId,
      subject,
      section: section || null,
      lesson,
      numberOfQuestions: questions.length,
      difficulty,
      sourceType,
      answerMode,
      questions: questions.map((q, i) => ({
        question: q._id,
        order: i + 1,
        answered: false
      })),
      totalQuestions: questions.length,
      maxPossibleScore: questions.reduce((sum, q) => sum + (q.marks || 1), 0) * 100 / questions.length
    });

    await session.populate('questions.question');

    res.status(201).json({
      success: true,
      message: 'Quiz session started',
      data: session
    });
  } catch (error) {
    console.error('Error starting quiz session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current quiz session
 */
export const getCurrentSession = async (req, res) => {
  try {
    const session = await QuestionSession.findOne({
      student: req.user._id,
      status: 'active'
    }).populate('questions.question');

    if (!session) {
      return res.status(404).json({ success: false, message: 'No active session' });
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit answer for a question
 */
export const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionId, questionIndex, answerType, answerText, timeSpent } = req.body;
    const studentId = req.user._id;

    // Get the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    let processedAnswer = answerText;
    
    // Handle image/canvas upload
    if ((answerType === 'canvas' || answerType === 'image') && req.files?.answer) {
      const file = req.files.answer;
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.data.toString('base64')}`,
        { folder: 'student-answers' }
      );
      
      // Analyze the image with AI
      const analysisResult = await aiService.analyzeImageAnswer(uploadResult.secure_url, question);
      if (analysisResult.success) {
        processedAnswer = analysisResult.data.extractedText || 'Unable to extract answer';
      }
    }

    // Check answer with AI (unless instant mode with no answer)
    let aiCheck = { isCorrect: false, score: 0 };
    if (answerType !== 'instant' || processedAnswer) {
      const checkResult = await aiService.checkStudentAnswer(question, processedAnswer, answerType);
      if (checkResult.success) {
        aiCheck = checkResult.data;
      }
    } else {
      // Instant mode - show answer without checking
      aiCheck = {
        isCorrect: null,
        score: null,
        explanation: question.explanation || 'No explanation available',
        steps: question.steps || []
      };
    }

    // Create attempt record
    const attempt = await StudentAttempt.create({
      student: studentId,
      question: questionId,
      session: sessionId,
      answerType,
      answerText: processedAnswer,
      isCorrect: aiCheck.isCorrect,
      score: aiCheck.score,
      marksAwarded: aiCheck.marksAwarded,
      maxMarks: question.marks,
      aiExplanation: aiCheck.explanation,
      aiSteps: aiCheck.steps,
      aiFeedback: aiCheck.feedback,
      aiSuggestions: aiCheck.suggestions,
      timeSpentSeconds: timeSpent || 0,
      lessonId: question.lesson,
      subject: question.subject,
      difficulty: question.difficulty
    });

    // Update question statistics
    if (aiCheck.isCorrect !== null) {
      await question.updateStats(aiCheck.isCorrect, aiCheck.score || 0);
    }

    // Update session if applicable
    if (sessionId) {
      const session = await QuestionSession.findById(sessionId);
      if (session) {
        await session.recordAnswer(
          questionIndex,
          attempt._id,
          aiCheck.isCorrect,
          aiCheck.score || 0
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Answer submitted',
      data: {
        attempt,
        correctAnswer: question.answerText,
        explanation: aiCheck.explanation,
        steps: aiCheck.steps,
        feedback: aiCheck.feedback,
        isCorrect: aiCheck.isCorrect,
        score: aiCheck.score
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * End quiz session
 */
export const endQuizSession = async (req, res) => {
  try {
    const session = await QuestionSession.findOne({
      _id: req.params.sessionId,
      student: req.user._id
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await session.complete();

    res.status(200).json({
      success: true,
      message: 'Session completed',
      data: {
        totalQuestions: session.totalQuestions,
        questionsAnswered: session.questionsAnswered,
        questionsCorrect: session.questionsCorrect,
        averageScore: session.averageScore,
        totalTimeSeconds: session.totalTimeSeconds
      }
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT ANALYTICS ====================

/**
 * Get student progress/analytics
 */
export const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get overall stats
    const overallStats = await StudentAttempt.aggregate([
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
    ]);

    // Get difficulty breakdown
    const difficultyProgress = await StudentAttempt.getDifficultyProgress(studentId);

    // Get subject breakdown
    const subjectStats = await StudentAttempt.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: '$subject',
          totalAttempts: { $sum: 1 },
          correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    // Get recent sessions
    const recentSessions = await QuestionSession.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('lesson', 'title');

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
    console.error('Error getting progress:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get weak topics and recommendations
 */
export const getRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get weak topics
    const weakTopics = await StudentAttempt.getWeakTopics(studentId);

    // Get recent performance for AI context
    const recentAttempts = await StudentAttempt.find({ student: studentId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get AI recommendations
    const aiRecs = await aiService.getRecommendedQuestions(weakTopics, {
      recentAttempts: recentAttempts.map(a => ({
        subject: a.subject,
        difficulty: a.difficulty,
        isCorrect: a.isCorrect,
        score: a.score
      }))
    });

    // Get recommended questions from weak topics
    const recommendedQuestions = [];
    for (const topic of weakTopics.slice(0, 3)) {
      const questions = await Question.find({
        lesson: topic._id,
        isActive: true,
        difficulty: { $in: ['easy', 'medium'] } // Start with easier questions
      })
        .limit(3)
        .lean();
      recommendedQuestions.push(...questions);
    }

    res.status(200).json({
      success: true,
      data: {
        weakTopics,
        recommendations: aiRecs.success ? aiRecs.data : null,
        suggestedQuestions: recommendedQuestions
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get lesson-specific stats
 */
export const getLessonStats = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user._id;

    const stats = await StudentAttempt.getLessonStats(studentId, lessonId);

    // Get recent attempts for this lesson
    const recentAttempts = await StudentAttempt.find({
      student: studentId,
      lessonId
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('question', 'questionText difficulty');

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentAttempts
      }
    });
  } catch (error) {
    console.error('Error getting lesson stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getQuestions,
  getQuestionsByLesson,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionsPDF,
  uploadMarkschemePDF,
  mergeAndSaveQuestions,
  generateQuestions,
  saveGeneratedQuestions,
  regenerateExplanation,
  startQuizSession,
  getCurrentSession,
  submitAnswer,
  endQuizSession,
  getStudentProgress,
  getRecommendations,
  getLessonStats
};

