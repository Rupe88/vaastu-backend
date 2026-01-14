import express from 'express';
import {
  getUserCertificates,
  issueCertificate,
  verifyCertificate,
  checkEligibility,
} from '../controllers/certificateController.js';
import { authenticate } from '../middleware/auth.js';
import { param } from 'express-validator';

const router = express.Router();

// Public route
router.get(
  '/verify/:certificateId',
  [param('certificateId').notEmpty().withMessage('Certificate ID is required')],
  verifyCertificate
);

// Authenticated routes
router.get(
  '/',
  authenticate,
  getUserCertificates
);

router.get(
  '/course/:courseId/eligibility',
  authenticate,
  [param('courseId').isUUID().withMessage('Invalid course ID')],
  checkEligibility
);

router.post(
  '/course/:courseId/issue',
  authenticate,
  [param('courseId').isUUID().withMessage('Invalid course ID')],
  issueCertificate
);

export default router;
