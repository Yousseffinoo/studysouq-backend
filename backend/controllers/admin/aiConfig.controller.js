import AIConfig from '../../models/AIConfig.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all AI configurations
// @route   GET /api/admin/ai-config
// @access  Admin
export const getAllAIConfigs = async (req, res) => {
  try {
    const configs = await AIConfig.find().select('+apiKey');

    res.status(200).json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllAIConfigs", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI configurations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single AI configuration
// @route   GET /api/admin/ai-config/:provider
// @access  Admin
export const getAIConfigByProvider = async (req, res) => {
  try {
    const config = await AIConfig.findOne({ provider: req.params.provider }).select('+apiKey');
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAIConfigByProvider", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create or update AI configuration
// @route   POST /api/admin/ai-config
// @access  Admin
export const upsertAIConfig = async (req, res) => {
  try {
    const { provider, displayName, apiKey, model, availableModels, isEnabled, isDefault, maxTokens, temperature, systemPrompt, config } = req.body;

    let aiConfig = await AIConfig.findOne({ provider });

    if (aiConfig) {
      // Update existing
      aiConfig.displayName = displayName || aiConfig.displayName;
      aiConfig.apiKey = apiKey || aiConfig.apiKey;
      aiConfig.model = model || aiConfig.model;
      aiConfig.availableModels = availableModels || aiConfig.availableModels;
      aiConfig.isEnabled = isEnabled !== undefined ? isEnabled : aiConfig.isEnabled;
      aiConfig.isDefault = isDefault !== undefined ? isDefault : aiConfig.isDefault;
      aiConfig.maxTokens = maxTokens || aiConfig.maxTokens;
      aiConfig.temperature = temperature !== undefined ? temperature : aiConfig.temperature;
      aiConfig.systemPrompt = systemPrompt || aiConfig.systemPrompt;
      aiConfig.config = config || aiConfig.config;
      aiConfig.updatedBy = req.user._id;
      
      await aiConfig.save();
    } else {
      // Create new
      aiConfig = await AIConfig.create({
        provider,
        displayName,
        apiKey,
        model,
        availableModels,
        isEnabled,
        isDefault,
        maxTokens,
        temperature,
        systemPrompt,
        config,
        updatedBy: req.user._id
      });
    }

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'ai_config_updated',
        'ai_config',
        aiConfig._id,
        { provider, isEnabled, isDefault }
      );
    } catch (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in upsertAIConfig:', logError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'AI configuration saved successfully',
      data: aiConfig
    });
  } catch (error) {
    console.error("ERROR ORIGIN: upsertAIConfig", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error saving AI configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete AI configuration
// @route   DELETE /api/admin/ai-config/:provider
// @access  Admin
export const deleteAIConfig = async (req, res) => {
  try {
    const config = await AIConfig.findOne({ provider: req.params.provider });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }

    await config.deleteOne();

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'ai_config_updated',
        'ai_config',
        config._id,
        { provider: config.provider, action: 'deleted' }
      );
    } catch (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in deleteAIConfig:', logError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'AI configuration deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deleteAIConfig", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting AI configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle AI provider enabled/disabled
// @route   PATCH /api/admin/ai-config/:provider/toggle
// @access  Admin
export const toggleAIProvider = async (req, res) => {
  try {
    const config = await AIConfig.findOne({ provider: req.params.provider });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }

    config.isEnabled = !config.isEnabled;
    config.updatedBy = req.user._id;
    await config.save();

    // Create activity log (non-blocking) - wrapped in try/catch to never break workflow
    try {
      await createActivityLog(
        req.user,
        'ai_config_updated',
        'ai_config',
        config._id,
        { provider: config.provider, isEnabled: config.isEnabled }
      );
    } catch (logError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('ActivityLog error in toggleAIProvider:', logError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `AI provider ${config.isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: config
    });
  } catch (error) {
    console.error("ERROR ORIGIN: toggleAIProvider", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error toggling AI provider',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Set default AI provider
// @route   PATCH /api/admin/ai-config/:provider/set-default
// @access  Admin
export const setDefaultAIProvider = async (req, res) => {
  try {
    const config = await AIConfig.findOne({ provider: req.params.provider });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }

    config.isDefault = true;
    config.updatedBy = req.user._id;
    await config.save();

    res.status(200).json({
      success: true,
      message: 'Default AI provider set successfully',
      data: config
    });
  } catch (error) {
    console.error("ERROR ORIGIN: setDefaultAIProvider", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error setting default AI provider',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

