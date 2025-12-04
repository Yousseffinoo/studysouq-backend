import Settings from '../../models/Settings.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Admin
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getSettings", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Admin
export const updateSettings = async (req, res) => {
  try {
    // Get or create settings document
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      // Update existing settings
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          settings[key] = req.body[key];
        }
      });
      await settings.save();
    }

    try {
      await createActivityLog(
        req.user,
        'settings_updated',
        'settings',
        settings._id,
        { action: 'updated', fields: Object.keys(req.body) }
      );
    } catch (logError) {
      console.error("ERROR ORIGIN: createActivityLog in updateSettings", logError);
      // Continue even if activity log fails
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updateSettings", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message,
        errors: error.errors 
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

