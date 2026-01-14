import express from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js';
import {
  getProfile,
  updatePaymentPreference,
} from '../controllers/userController.js';
import {
  registerValidation,
  loginValidation,
  verifyOtpValidation,
  resendOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
  validate,
} from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.post('/verify-otp', validate(verifyOtpValidation), verifyOtp);
router.post('/resend-otp', validate(resendOtpValidation), resendOtp);
router.post('/login', validate(loginValidation), login);
router.post('/refresh-token', validate(refreshTokenValidation), refreshToken);
router.post('/forgot-password', validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// User profile routes
router.get('/profile', authenticate, getProfile);
router.put(
  '/profile/payment-preference',
  authenticate,
  validate([
    body('preferredPaymentMethod')
      .isIn(['ESEWA', 'MOBILE_BANKING', 'VISA_CARD', 'MASTERCARD'])
      .withMessage('Invalid payment method'),
  ]),
  updatePaymentPreference
);

export default router;

