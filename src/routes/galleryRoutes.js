import express from 'express';
import {
  getGallery,
  getGalleryById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../controllers/galleryController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { singleUpload, processImageUpload, processVideoUpload } from '../middleware/cloudinaryUpload.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

// Public routes
router.get(
  '/',
  [
    query('type').optional().isIn(['IMAGE', 'VIDEO']),
    query('category').optional().isString(),
    query('featured').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getGallery
);

router.get(
  '/:id',
  [param('id').isUUID()],
  getGalleryById
);

// Admin routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  singleUpload('file'),
  processImageUpload,
  [
    body('title').notEmpty().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString(),
    body('imageUrl').optional().isString().isURL(),
    body('videoUrl').optional().isString().isURL(),
    body('type').optional().isIn(['IMAGE', 'VIDEO']),
    body('category').optional().trim().isLength({ max: 100 }),
    body('isPublished').optional().isBoolean(),
    body('featured').optional().isBoolean(),
    body('order').optional().isInt(),
  ],
  createGalleryItem
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  singleUpload('file'),
  processImageUpload,
  [
    param('id').isUUID(),
    body('title').optional().trim().isLength({ min: 1, max: 255 }),
    body('description').optional().isString(),
    body('imageUrl').optional().isString().isURL(),
    body('videoUrl').optional().isString().isURL(),
    body('type').optional().isIn(['IMAGE', 'VIDEO']),
    body('category').optional().trim().isLength({ max: 100 }),
    body('isPublished').optional().isBoolean(),
    body('featured').optional().isBoolean(),
    body('order').optional().isInt(),
  ],
  updateGalleryItem
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  [param('id').isUUID()],
  deleteGalleryItem
);

export default router;


