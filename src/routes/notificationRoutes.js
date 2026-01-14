import express from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotifications,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.get(
  '/me',
  [
    query('isRead').optional().isBoolean(),
    query('type').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getMyNotifications
);

router.get('/me/unread-count', getUnreadCount);

router.post('/:id/read', [param('id').isUUID()], markAsRead);

router.post('/mark-all-read', markAllAsRead);

router.delete('/:id', [param('id').isUUID()], deleteNotification);

// Admin routes
router.post(
  '/',
  requireAdmin,
  [
    body('userId').isUUID().withMessage('Valid user ID is required'),
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('message').notEmpty().trim().withMessage('Message is required'),
    body('type').optional().isIn(['INFO', 'SUCCESS', 'WARNING', 'ERROR']),
    body('link').optional().isString(),
  ],
  validate,
  createNotification
);

router.post(
  '/bulk',
  requireAdmin,
  [
    body('userIds').isArray().withMessage('User IDs array is required'),
    body('userIds.*').isUUID(),
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('message').notEmpty().trim().withMessage('Message is required'),
    body('type').optional().isIn(['INFO', 'SUCCESS', 'WARNING', 'ERROR']),
    body('link').optional().isString(),
  ],
  validate,
  createBulkNotifications
);

export default router;

