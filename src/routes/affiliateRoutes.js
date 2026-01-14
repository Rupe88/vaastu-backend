import express from 'express';
import {
  registerAffiliate,
  getMyAffiliate,
  getAllAffiliates,
  updateAffiliateStatus,
  getAffiliateEarnings,
  markEarningsAsPaid,
} from '../controllers/affiliateController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// Authenticated routes
router.use(authenticate);

// Register as affiliate
router.post(
  '/register',
  [
    body('bankName').optional().isString().trim(),
    body('accountNumber').optional().isString().trim(),
    body('ifscCode').optional().isString().trim(),
    body('panNumber').optional().isString().trim(),
    body('commissionRate').optional().isFloat({ min: 0, max: 100 }),
  ],
  validate,
  registerAffiliate
);

// Get my affiliate information
router.get('/me', getMyAffiliate);

// Admin routes
router.get(
  '/',
  requireAdmin,
  [
    query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getAllAffiliates
);

router.put(
  '/:id/status',
  requireAdmin,
  [
    param('id').isUUID(),
    body('status').isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
    body('commissionRate').optional().isFloat({ min: 0, max: 100 }),
  ],
  validate,
  updateAffiliateStatus
);

router.get(
  '/earnings',
  requireAdmin,
  [
    query('affiliateId').optional().isUUID(),
    query('status').optional().isIn(['PENDING', 'PAID']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getAffiliateEarnings
);

router.post(
  '/earnings/mark-paid',
  requireAdmin,
  [
    body('earningIds').isArray().withMessage('Earning IDs array is required'),
    body('earningIds.*').isUUID(),
  ],
  validate,
  markEarningsAsPaid
);

export default router;

