import User from '../../models/User.js';
import Lesson from '../../models/Lesson.js';
import Note from '../../models/Note.js';
import Question from '../../models/Question.js';
import Image from '../../models/Image.js';
import ActivityLog from '../../models/ActivityLog.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const [
      totalUsers,
      premiumUsers,
      totalLessons,
      totalNotes,
      totalQuestions,
      totalImages,
      pendingImages
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
      Lesson.countDocuments(),
      Note.countDocuments(),
      Question.countDocuments(),
      Image.countDocuments(),
      Image.countDocuments({ status: 'pending' })
    ]);

    // Get weekly new users (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: last7Days } });

    // Get recent activity
    const recentActivities = await ActivityLog.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10)
      .lean();

    // Weekly user registrations (last 7 days)
    const weeklyUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Lessons by subject
    const lessonsBySubject = await Lesson.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          premiumUsers,
          freeUsers: totalUsers - premiumUsers,
          totalLessons,
          totalNotes,
          totalQuestions,
          totalImages,
          pendingImages,
          newUsersThisWeek
        },
        charts: {
          weeklyUsers,
          lessonsBySubject
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getDashboardStats", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/dashboard/activities
// @access  Admin
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await ActivityLog.find()
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getRecentActivities", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/dashboard/analytics
// @access  Admin
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          total: { $sum: 1 },
          premium: {
            $sum: { $cond: ['$isPremium', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Content creation over time
    const contentGrowth = await Promise.all([
      Lesson.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Note.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Question.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth,
        contentGrowth: {
          lessons: contentGrowth[0],
          notes: contentGrowth[1],
          questions: contentGrowth[2]
        }
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAnalytics", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

