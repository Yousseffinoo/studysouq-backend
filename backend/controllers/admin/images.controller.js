import Image from '../../models/Image.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';
import cloudinary from '../../config/cloudinary.js';

// @desc    Get all images
// @route   GET /api/admin/images
// @access  Admin
export const getAllImages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', category = '', subject = '' } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (subject) query.subject = subject;

    const images = await Image.find(query)
      .populate('uploadedBy', 'name email')
      .populate('approvedBy', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Image.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        images,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllImages", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload image
// @route   POST /api/admin/images
// @access  Admin
export const uploadImage = async (req, res) => {
  try {
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== UPLOAD IMAGE REQUEST ===');
      console.log('User:', req.user?._id, req.user?.email);
      console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
      console.log('Files object:', req.files);
      console.log('Body:', req.body);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Has files:', !!req.files);
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login again.'
      });
    }

    // Check for files - try different possible field names
    let file = null;
    if (req.files) {
      file = req.files.image || req.files.file || req.files.upload || (req.files[Object.keys(req.files)[0]]);
    }

    if (!file) {
      console.error('=== FILE UPLOAD DEBUG ===');
      console.error('req.files:', req.files);
      console.error('req.body:', req.body);
      console.error('Content-Type:', req.headers['content-type']);
      console.error('Request method:', req.method);
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file.',
        debug: process.env.NODE_ENV === 'development' ? {
          hasFiles: !!req.files,
          filesKeys: req.files ? Object.keys(req.files) : [],
          contentType: req.headers['content-type']
        } : undefined
      });
    }

    const { title, description, category, subject, tags } = req.body;

    // Validate file
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Please upload an image file.'
      });
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit. Please upload a smaller image.'
      });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_URL) {
      console.error('⚠️ CLOUDINARY_URL not configured');
      // For development, allow saving without Cloudinary (store base64 or local path)
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Cloudinary not configured. Using base64 storage (not recommended for production)');
        
        // Create image record with base64 data (temporary solution)
        const base64Data = file.data.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
        
        // Extract format from mimetype
        const format = file.mimetype.split('/')[1] || 'unknown';
        
        const image = await Image.create({
          title: title || file.name,
          description: description || '',
          url: dataUrl, // Store as data URL (temporary - for development only)
          publicId: null, // No Cloudinary public ID
          format: format,
          size: file.size || 0,
          category: category || 'other',
          subject: subject || 'general',
          tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
          status: 'approved',
          uploadedBy: req.user._id,
          approvedBy: req.user._id,
          approvedAt: Date.now()
        });

        await createActivityLog(
          req.user,
          'image_uploaded',
          'image',
          image._id,
          { title: image.title }
        );

        return res.status(201).json({
          success: true,
          message: 'Image uploaded successfully (stored locally - Cloudinary not configured)',
          data: image
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Image upload service not configured. Please contact administrator.'
        });
      }
    }

    // Upload to Cloudinary
    let cloudinaryResult;
    try {
      // Convert file buffer to base64
      const base64Data = file.data.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64Data}`;
      
      console.log('📤 Uploading to Cloudinary...', {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.mimetype
      });
      
      cloudinaryResult = await cloudinary.uploader.upload(
        dataUri,
        {
          folder: 'admin_uploads',
          resource_type: 'auto',
          transformation: [
            { width: 2000, height: 2000, crop: 'limit' }
          ]
        }
      );
      
      console.log('☁️ Image uploaded to Cloudinary:', cloudinaryResult.secure_url);
    } catch (uploadError) {
      console.error('❌ Cloudinary upload error:', uploadError);
      console.error('Error details:', {
        message: uploadError.message,
        http_code: uploadError.http_code,
        name: uploadError.name,
        stack: uploadError.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to cloud storage',
        error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined,
        details: process.env.NODE_ENV === 'development' ? {
          http_code: uploadError.http_code,
          name: uploadError.name
        } : undefined
      });
    }

    // Parse tags safely
    let tagsArray = [];
    try {
      if (tags) {
        tagsArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
    } catch (parseError) {
      console.warn('Error parsing tags, using empty array:', parseError);
      tagsArray = [];
    }

    const image = await Image.create({
      title: title || file.name,
      description: description || '',
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id || null,
      format: cloudinaryResult.format || file.mimetype.split('/')[1] || 'unknown',
      size: cloudinaryResult.bytes || file.size || 0,
      category: category || 'other',
      subject: subject || 'general',
      tags: tagsArray,
      status: 'approved', // Auto-approve admin uploads
      uploadedBy: req.user._id,
      approvedBy: req.user._id,
      approvedAt: Date.now()
    });

    await createActivityLog(
      req.user,
      'image_uploaded',
      'image',
      image._id,
      { title: image.title }
    );

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: image
    });
  } catch (error) {
    console.error("ERROR ORIGIN: uploadImage", error);
    console.error("ERROR STACK: uploadImage", error.stack);
    console.error("ERROR DETAILS:", {
      name: error.name,
      message: error.message,
      code: error.code
    });
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code
      } : undefined
    });
  }
};

// @desc    Approve image
// @route   PATCH /api/admin/images/:id/approve
// @access  Admin
export const approveImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    image.status = 'approved';
    image.approvedBy = req.user._id;
    image.approvedAt = Date.now();
    await image.save();

    await createActivityLog(
      req.user,
      'image_approved',
      'image',
      image._id
    );

    res.status(200).json({
      success: true,
      message: 'Image approved successfully',
      data: image
    });
  } catch (error) {
    console.error("ERROR ORIGIN: approveImage", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error approving image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reject image
// @route   PATCH /api/admin/images/:id/reject
// @access  Admin
export const rejectImage = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    image.status = 'rejected';
    image.rejectionReason = reason;
    await image.save();

    await createActivityLog(
      req.user,
      'image_rejected',
      'image',
      image._id,
      { reason }
    );

    res.status(200).json({
      success: true,
      message: 'Image rejected successfully',
      data: image
    });
  } catch (error) {
    console.error("ERROR ORIGIN: rejectImage", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/admin/images/:id
// @access  Admin
export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    try {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
        console.log('☁️ Image deleted from Cloudinary:', image.publicId);
      }
    } catch (deleteError) {
      console.error('⚠️ Error deleting from Cloudinary:', deleteError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    await image.deleteOne();

    await createActivityLog(
      req.user,
      'image_deleted',
      'image',
      image._id
    );

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deleteImage", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
