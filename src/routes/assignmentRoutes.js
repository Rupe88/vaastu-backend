import express from 'express';
import {
  getCourseAssignments,
  getAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// User routes
router.get(
  '/course/:courseId',
  authenticate,
  [param('courseId').isUUID().withMessage('Invalid course ID')],
  getCourseAssignments
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid assignment ID')],
  getAssignment
);

router.post(
  '/:id/submit',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    body('content').notEmpty().trim().withMessage('Content is required'),
    body('fileUrl').optional().isURL().withMessage('Invalid file URL'),
  ],
  submitAssignment
);

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('courseId').isUUID().withMessage('Invalid course ID'),
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
    body('maxScore').optional().isInt({ min: 1 }).withMessage('Max score must be a positive integer'),
  ],
  createAssignment
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601(),
    body('maxScore').optional().isInt({ min: 1 }),
  ],
  updateAssignment
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID().withMessage('Invalid assignment ID')],
  deleteAssignment
);

router.get(
  '/:id/submissions',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID().withMessage('Invalid assignment ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  getSubmissions
);

router.post(
  '/submissions/:submissionId/grade',
  authenticate,
  requireAdmin,
  [
    param('submissionId').isUUID().withMessage('Invalid submission ID'),
    body('score').isInt({ min: 0 }).withMessage('Score must be a non-negative integer'),
    body('feedback').optional().trim().isLength({ max: 2000 }),
  ],
  gradeSubmission
);

export default router;
