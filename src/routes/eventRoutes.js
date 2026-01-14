import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getEventRegistrations,
  markEventAttendance,
} from '../controllers/eventController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get(
  '/',
  [
    query('status').optional().isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
    query('featured').optional().isBoolean(),
    query('upcoming').optional().isBoolean(),
    query('past').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getAllEvents
);

router.get(
  '/:id',
  [param('id').notEmpty()],
  getEventById
);

// Authenticated routes
router.post(
  '/:id/register',
  authenticate,
  [
    param('id').isUUID(),
    body('name').optional().isString().trim(),
    body('email').optional().isEmail(),
    body('phone').optional().isString().trim(),
  ],
  validate,
  registerForEvent
);

// Admin routes
router.get(
  '/:id/registrations',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getEventRegistrations
);

router.post(
  '/:id/attendance/:registrationId',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID(),
    param('registrationId').isUUID(),
  ],
  markEventAttendance
);

router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('title').notEmpty().trim().withMessage('Event title is required'),
    body('slug').notEmpty().trim().withMessage('Event slug is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('description').optional().isString(),
    body('shortDescription').optional().isString().isLength({ max: 500 }),
    body('image').optional().isURL(),
    body('venue').optional().isString(),
    body('location').optional().isString(),
    body('endDate').optional().isISO8601(),
    body('price').optional().isFloat({ min: 0 }),
    body('isFree').optional().isBoolean(),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('featured').optional().isBoolean(),
  ],
  validate,
  createEvent
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID(),
    body('title').optional().notEmpty().trim(),
    body('slug').optional().notEmpty().trim(),
    body('startDate').optional().isISO8601(),
    body('description').optional().isString(),
    body('shortDescription').optional().isString().isLength({ max: 500 }),
    body('image').optional().isURL(),
    body('venue').optional().isString(),
    body('location').optional().isString(),
    body('endDate').optional().isISO8601(),
    body('price').optional().isFloat({ min: 0 }),
    body('isFree').optional().isBoolean(),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('status').optional().isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
    body('featured').optional().isBoolean(),
  ],
  validate,
  updateEvent
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID()],
  deleteEvent
);

export default router;

