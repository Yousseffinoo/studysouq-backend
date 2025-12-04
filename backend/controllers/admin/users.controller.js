import User from '../../models/User.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', sort = '-createdAt' } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllUsers", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getUserById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Admin
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, isPremium } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isPremium: isPremium || false
    });

    // Log activity
    await createActivityLog(
      req.user,
      'user_created',
      'user',
      user._id,
      { userName: user.name, userEmail: user.email }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error("ERROR ORIGIN: createUser", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, isPremium, premiumExpiry, isEmailVerified } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isPremium !== 'undefined') user.isPremium = isPremium;
    if (premiumExpiry) user.premiumExpiry = premiumExpiry;
    if (typeof isEmailVerified !== 'undefined') user.isEmailVerified = isEmailVerified;

    await user.save();

    // Log activity
    await createActivityLog(
      req.user,
      'user_updated',
      'user',
      user._id,
      { updates: req.body }
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updateUser", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    // Log activity
    await createActivityLog(
      req.user,
      'user_deleted',
      'user',
      user._id,
      { userName: user.name, userEmail: user.email }
    );

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deleteUser", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Ban/Unban user
// @route   PATCH /api/admin/users/:id/ban
// @access  Admin
export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle lock status
    if (user.lockUntil && user.lockUntil > Date.now()) {
      // Unban
      user.lockUntil = null;
      user.loginAttempts = 0;
      await user.save();

      await createActivityLog(
        req.user,
        'user_unbanned',
        'user',
        user._id
      );

      res.status(200).json({
        success: true,
        message: 'User unbanned successfully'
      });
    } else {
      // Ban for 30 days
      user.lockUntil = Date.now() + (30 * 24 * 60 * 60 * 1000);
      await user.save();

      await createActivityLog(
        req.user,
        'user_banned',
        'user',
        user._id
      );

      res.status(200).json({
        success: true,
        message: 'User banned successfully'
      });
    }
  } catch (error) {
    console.error("ERROR ORIGIN: toggleUserBan", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error updating user ban status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Admin
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Users registered in last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: lastWeek } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        premiumUsers,
        adminUsers,
        freeUsers: totalUsers - premiumUsers,
        newUsersThisWeek: newUsers
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getUserStats", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

