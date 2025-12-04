import Note from '../../models/Note.js';
import { protect } from '../../middleware/auth.js';

// @desc    Get all notes (public - premium filtering handled)
// @route   GET /api/notes
// @access  Public (premium content may require auth)
export const getNotes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      subject = '', 
      class: classFilter = '',
      lesson = ''
    } = req.query;

    const query = { isVisible: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subject) query.subject = subject;
    if (classFilter) query.class = classFilter;
    if (lesson) query.lesson = lesson;

    // Check if user is authenticated and premium
    const user = req.user; // From protect middleware if present
    const isPremium = user?.isPremium || false;

    // If not premium, only show non-premium notes
    if (!isPremium) {
      query.isPremium = false;
    }

    const notes = await Note.find(query)
      .populate('lesson', 'title')
      .select('title content summary subject class chapter type tags images isPremium slug')
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
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getNotes", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single note (public - premium check)
// @route   GET /api/notes/:id
// @access  Public (premium content requires auth)
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('lesson', 'title')
      .populate('createdBy', 'name')
      .lean();

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if note is visible
    if (!note.isVisible) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check premium access
    const user = req.user; // From protect middleware if present
    const isPremium = user?.isPremium || false;

    if (note.isPremium && !isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Premium content requires subscription'
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

