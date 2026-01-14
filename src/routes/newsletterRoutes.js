import express from 'express';
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
} from '../controllers/newsletterController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post(
  '/subscribe',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('name').optional().trim().isLength({ max: 255 }),
  ],
  validate,
  subscribe
);

router.post(
  '/unsubscribe',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  validate,
  unsubscribe
);

// Admin routes
router.get(
  '/subscribers',
  authenticate,
  requireAdmin,
  [
    query('isActive').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAllSubscribers
);

router.delete(
  '/subscribers/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID()],
  validate,
  deleteSubscriber
);

export default router;

