import express from 'express';
import {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { singleUpload, processImageUpload } from '../middleware/cloudinaryUpload.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Public routes
router.get(
  '/',
  [
    query('featured').optional().isBoolean(),
    query('courseId').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getTestimonials
);

router.get(
  '/:id',
  [param('id').isUUID()],
  getTestimonialById
);

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  singleUpload('image'),
  processImageUpload,
  [
    body('name').notEmpty().trim().isLength({ min: 1, max: 255 }),
    body('image').optional().isString().isURL(),
    body('designation').optional().trim().isLength({ max: 255 }),
    body('company').optional().trim().isLength({ max: 255 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').notEmpty().isString(),
    body('courseId').optional().isUUID(),
    body('isPublished').optional().isBoolean(),
    body('featured').optional().isBoolean(),
    body('order').optional().isInt(),
  ],
  createTestimonial
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  singleUpload('image'),
  processImageUpload,
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('image').optional().isString().isURL(),
    body('designation').optional().trim().isLength({ max: 255 }),
    body('company').optional().trim().isLength({ max: 255 }),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().isString(),
    body('courseId').optional().isUUID(),
    body('isPublished').optional().isBoolean(),
    body('featured').optional().isBoolean(),
    body('order').optional().isInt(),
  ],
  updateTestimonial
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID()],
  deleteTestimonial
);

export default router;


