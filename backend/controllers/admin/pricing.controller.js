import Pricing from '../../models/Pricing.js';
import { createActivityLog } from '../../utils/activityLogHelper.js';

// @desc    Get all pricing plans
// @route   GET /api/admin/pricing
// @access  Admin
export const getAllPricingPlans = async (req, res) => {
  try {
    const plans = await Pricing.find().sort('displayOrder').lean();

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getAllPricingPlans", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single pricing plan
// @route   GET /api/admin/pricing/:id
// @access  Admin
export const getPricingPlanById = async (req, res) => {
  try {
    const plan = await Pricing.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error("ERROR ORIGIN: getPricingPlanById", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create pricing plan
// @route   POST /api/admin/pricing
// @access  Admin
export const createPricingPlan = async (req, res) => {
  try {
    const plan = await Pricing.create(req.body);

    try {
      await createActivityLog(
        req.user,
        'pricing_updated',
        'pricing',
        plan._id,
        { name: plan.name, action: 'created' }
      );
    } catch (logError) {
      console.error("ERROR ORIGIN: createActivityLog in createPricingPlan", logError);
      // Continue even if activity log fails
    }

    res.status(201).json({
      success: true,
      message: 'Pricing plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error("ERROR ORIGIN: createPricingPlan", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: error.message,
        errors: error.errors 
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating pricing plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update pricing plan
// @route   PUT /api/admin/pricing/:id
// @access  Admin
export const updatePricingPlan = async (req, res) => {
  try {
    const plan = await Pricing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    try {
      await createActivityLog(
        req.user,
        'pricing_updated',
        'pricing',
        plan._id,
        { name: plan.name, action: 'updated' }
      );
    } catch (logError) {
      console.error("ERROR ORIGIN: createActivityLog in updatePricingPlan", logError);
      // Continue even if activity log fails
    }

    res.status(200).json({
      success: true,
      message: 'Pricing plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updatePricingPlan", error.stack || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating pricing plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete pricing plan
// @route   DELETE /api/admin/pricing/:id
// @access  Admin
export const deletePricingPlan = async (req, res) => {
  try {
    const plan = await Pricing.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Pricing plan not found'
      });
    }

    await plan.deleteOne();

    try {
      await createActivityLog(
        req.user,
        'pricing_updated',
        'pricing',
        plan._id,
        { name: plan.name, action: 'deleted' }
      );
    } catch (logError) {
      console.error("ERROR ORIGIN: createActivityLog in deletePricingPlan", logError);
      // Continue even if activity log fails
    }

    res.status(200).json({
      success: true,
      message: 'Pricing plan deleted successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: deletePricingPlan", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pricing plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update payment gateway config
// @route   PUT /api/admin/pricing/payment-config
// @access  Admin
export const updatePaymentConfig = async (req, res) => {
  try {
    const { paymobApiKey, paymobIntegrationId, paymobIframeId } = req.body;

    // Store in environment or database (for now just log)
    // In production, securely store these in environment variables

    await createActivityLog(
      req.user,
      'settings_updated',
      'settings',
      null,
      { setting: 'payment_config' }
    );

    res.status(200).json({
      success: true,
      message: 'Payment configuration updated successfully'
    });
  } catch (error) {
    console.error("ERROR ORIGIN: updatePaymentConfig", error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Error updating payment configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

