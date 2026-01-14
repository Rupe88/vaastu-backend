import express from 'express';
import {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faqController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get(
  '/',
  [
    query('category').optional().isIn(['GENERAL', 'COURSES', 'PAYMENTS', 'ENROLLMENT', 'TECHNICAL', 'OTHER']),
    query('search').optional().isString(),
    query('isActive').optional().isBoolean(),
  ],
  validate,
  getAllFAQs
);

router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  getFAQById
);

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('question').notEmpty().trim().isLength({ min: 1, max: 500 }).withMessage('Question is required (max 500 characters)'),
    body('answer').notEmpty().isString().withMessage('Answer is required'),
    body('category').optional().isIn(['GENERAL', 'COURSES', 'PAYMENTS', 'ENROLLMENT', 'TECHNICAL', 'OTHER']),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  createFAQ
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID(),
    body('question').optional().trim().isLength({ min: 1, max: 500 }),
    body('answer').optional().isString(),
    body('category').optional().isIn(['GENERAL', 'COURSES', 'PAYMENTS', 'ENROLLMENT', 'TECHNICAL', 'OTHER']),
    body('order').optional().isInt({ min: 0 }),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  updateFAQ
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID()],
  validate,
  deleteFAQ
);

export default router;

