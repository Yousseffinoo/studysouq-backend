import Subject from '../../models/Subject.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// Helper function to map frontend level to backend level
const mapLevelToBackend = (level) => {
  if (!level) return level;
  const levelMap = {
    'O-Level': 'igcse',
    'AS': 'a-level',
    'A2': 'a-level',
    'igcse': 'igcse',
    'a-level': 'a-level'
  };
  return levelMap[level] || level;
};

// Helper function to map backend level to frontend level
const mapLevelToFrontend = (level) => {
  if (!level) return level;
  // For now, map a-level back to 'A-Level' (frontend can distinguish AS/A2 if needed)
  const levelMap = {
    'igcse': 'O-Level',
    'a-level': 'A-Level'
  };
  return levelMap[level] || level;
};

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Admin
export const getAllSubjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', level = '', status = '' } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (level) {
      const backendLevel = mapLevelToBackend(level);
      query.level = backendLevel;
    }
    
    if (status !== '') {
      query.isActive = status === 'active' || status === 'true';
    }

    const subjects = await Subject.find(query)
      .sort('order')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Transform subjects to match frontend expectations
    const transformedSubjects = subjects.map(subject => ({
      ...subject,
      level: mapLevelToFrontend(subject.level),
      status: subject.isActive ? 'active' : 'inactive'
    }));

    const count = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        subjects: transformedSubjects,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ERROR ORIGIN - getAllSubjects:', error.stack || error);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single subject
// @route   GET /api/admin/subjects/:id
// @access  Admin
export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).lean();
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Transform to match frontend expectations
    const transformedSubject = {
      ...subject,
      level: mapLevelToFrontend(subject.level),
      status: subject.isActive ? 'active' : 'inactive'
    };

    res.status(200).json({
      success: true,
      data: transformedSubject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message
    });
  }
};

// @desc    Create new subject
// @route   POST /api/admin/subjects
// @access  Admin
export const createSubject = async (req, res) => {
  try {
    const { name, description, level, icon, color, isActive, order, status } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject description is required'
      });
    }

    if (!level) {
      return res.status(400).json({
        success: false,
        message: 'Subject level is required'
      });
    }
    
    // Map frontend level to backend level
    const backendLevel = mapLevelToBackend(level);
    
    if (!backendLevel || !['igcse', 'a-level'].includes(backendLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level. Must be O-Level, AS, or A2'
      });
    }
    
    // Determine isActive from status or isActive
    const isActiveValue = status !== undefined 
      ? (status === 'active' || status === true)
      : (isActive !== undefined ? isActive : true);

    // Generate slug from name - safer generation
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Subject name must contain valid characters'
      });
    }

    // Check if subject with same name or slug exists
    const existingSubject = await Subject.findOne({ 
      $or: [{ name: name.trim() }, { slug }] 
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name or slug already exists'
      });
    }

    const subject = await Subject.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      level: backendLevel,
      icon: icon || null,
      color: color || '#2F6FED',
      isActive: isActiveValue,
      order: order || 0
    });

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'subject_created',
        'subject',
        subject._id,
        { name: subject.name }
      );
    } catch (logError) {
      // Log error but don't break the request
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in createSubject:', logError.message);
      }
    }

    // Transform to match frontend expectations
    const transformedSubject = {
      ...subject.toObject(),
      level: mapLevelToFrontend(subject.level),
      status: subject.isActive ? 'active' : 'inactive'
    };

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: transformedSubject
    });
  } catch (error) {
    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('ERROR ORIGIN - createSubject:', error.stack || error);
    }
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update subject
// @route   PUT /api/admin/subjects/:id
// @access  Admin
export const updateSubject = async (req, res) => {
  try {
    const { name, description, level, icon, color, isActive, order, status } = req.body;
    
    // Map frontend level to backend level if provided
    const backendLevel = level ? mapLevelToBackend(level) : undefined;

    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // If name is being updated, regenerate slug
    if (name && name !== subject.name) {
      const newSlug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Check if new slug conflicts with existing subject
      const existingSubject = await Subject.findOne({ 
        slug: newSlug,
        _id: { $ne: subject._id }
      });

      if (existingSubject) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this name already exists'
        });
      }

      subject.slug = newSlug;
      subject.name = name;
    }

    if (description !== undefined) subject.description = description;
    if (backendLevel) subject.level = backendLevel;
    if (icon !== undefined) subject.icon = icon;
    if (color) subject.color = color;
    
    // Handle status or isActive
    if (status !== undefined) {
      subject.isActive = status === 'active' || status === true;
    } else if (typeof isActive !== 'undefined') {
      subject.isActive = isActive;
    }
    
    if (order !== undefined) subject.order = order;

    await subject.save();

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'subject_updated',
        'subject',
        subject._id,
        { name: subject.name }
      );
    } catch (logError) {
      // Log error but don't break the request
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in updateSubject:', logError.message);
      }
    }

    // Transform to match frontend expectations
    const transformedSubject = {
      ...subject.toObject(),
      level: mapLevelToFrontend(subject.level),
      status: subject.isActive ? 'active' : 'inactive'
    };

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: transformedSubject
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ERROR ORIGIN - updateSubject:', error.stack || error);
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/admin/subjects/:id
// @access  Admin
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    await subject.deleteOne();

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'subject_deleted',
        'subject',
        subject._id,
        { name: subject.name }
      );
    } catch (logError) {
      // Log error but don't break the request
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in deleteSubject:', logError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ERROR ORIGIN - deleteSubject:', error.stack || error);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting subject',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

