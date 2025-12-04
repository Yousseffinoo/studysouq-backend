import Section from '../../models/Section.js';
import Subject from '../../models/Subject.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all sections
// @route   GET /api/admin/sections
// @access  Admin
export const getAllSections = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', subjectId = '', status = '' } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (subjectId) query.subject = subjectId;
    if (status !== '') {
      query.isActive = status === 'active' || status === 'true';
    }

    const sections = await Section.find(query)
      .populate('subject', 'name level')
      .sort('order')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Transform sections to match frontend expectations
    const transformedSections = sections.map(section => ({
      ...section,
      sectionName: section.name,
      subjectName: section.subject?.name || '',
      subjectId: section.subject?._id?.toString() || section.subject?.toString() || '',
      status: section.isActive ? 'active' : 'inactive'
    }));

    const count = await Section.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        sections: transformedSections,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllSections", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sections',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single section
// @route   GET /api/admin/sections/:id
// @access  Admin
export const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('subject', 'name level')
      .lean();
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Transform to match frontend expectations
    const transformedSection = {
      ...section,
      sectionName: section.name,
      subjectName: section.subject?.name || '',
      subjectId: section.subject?._id?.toString() || section.subject?.toString() || '',
      status: section.isActive ? 'active' : 'inactive'
    };

    res.status(200).json({
      success: true,
      data: transformedSection
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getSectionById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new section
// @route   POST /api/admin/sections
// @access  Admin
export const createSection = async (req, res) => {
  try {
    // Accept both 'name' and 'sectionName' for frontend compatibility
    const { name, sectionName, description, subject, subjectId, order, isActive, isPremium, status } = req.body;
    const sectionNameValue = name || sectionName;

    // Use subjectId if provided, otherwise use subject
    const subjectIdValue = subjectId || subject;
    
    // Validate subject exists
    const subjectDoc = await Subject.findById(subjectIdValue);
    if (!subjectDoc) {
      return res.status(400).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Generate slug from name
    const slug = sectionNameValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Determine isActive from status or isActive
    const isActiveValue = status !== undefined 
      ? (status === 'active' || status === true)
      : (isActive !== undefined ? (isActive === 'active' || isActive === true) : true);

    const section = await Section.create({
      name: sectionNameValue,
      slug,
      description: description || '',
      subject: subjectIdValue,
      order: order || 0,
      isActive: isActiveValue,
      isPremium: isPremium || false
    });

    await createActivityLog(
      req.user,
      'section_created',
      'section',
      section._id,
      { name: section.name, subject: subjectDoc.name }
    );

    const populatedSection = await Section.findById(section._id)
      .populate('subject', 'name level')
      .lean();

    // Transform to match frontend expectations
    const transformedSection = {
      ...populatedSection,
      sectionName: populatedSection.name,
      subjectName: populatedSection.subject?.name || '',
      subjectId: populatedSection.subject?._id?.toString() || populatedSection.subject?.toString() || '',
      status: populatedSection.isActive ? 'active' : 'inactive'
    };

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: transformedSection
    });
  } catch (error) {
    console.error("ERROR ORIGIN: createSection", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate field value entered.' });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update section
// @route   PUT /api/admin/sections/:id
// @access  Admin
export const updateSection = async (req, res) => {
  try {
    // Accept both 'name' and 'sectionName' for frontend compatibility
    const { name, sectionName, description, subject, subjectId, order, isActive, isPremium, status } = req.body;
    const sectionNameValue = name || sectionName;

    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Use subjectId if provided, otherwise use subject
    const subjectIdValue = subjectId || subject;
    
    // If subject is being updated, validate it exists
    if (subjectIdValue && subjectIdValue !== section.subject.toString()) {
      const subjectDoc = await Subject.findById(subjectIdValue);
      if (!subjectDoc) {
        return res.status(400).json({
          success: false,
          message: 'Subject not found'
        });
      }
      section.subject = subjectIdValue;
    }

    // If name is being updated, regenerate slug
    if (sectionNameValue && sectionNameValue !== section.name) {
      const newSlug = sectionNameValue.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      section.slug = newSlug;
      section.name = sectionNameValue;
    }

    if (description !== undefined) section.description = description;
    if (order !== undefined) section.order = order;
    
    // Handle status or isActive
    if (status !== undefined) {
      section.isActive = status === 'active' || status === true;
    } else if (typeof isActive !== 'undefined') {
      section.isActive = isActive === 'active' || isActive === true;
    }
    
    if (typeof isPremium !== 'undefined') section.isPremium = isPremium;

    await section.save();

    await createActivityLog(
      req.user,
      'section_updated',
      'section',
      section._id,
      { name: section.name }
    );

    const populatedSection = await Section.findById(section._id)
      .populate('subject', 'name level')
      .lean();

    // Transform to match frontend expectations
    const transformedSection = {
      ...populatedSection,
      sectionName: populatedSection.name,
      subjectName: populatedSection.subject?.name || '',
      subjectId: populatedSection.subject?._id?.toString() || populatedSection.subject?.toString() || '',
      status: populatedSection.isActive ? 'active' : 'inactive'
    };

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: transformedSection
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updateSection", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete section
// @route   DELETE /api/admin/sections/:id
// @access  Admin
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    await section.deleteOne();

    await createActivityLog(
      req.user,
      'section_deleted',
      'section',
      section._id,
      { name: section.name }
    );

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deleteSection", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

