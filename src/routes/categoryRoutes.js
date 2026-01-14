import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { singleUpload, processImageUpload } from '../middleware/cloudinaryUpload.js';

const router = express.Router();

// Public routes
router.get(
  '/',
  [
    query('type').optional().isString(),
  ],
  getAllCategories
);

router.get(
  '/:id',
  [
    param('id').notEmpty(),
  ],
  getCategoryById
);

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  singleUpload('image'),
  processImageUpload,
  [
    body('name').notEmpty().trim().isLength({ min: 1, max: 255 }),
    body('slug').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString(),
    body('image').optional().isString(),
    body('type').optional().isIn(['COURSE', 'BLOG', 'PRODUCT']),
    body('parentId').optional().isUUID(),
  ],
  createCategory
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  singleUpload('image'),
  processImageUpload,
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('slug').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString(),
    body('image').optional().isString(),
    body('type').optional().isIn(['COURSE', 'BLOG', 'PRODUCT']),
    body('parentId').optional().isUUID(),
  ],
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [
    param('id').isUUID(),
  ],
  deleteCategory
);

export default router;


