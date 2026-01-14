import express from 'express';
import {
  submitContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// Public route
router.post(
  '/',
  [
    body('name').notEmpty().trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().isLength({ max: 50 }),
    body('subject').optional().trim().isLength({ max: 255 }),
    body('message').notEmpty().isString().withMessage('Message is required'),
  ],
  validate,
  submitContact
);

// Admin routes
router.get(
  '/',
  authenticate,
  requireAdmin,
  [
    query('status').optional().isIn(['PENDING', 'READ', 'REPLIED']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAllContacts
);

router.get(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID()],
  validate,
  getContactById
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID(),
    body('status').isIn(['PENDING', 'READ', 'REPLIED']).withMessage('Invalid status'),
  ],
  validate,
  updateContact
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID()],
  validate,
  deleteContact
);

export default router;

