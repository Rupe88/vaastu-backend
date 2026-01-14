import express from 'express';
import {
  updateLessonProgress,
  getCourseProgress,
} from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.put(
  '/lesson/:lessonId',
  [
    param('lessonId').isUUID(),
    body('isCompleted').optional().isBoolean(),
    body('watchTime').optional().isInt({ min: 0 }),
  ],
  updateLessonProgress
);

router.get(
  '/course/:courseId',
  [param('courseId').isUUID()],
  getCourseProgress
);

export default router;


