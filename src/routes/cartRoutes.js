import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post(
  '/items',
  [
    body('productId').isUUID().withMessage('Valid product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  ],
  validate,
  addToCart
);

// Update cart item quantity
router.put(
  '/items/:itemId',
  [
    param('itemId').isUUID(),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  ],
  validate,
  updateCartItem
);

// Remove item from cart
router.delete(
  '/items/:itemId',
  [param('itemId').isUUID()],
  removeFromCart
);

// Clear cart
router.delete('/', clearCart);

export default router;

