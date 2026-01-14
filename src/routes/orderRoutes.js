import express from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all orders
router.get(
  '/',
  [
    query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    query('userId').optional().isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  getAllOrders
);

// Get order by ID
router.get(
  '/:id',
  [param('id').isUUID()],
  getOrderById
);

// Create order from cart
router.post(
  '/',
  [
    body('shippingAddress').isObject().withMessage('Shipping address is required'),
    body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
    body('shippingAddress.address').notEmpty().withMessage('Address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
    body('billingAddress').optional().isObject(),
    body('couponCode').optional().isString().trim(),
  ],
  validate,
  createOrder
);

// Cancel order
router.post(
  '/:id/cancel',
  [param('id').isUUID()],
  cancelOrder
);

// Update order status (Admin only)
router.put(
  '/:id/status',
  requireAdmin,
  [
    param('id').isUUID(),
    body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    body('trackingNumber').optional().isString().trim(),
  ],
  validate,
  updateOrderStatus
);

export default router;

