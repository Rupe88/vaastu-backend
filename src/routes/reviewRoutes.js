import express from 'express';
import {
  createReview,
  getCourseReviews,
  getUserReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Public routes
router.get(
  '/course/:courseId',
  [
    param('courseId').isUUID().withMessage('Invalid course ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  getCourseReviews
);

// Authenticated routes
router.post(
  '/course/:courseId',
  authenticate,
  [
    param('courseId').isUUID().withMessage('Invalid course ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ max: 1000 }),
  ],
  createReview
);

router.get(
  '/course/:courseId/my-review',
  authenticate,
  [param('courseId').isUUID().withMessage('Invalid course ID')],
  getUserReview
);

router.delete(
  '/course/:courseId',
  authenticate,
  [param('courseId').isUUID().withMessage('Invalid course ID')],
  deleteReview
);

export default router;
