import Question from '../models/Question.js';
import StudentAttempt from '../models/StudentAttempt.js';
import QuestionSession from '../models/QuestionSession.js';
import Lesson from '../models/Lesson.js';
import Subject from '../models/Subject.js';
import {
  generateQuestionsWithAI,
  reviewStudentAnswer,
  generateMockExam,
  mathiusTutorChat,
  extractQuestionsFromPastPaper,
  extractMarkschemeFromPDF,
  mergeAndSavePastPaper
} from '../services/aiQuestionGenerator.js';
import { extractTextFromPDF, cleanPDFText } from '../services/pdfService.js';

// ==================== AI QUESTION GENERATION ====================

/**
 * Generate questions on-the-fly with Mathius AI
 */
export const generateQuestionsForStudent = async (req, res) => {
  try {
    const { lessonId, difficulty = 'medium', numberOfQuestions = 5 } = req.body;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: 'Lesson ID is required' });
    }

    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const subject = await Subject.findOne({ slug: lesson.subject }).lean();

    console.log('🧠 Mathius: Generating practice questions...');

    const result = await generateQuestionsWithAI({
      lessonId,
      subject: subject?.name || lesson.subject,
      difficulty,
      numberOfQuestions: Math.min(numberOfQuestions, 15)
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Mathius could not generate questions',
        error: result.error
      });
    }

    const questions = result.data.map((q, index) => ({
      _id: `mathius_${Date.now()}_${index}`,
      ...q,
      isAIGenerated: true
    }));

    res.status(200).json({
      success: true,
      message: `Mathius generated ${questions.length} questions`,
      data: {
        questions,
        lesson: { _id: lesson._id, title: lesson.title, subject: lesson.subject },
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generate Mock Exam (multiple lessons)
 */
export const generateMockExamQuestions = async (req, res) => {
  try {
    const { lessonIds, numberOfQuestions = 20, difficulty = 'mixed' } = req.body;

    if (!lessonIds || !Array.isArray(lessonIds) || lessonIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Select at least one lesson' });
    }

    console.log('📝 Mathius: Generating mock exam...');

    const result = await generateMockExam({
      lessonIds,
      numberOfQuestions: Math.min(numberOfQuestions, 50),
      difficulty
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Mathius could not generate mock exam',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: `Mock exam with ${result.data.length} questions ready`,
      data: result
    });

  } catch (error) {
    console.error('Generate mock error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Submit answer for AI review
 */
export const submitAIAnswer = async (req, res) => {
  try {
    const { questionIndex, question, answerText, answerType = 'text', timeSpent = 0, lessonId } = req.body;
    const studentId = req.user?._id;

    if (!question || !question.questionText) {
      return res.status(400).json({ success: false, message: 'Question data is required' });
    }

    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an answer' });
    }

    console.log('🔍 Mathius: Reviewing answer...');

    const reviewResult = await reviewStudentAnswer(question, answerText, answerType);

    if (!reviewResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Mathius could not review answer',
        error: reviewResult.error
      });
    }

    const review = reviewResult.data;

    // Save attempt if user is logged in
    if (studentId) {
      try {
        await StudentAttempt.create({
          student: studentId,
          question: null,
          aiQuestionData: question,
          answerType,
          answerText,
          isCorrect: review.isCorrect,
          score: review.score,
          marksAwarded: review.marksAwarded,
          maxMarks: review.maxMarks,
          aiExplanation: review.feedback,
          aiFeedback: review.feedback,
          aiSuggestions: review.improvements,
          timeSpentSeconds: timeSpent,
          lessonId,
          difficulty: question.difficulty
        });
      } catch (e) {
        console.error('Error saving attempt:', e);
      }
    }

    res.status(200).json({
      success: true,
      message: review.isCorrect ? 'Correct!' : 'Keep trying!',
      data: {
        review: {
          isCorrect: review.isCorrect,
          marksAwarded: review.marksAwarded,
          maxMarks: review.maxMarks,
          score: review.score,
          feedback: review.feedback,
          correctSolution: review.correctSolution,
          improvements: review.improvements
        },
        correctAnswer: question.answerText,
        explanation: question.explanation,
        steps: question.steps
      }
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mathius Tutor Chat
 */
export const tutorChat = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const result = await mathiusTutorChat(message, context || {});

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Mathius is unavailable',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Tutor chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ADMIN: PAST PAPER UPLOAD ====================

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

    const extraction = await extractTextFromPDF(pdfFile.data);
    if (!extraction.success) {
      return res.status(400).json({ success: false, message: 'Failed to extract PDF', error: extraction.error });
    }

    const cleanedText = cleanPDFText(extraction.text);
    const questionsResult = await extractQuestionsFromPastPaper(cleanedText, { subject, paperYear, paperSession, examBoard });

    if (!questionsResult.success) {
      return res.status(500).json({ success: false, message: 'Mathius could not extract questions', error: questionsResult.error });
    }

    res.status(200).json({
      success: true,
      message: 'Questions extracted',
      data: { questions: questionsResult.data, metadata: { subject, lessonId, paperYear, paperSession, examBoard } }
    });

  } catch (error) {
    console.error('Upload past paper error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadMarkschemePDF = async (req, res) => {
  try {
    if (!req.files || !req.files.markschemePdf) {
      return res.status(400).json({ success: false, message: 'Markscheme PDF is required' });
    }

    const pdfFile = req.files.markschemePdf;
    const extraction = await extractTextFromPDF(pdfFile.data);
    if (!extraction.success) {
      return res.status(400).json({ success: false, message: 'Failed to extract PDF', error: extraction.error });
    }

    const cleanedText = cleanPDFText(extraction.text);
    const markschemeResult = await extractMarkschemeFromPDF(cleanedText);

    if (!markschemeResult.success) {
      return res.status(500).json({ success: false, message: 'Mathius could not extract markscheme', error: markschemeResult.error });
    }

    res.status(200).json({ success: true, message: 'Markscheme extracted', data: markschemeResult.data });

  } catch (error) {
    console.error('Upload markscheme error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const savePastPaperQuestions = async (req, res) => {
  try {
    const { questionsData, markschemeData, metadata } = req.body;

    if (!questionsData || !markschemeData) {
      return res.status(400).json({ success: false, message: 'Questions and markscheme data required' });
    }

    const mergedQuestions = await mergeAndSavePastPaper(questionsData, markschemeData, metadata);

    const savedQuestions = [];
    for (const q of mergedQuestions) {
      const question = await Question.create({ ...q, createdBy: req.user._id });
      savedQuestions.push(question);
    }

    res.status(201).json({
      success: true,
      message: `${savedQuestions.length} questions saved`,
      data: { count: savedQuestions.length, questions: savedQuestions }
    });

  } catch (error) {
    console.error('Save past paper error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CRUD ====================

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
      Question.find(query).populate('lesson', 'title slug').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Question.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: { questions, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }
    });
  } catch (error) {
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

    const questions = await Question.find(query).sort({ difficulty: 1, createdAt: -1 }).limit(parseInt(limit)).lean();

    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id, source: req.body.source || 'manual' });
    res.status(201).json({ success: true, message: 'Question created', data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user._id }, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.status(200).json({ success: true, message: 'Question updated', data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STUDENT PROGRESS ====================

export const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [overallStats, difficultyProgress, recentSessions] = await Promise.all([
      StudentAttempt.aggregate([
        { $match: { student: studentId } },
        { $group: { _id: null, totalAttempts: { $sum: 1 }, correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } }, averageScore: { $avg: '$score' }, totalTime: { $sum: '$timeSpentSeconds' } } }
      ]),
      StudentAttempt.getDifficultyProgress(studentId),
      QuestionSession.find({ student: studentId }).sort({ createdAt: -1 }).limit(10).populate('lesson', 'title')
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0] || { totalAttempts: 0, correctAttempts: 0, averageScore: 0, totalTime: 0 },
        byDifficulty: difficultyProgress,
        recentSessions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const studentId = req.user._id;
    const weakTopics = await StudentAttempt.getWeakTopics(studentId);
    res.status(200).json({ success: true, data: { weakTopics } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  generateQuestionsForStudent,
  generateMockExamQuestions,
  submitAIAnswer,
  tutorChat,
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
