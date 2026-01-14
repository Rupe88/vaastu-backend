import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { query } from 'express-validator';

const router = express.Router();

// Admin only routes
router.get(
  '/',
  authenticate,
  requireAdmin,
  [
    query('userId').optional().isUUID().withMessage('Invalid user ID format'),
    query('action').optional().trim(),
    query('entityType').optional().trim(),
    query('entityId').optional().trim(),
    query('flagged').optional().isBoolean().toBoolean(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  getAuditLogs
);

export default router;
