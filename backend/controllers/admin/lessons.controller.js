import mongoose from 'mongoose';
import Lesson from '../../models/Lesson.js';
import Subject from '../../models/Subject.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all lessons
// @route   GET /api/admin/lessons
// @access  Admin
export const getAllLessons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subject = '', isPremium = '' } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subject) query.subject = subject;
    if (isPremium !== '') query.isPremium = isPremium === 'true';

    const lessons = await Lesson.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Lesson.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        lessons,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllLessons", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single lesson
// @route   GET /api/admin/lessons/:id
// @access  Admin
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getLessonById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new lesson
// @route   POST /api/admin/lessons
// @access  Admin
export const createLesson = async (req, res) => {
  try {
    // Log request data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== CREATE LESSON REQUEST ===');
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

    // Handle subject - convert ID/slug to slug string if needed
    const inputSubjectValue = req.body.subject;
    if (!inputSubjectValue) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    // Handle subject - convert ID/slug to slug string if needed
    let finalSubjectValue = null;
    
    try {
      // Trim and normalize the subject value
      const normalizedSubjectValue = String(inputSubjectValue).trim();
      
      if (!normalizedSubjectValue) {
        return res.status(400).json({
          success: false,
          message: 'Subject value cannot be empty'
        });
      }

      let subject = null;
      
      // Try to find subject in database
      if (mongoose.Types.ObjectId.isValid(normalizedSubjectValue)) {
        // It's an ObjectId, fetch the subject to get slug
        try {
          subject = await Subject.findById(normalizedSubjectValue).lean();
        } catch (findError) {
          console.error('Error finding subject by ID:', findError);
          // Continue with string lookup
        }
      }
      
      // If not found by ID, try by slug or name
      if (!subject) {
        try {
          subject = await Subject.findOne({ 
            $or: [
              { slug: normalizedSubjectValue.toLowerCase() },
              { name: { $regex: new RegExp(`^${normalizedSubjectValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
            ]
          }).lean();
        } catch (findError) {
          console.error('Error finding subject by slug/name:', findError);
          // Continue - we'll use the value as-is
        }
      }
      
      // Determine final subject value
      if (subject) {
        // Use slug if available, otherwise generate from name
        if (subject.slug) {
          finalSubjectValue = subject.slug;
        } else if (subject.name) {
          // Generate slug from name
          finalSubjectValue = subject.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        } else {
          // Fallback to normalized value
          finalSubjectValue = normalizedSubjectValue.toLowerCase();
        }
      } else {
        // Subject not found in database - use the value as-is (might be a new subject or slug)
        // Normalize it to lowercase slug format
        finalSubjectValue = normalizedSubjectValue.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Subject "${normalizedSubjectValue}" not found in database, using as slug: "${finalSubjectValue}"`);
        }
      }
      
      // Final validation
      if (!finalSubjectValue || finalSubjectValue.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject value. Please select a valid subject.'
        });
      }
      
    } catch (subjectError) {
      console.error('=== ERROR PROCESSING SUBJECT ===');
      console.error('Subject value:', inputSubjectValue);
      console.error('Error:', subjectError);
      console.error('Error stack:', subjectError.stack);
      
      // Fallback: use the value as-is if it's a valid string
      const fallbackValue = String(inputSubjectValue).trim().toLowerCase();
      if (fallbackValue && fallbackValue.length > 0) {
        finalSubjectValue = fallbackValue.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        console.warn('Using fallback subject value:', finalSubjectValue);
      } else {
        return res.status(500).json({
          success: false,
          message: 'Error processing subject',
          error: process.env.NODE_ENV === 'development' ? subjectError.message : undefined
        });
      }
    }

    // Use the final subject value we determined
    const subjectValue = finalSubjectValue;

    // Validate required fields
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lesson title is required'
      });
    }

    if (!req.body.description || !req.body.description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lesson description is required'
      });
    }

    if (!req.body.content || !req.body.content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Lesson content is required'
      });
    }

    if (!req.body.chapter || isNaN(req.body.chapter) || req.body.chapter < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid chapter number is required (must be at least 1)'
      });
    }

    // Remove class field if present (user wants it removed)
    const { class: classField, ...lessonDataWithoutClass } = req.body;
    
    const lessonData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      content: req.body.content.trim(),
      subject: subjectValue,
      chapter: parseInt(req.body.chapter),
      order: req.body.order ? parseInt(req.body.order) : 0,
      difficulty: req.body.difficulty || 'medium',
      duration: req.body.duration ? parseInt(req.body.duration) : 30,
      videoUrl: (req.body.videoUrl && req.body.videoUrl.trim()) ? req.body.videoUrl.trim() : null,
      isPremium: req.body.isPremium === true || req.body.isPremium === 'true',
      isVisible: req.body.isVisible !== false && req.body.isVisible !== 'false',
      createdBy: req.user._id
    };

    let lesson;
    try {
      lesson = await Lesson.create(lessonData);
    } catch (createError) {
      console.error('Error creating lesson in database:', createError);
      console.error('Lesson data attempted:', {
        title: lessonData.title,
        subject: lessonData.subject,
        chapter: lessonData.chapter,
        hasContent: !!lessonData.content,
        contentLength: lessonData.content?.length
      });
      
      // Re-throw to be caught by outer catch block
      throw createError;
    }

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'lesson_created',
        'lesson',
        lesson._id,
        { title: lesson.title }
      );
    } catch (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in createLesson:', logError.message);
      }
      // Don't fail the request if activity log fails
    }

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    console.error("ERROR ORIGIN: createLesson", error);
    console.error("ERROR STACK: createLesson", error.stack);
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
      message: 'Error creating lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        stack: error.stack
      } : undefined
    });
  }
};

// @desc    Update lesson
// @route   PUT /api/admin/lessons/:id
// @access  Admin
export const updateLesson = async (req, res) => {
  console.log('=== UPDATE LESSON CALLED ===');
  console.log('Lesson ID:', req.params.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // First, find the existing lesson
    const existingLesson = await Lesson.findById(req.params.id);
    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Build update object with only provided fields
    const updateFields = {};
    
    // Basic fields
    if (req.body.title !== undefined) updateFields.title = req.body.title;
    if (req.body.description !== undefined) updateFields.description = req.body.description;
    if (req.body.content !== undefined) updateFields.content = req.body.content;
    if (req.body.chapter !== undefined) updateFields.chapter = req.body.chapter;
    if (req.body.order !== undefined) updateFields.order = req.body.order;
    if (req.body.difficulty !== undefined) updateFields.difficulty = req.body.difficulty;
    if (req.body.duration !== undefined) updateFields.duration = req.body.duration;
    if (req.body.isPremium !== undefined) updateFields.isPremium = req.body.isPremium;
    if (req.body.isVisible !== undefined) updateFields.isVisible = req.body.isVisible;
    if (req.body.videoUrl !== undefined) updateFields.videoUrl = req.body.videoUrl;
    
    // Handle subject - just use it directly (already validated by frontend)
    if (req.body.subject) {
      updateFields.subject = req.body.subject;
    }

    // Handle notes - update specific fields
    if (req.body.notes) {
      updateFields['notes.content'] = req.body.notes.content || '';
      updateFields['notes.summary'] = req.body.notes.summary || '';
      updateFields['notes.lastUpdated'] = new Date();
    }

    // Set updatedBy
    updateFields.updatedBy = req.user._id;

    console.log('Update fields:', JSON.stringify(updateFields, null, 2));

    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'lesson_updated',
        'lesson',
        lesson._id,
        { title: lesson.title }
      );
    } catch (logError) {
      console.error("ERROR ORIGIN: createActivityLog in updateLesson", logError);
      // Continue even if activity log fails
    }

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updateLesson");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        success: false, 
        message: error.message,
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating lesson',
      error: error.message
    });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/admin/lessons/:id
// @access  Admin
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    await lesson.deleteOne();

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'lesson_deleted',
        'lesson',
        lesson._id,
        { title: lesson.title }
      );
    } catch (logError) {
      console.error("ERROR ORIGIN: createActivityLog in deleteLesson", logError);
      // Continue even if activity log fails
    }

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deleteLesson", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get lesson statistics
// @route   GET /api/admin/lessons/stats
// @access  Admin
export const getLessonStats = async (req, res) => {
  try {
    const totalLessons = await Lesson.countDocuments();
    const premiumLessons = await Lesson.countDocuments({ isPremium: true });
    const visibleLessons = await Lesson.countDocuments({ isVisible: true });
    
    // Lessons by subject
    const lessonsBySubject = await Lesson.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLessons,
        premiumLessons,
        freeLessons: totalLessons - premiumLessons,
        visibleLessons,
        hiddenLessons: totalLessons - visibleLessons,
        bySubject: lessonsBySubject
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getLessonStats", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lesson statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

 
