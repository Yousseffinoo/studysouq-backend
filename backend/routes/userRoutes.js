import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import {
  updateProfileValidation,
  changePasswordValidation,
  validate
} from '../middleware/validator.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validate, updateProfile);
router.put('/change-password', changePasswordValidation, validate, changePassword);
router.delete('/account', deleteAccount);

export default router;

