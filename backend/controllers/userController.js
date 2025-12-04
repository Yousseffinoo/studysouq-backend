import User from '../models/User.js';
import Progress from '../models/Progress.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // Get progress stats
    const progressStats = await Progress.aggregate([
      { $match: { user: user._id } },
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

    const stats = progressStats.length > 0 ? progressStats[0] : {
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
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isPremium: user.isPremiumActive(),
          premiumExpiry: user.premiumExpiry,
          role: user.role,
          avatar: user.avatar,
          authProvider: user.authProvider,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        },
        stats: {
          ...stats,
          completionRate: stats.totalLessons > 0 
            ? ((stats.completedLessons / stats.totalLessons) * 100).toFixed(2)
            : 0,
          accuracy: stats.totalQuestionsAttempted > 0
            ? ((stats.totalQuestionsCorrect / stats.totalQuestionsAttempted) * 100).toFixed(2)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, avatar } = req.body;

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) {
      // Allow empty string to clear avatar
      user.avatar = avatar || null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    // Check if user uses social login
    if (!user.password) {
      const provider = user.authProvider || 'social';
      return res.status(400).json({
        success: false,
        message: `This account uses ${provider} login. Password change is not available.`
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = req.user;

    // Delete user's progress
    await Progress.deleteMany({ user: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

