import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Section from '../models/Section.js';
import Subject from '../models/Subject.js';

// @desc    Get user's progress for a specific lesson
// @route   GET /api/progress/lesson/:lessonId
// @access  Private
export const getLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;

    let progress = await Progress.findOne({ 
      user: userId, 
      lesson: lessonId 
    }).populate('lesson section subject');

    if (!progress) {
      // Create new progress record
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      progress = await Progress.create({
        user: userId,
        lesson: lessonId,
        section: lesson.section,
        subject: lesson.subject,
        status: 'not-started',
        progress: 0
      });

      progress = await progress.populate('lesson section subject');
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Update lesson progress
// @route   PUT /api/progress/lesson/:lessonId
// @access  Private
export const updateLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;
    const { progress: progressPercentage, timeSpent, notes } = req.body;

    let progress = await Progress.findOne({ 
      user: userId, 
      lesson: lessonId 
    });

    if (!progress) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      progress = await Progress.create({
        user: userId,
        lesson: lessonId,
        section: lesson.section,
        subject: lesson.subject
      });
    }

    // Update progress
    if (progressPercentage !== undefined) {
      await progress.updateProgress(progressPercentage);
    }

    if (timeSpent !== undefined) {
      progress.timeSpent += timeSpent;
    }

    if (notes !== undefined) {
      progress.notes = notes;
    }

    progress.lastAccessedAt = Date.now();
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

// @desc    Get progress for a section
// @route   GET /api/progress/section/:sectionId
// @access  Private
export const getSectionProgress = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const userId = req.user._id;

    const progress = await Progress.find({
      user: userId,
      section: sectionId
    }).populate('lesson');

    // Calculate section statistics
    const totalLessons = progress.length;
    const completedLessons = progress.filter(p => p.status === 'completed').length;
    const inProgressLessons = progress.filter(p => p.status === 'in-progress').length;
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0);

    res.status(200).json({
      success: true,
      data: {
        lessons: progress,
        stats: {
          totalLessons,
          completedLessons,
          inProgressLessons,
          notStartedLessons: totalLessons - completedLessons - inProgressLessons,
          totalTimeSpent,
          completionRate: totalLessons > 0 ? ((completedLessons / totalLessons) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get section progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching section progress',
      error: error.message
    });
  }
};

// @desc    Get progress for a subject
// @route   GET /api/progress/subject/:subjectId
// @access  Private
export const getSubjectProgress = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user._id;

    const progress = await Progress.find({
      user: userId,
      subject: subjectId
    }).populate('lesson section');

    // Group by section
    const progressBySection = {};
    progress.forEach(p => {
      const sectionId = p.section._id.toString();
      if (!progressBySection[sectionId]) {
        progressBySection[sectionId] = {
          section: p.section,
          lessons: [],
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalTimeSpent: 0
        };
      }
      
      progressBySection[sectionId].lessons.push(p);
      progressBySection[sectionId].totalTimeSpent += p.timeSpent;
      
      if (p.status === 'completed') progressBySection[sectionId].completed++;
      else if (p.status === 'in-progress') progressBySection[sectionId].inProgress++;
      else progressBySection[sectionId].notStarted++;
    });

    const totalLessons = progress.length;
    const completedLessons = progress.filter(p => p.status === 'completed').length;

    res.status(200).json({
      success: true,
      data: {
        sections: Object.values(progressBySection),
        overallStats: {
          totalLessons,
          completedLessons,
          completionRate: totalLessons > 0 ? ((completedLessons / totalLessons) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get subject progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subject progress',
      error: error.message
    });
  }
};

// @desc    Get all user progress
// @route   GET /api/progress
// @access  Private
export const getAllProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const progress = await Progress.find({ user: userId })
      .populate('lesson section subject')
      .sort({ lastAccessedAt: -1 });

    const stats = await Progress.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalLessons: { $sum: 1 },
          completedLessons: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressLessons: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          totalTimeSpent: { $sum: '$timeSpent' },
          totalQuestionsAttempted: { $sum: '$questionsAttempted' },
          totalQuestionsCorrect: { $sum: '$questionsCorrect' }
        }
      }
    ]);

    const statistics = stats.length > 0 ? stats[0] : {
      totalLessons: 0,
      completedLessons: 0,
      inProgressLessons: 0,
      totalTimeSpent: 0,
      totalQuestionsAttempted: 0,
      totalQuestionsCorrect: 0
    };

    res.status(200).json({
      success: true,
      data: {
        progress,
        stats: {
          ...statistics,
          completionRate: statistics.totalLessons > 0
            ? ((statistics.completedLessons / statistics.totalLessons) * 100).toFixed(2)
            : 0,
          accuracy: statistics.totalQuestionsAttempted > 0
            ? ((statistics.totalQuestionsCorrect / statistics.totalQuestionsAttempted) * 100).toFixed(2)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Add quiz score
// @route   POST /api/progress/lesson/:lessonId/quiz
// @access  Private
export const addQuizScore = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;
    const { score, totalQuestions } = req.body;

    let progress = await Progress.findOne({ 
      user: userId, 
      lesson: lessonId 
    });

    if (!progress) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      progress = await Progress.create({
        user: userId,
        lesson: lessonId,
        section: lesson.section,
        subject: lesson.subject
      });
    }

    await progress.addQuizScore(score, totalQuestions);

    res.status(200).json({
      success: true,
      message: 'Quiz score added successfully',
      data: progress
    });
  } catch (error) {
    console.error('Add quiz score error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding quiz score',
      error: error.message
    });
  }
};

// @desc    Toggle bookmark
// @route   PUT /api/progress/lesson/:lessonId/bookmark
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;

    let progress = await Progress.findOne({ 
      user: userId, 
      lesson: lessonId 
    });

    if (!progress) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      progress = await Progress.create({
        user: userId,
        lesson: lessonId,
        section: lesson.section,
        subject: lesson.subject,
        isBookmarked: true
      });
    } else {
      progress.isBookmarked = !progress.isBookmarked;
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: progress.isBookmarked ? 'Lesson bookmarked' : 'Bookmark removed',
      data: progress
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling bookmark',
      error: error.message
    });
  }
};

// @desc    Get bookmarked lessons
// @route   GET /api/progress/bookmarks
// @access  Private
export const getBookmarkedLessons = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookmarked = await Progress.find({
      user: userId,
      isBookmarked: true
    }).populate('lesson section subject');

    res.status(200).json({
      success: true,
      data: bookmarked
    });
  } catch (error) {
    console.error('Get bookmarked lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmarked lessons',
      error: error.message
    });
  }
};

