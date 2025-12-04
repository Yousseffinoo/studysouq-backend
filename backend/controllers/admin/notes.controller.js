import Note from '../../models/Note.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all notes
// @route   GET /api/admin/notes
// @access  Admin
export const getAllNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subject = '', type = '', lessonId = '' } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subject) query.subject = subject;
    if (type) query.type = type;
    if (lessonId) query.lesson = lessonId;

    const notes = await Note.find(query)
      .populate('createdBy', 'name email')
      .populate('lesson', 'title')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notes,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllNotes", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single note
// @route   GET /api/admin/notes/:id
// @access  Admin
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lesson', 'title');
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getNoteById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new note
// @route   POST /api/admin/notes
// @access  Admin
export const createNote = async (req, res) => {
  try {
    const noteData = {
      ...req.body,
      createdBy: req.user._id
    };

    const note = await Note.create(noteData);

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'note_created',
        'note',
        note._id,
        { title: note.title }
      );
    } catch (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in createNote:', logError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    console.error("ERROR ORIGIN: createNote", error.stack || error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: errors.length > 0 ? errors : [error.message]
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate field value entered.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update note
// @route   PUT /api/admin/notes/:id
// @access  Admin
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await createActivityLog(
      req.user,
      'note_updated',
      'note',
      note._id,
      { title: note.title }
    );

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updateNote", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/admin/notes/:id
// @access  Admin
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.deleteOne();

    await createActivityLog(
      req.user,
      'note_deleted',
      'note',
      note._id,
      { title: note.title }
    );

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deleteNote", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

