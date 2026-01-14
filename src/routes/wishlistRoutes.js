import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.get(
  '/',
  authenticate,
  getWishlist
);

router.post(
  '/',
  authenticate,
  [
    body('courseId').optional().isUUID().withMessage('Invalid course ID'),
    body('productId').optional().isUUID().withMessage('Invalid product ID'),
  ],
  validate,
  addToWishlist
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  removeFromWishlist
);

router.delete(
  '/',
  authenticate,
  clearWishlist
);

export default router;

