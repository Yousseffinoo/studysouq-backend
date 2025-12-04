import mongoose from 'mongoose';
import Subject from '../../models/Subject.js';

// @desc    Get all subjects (public)
// @route   GET /api/subjects
// @access  Public
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .select('name description level icon color slug order')
      .sort('order')
      .lean();

    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getSubjects", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single subject (public)
// @route   GET /api/subjects/:id
// @access  Public
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    let subject;

    // Check if id is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      // Try to find by ObjectId first
      subject = await Subject.findById(id)
        .select('name description level icon color slug order _id')
        .lean();
    }

    // If not found by ObjectId or not a valid ObjectId, try to find by slug
    if (!subject) {
      subject = await Subject.findOne({ slug: id, isActive: true })
        .select('name description level icon color slug order _id')
        .lean();
    }

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getSubjectById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

