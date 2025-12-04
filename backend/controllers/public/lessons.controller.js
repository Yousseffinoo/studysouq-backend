import mongoose from 'mongoose';
import Lesson from '../../models/Lesson.js';
import Section from '../../models/Section.js';
import Subject from '../../models/Subject.js';

// @desc    Get all lessons (public)
// @route   GET /api/lessons
// @access  Public
export const getLessons = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      subject = '', 
      class: classFilter = '',
      chapter = '',
      isPremium = ''
    } = req.query;

    const query = { isVisible: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subject) query.subject = subject;
    if (classFilter) query.class = classFilter;
    if (chapter) query.chapter = parseInt(chapter);
    if (isPremium !== '') query.isPremium = isPremium === 'true';

    const lessons = await Lesson.find(query)
      .select('title description content subject class chapter order difficulty duration videoUrl isPremium slug')
      .sort('order')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Lesson.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        lessons,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getLessons", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get lessons by section (public) - using subject instead
// @route   GET /api/sections/:id/lessons
// @access  Public
export const getLessonsBySection = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section ID format'
      });
    }

    // Get section to find its subject
    const section = await Section.findById(req.params.id)
      .populate('subject', 'name slug _id')
      .lean();
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Get subject details - section.subject could be ObjectId or populated object
    let subjectId = null;
    let subjectSlug = null;
    
    if (section.subject) {
      if (typeof section.subject === 'object' && section.subject._id) {
        // Populated subject object
        subjectId = section.subject._id;
        subjectSlug = section.subject.slug || section.subject.name?.toLowerCase().replace(/\s+/g, '-');
      } else if (mongoose.Types.ObjectId.isValid(section.subject)) {
        // Subject is ObjectId, fetch it to get slug
        subjectId = section.subject;
        const subjectDoc = await Subject.findById(subjectId).select('slug name').lean();
        if (subjectDoc) {
          subjectSlug = subjectDoc.slug || subjectDoc.name?.toLowerCase().replace(/\s+/g, '-');
        }
      }
    }

    if (!subjectId && !subjectSlug) {
      return res.status(400).json({
        success: false,
        message: 'Section does not have an associated subject'
      });
    }

    // Build query to match lessons by subject
    // Lessons store subject as slug string, so we need to match by slug
    const subjectQuery = [];
    
    if (subjectSlug) {
      subjectQuery.push({ subject: subjectSlug });
      subjectQuery.push({ subject: subjectSlug.toLowerCase() });
    }
    
    // Also try matching by ObjectId if available (for backward compatibility)
    if (subjectId) {
      subjectQuery.push({ subject: subjectId.toString() });
    }

    if (subjectQuery.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine subject identifier for lessons'
      });
    }

    // Get lessons by subject (since Lesson model doesn't have section field)
    // Only show visible lessons
    const lessons = await Lesson.find({ 
      $or: subjectQuery,
      isVisible: true 
    })
      .select('title description content subject chapter order difficulty duration videoUrl isPremium slug _id')
      .sort({ order: 1, chapter: 1 })
      .lean();

    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== GET LESSONS BY SECTION ===');
      console.log('Section ID:', req.params.id);
      console.log('Section name:', section.name);
      console.log('Subject ID:', subjectId);
      console.log('Subject slug:', subjectSlug);
      console.log('Lessons found:', lessons.length);
    }

    res.status(200).json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getLessonsBySection", error.stack || error);
    
    // Handle CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid section ID format',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching lessons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single lesson (public)
// @route   GET /api/lessons/:id
// @access  Public (premium content may require auth)
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('createdBy', 'name')
      .lean();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check if lesson is visible
    if (!lesson.isVisible) {
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

