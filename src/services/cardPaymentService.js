import { config } from '../config/env.js';
import crypto from 'crypto';

/**
 * Card Payment Service
 * Handles Visa/Mastercard payments via Khalti (Recommended for Nepal) or Razorpay
 */

/**
 * Create Khalti payment (Recommended for Nepal - Supports Visa/Mastercard)
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} Payment details
 */
export const createKhaltiPayment = async (params) => {
  const { amount, purchaseOrderId, purchaseOrderName, returnUrl } = params;

  if (!config.khalti.secretKey || !config.khalti.publicKey) {
    throw new Error('Khalti is not configured');
  }

  try {
    // Khalti API endpoint
    const khaltiUrl = 'https://khalti.com/api/v2/payment/initiate/';

    const response = await fetch(khaltiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.khalti.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: returnUrl,
        website_url: config.frontendUrl,
        amount: Math.round(parseFloat(amount) * 100), // Convert to paisa
        purchase_order_id: purchaseOrderId,
        purchase_order_name: purchaseOrderName,
      }),
    });

    const data = await response.json();

    if (data.pidx) {
      return {
        success: true,
        pidx: data.pidx,
        paymentUrl: data.payment_url,
        amount: amount,
        expiresAt: data.expires_at,
      };
    }

    throw new Error(data.detail || 'Khalti payment creation failed');
  } catch (error) {
    throw new Error(`Khalti payment creation failed: ${error.message}`);
  }
};

/**
 * Verify Khalti payment
 * @param {string} pidx - Payment ID from Khalti
 * @returns {Promise<Object>} Verification result
 */
export const verifyKhaltiPayment = async (pidx) => {
  if (!config.khalti.secretKey) {
    throw new Error('Khalti is not configured');
  }

  try {
    const khaltiVerifyUrl = 'https://khalti.com/api/v2/payment/verify/';

    const response = await fetch(khaltiVerifyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.khalti.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });

    const data = await response.json();

    return {
      success: data.status === 'Completed',
      status: data.status,
      amount: data.total_amount / 100, // Convert from paisa
      transactionId: data.idx,
      pidx: data.pidx,
      paymentDetails: data,
    };
  } catch (error) {
    return {
      success: false,
      status: 'ERROR',
      message: error.message,
    };
  }
};

/**
 * Create Razorpay order
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} Order details
 */
export const createRazorpayOrder = async (params) => {
  const { amount, currency = 'INR', receipt, notes = {} } = params;

  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new Error('Razorpay is not configured');
  }

  try {
    const Razorpay = (await import('razorpay')).default;

    const razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(amount) * 100), // Convert to paisa
      currency: currency.toUpperCase(),
      receipt: receipt || `receipt_${Date.now()}`,
      notes,
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      status: order.status,
    };
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment
 * @param {string} orderId - Order ID
 * @param {string} paymentId - Payment ID
 * @param {string} signature - Payment signature
 * @returns {Promise<Object>} Verification result
 */
export const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  if (!config.razorpay.keySecret) {
    throw new Error('Razorpay is not configured');
  }

  try {
    const crypto = await import('crypto');

    // Generate expected signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(text)
      .digest('hex');

    // Verify signature
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    return {
      success: isValid,
      orderId,
      paymentId,
      signatureValid: isValid,
    };
  } catch (error) {
    return {
      success: false,
      status: 'ERROR',
      message: error.message,
    };
  }
};

/**
 * Get available payment gateways
 * @returns {Array} Available gateways
 */
export const getAvailableGateways = () => {
  const gateways = [];

  if (config.khalti.secretKey && config.khalti.publicKey) {
    gateways.push({
      id: 'khalti',
      name: 'Khalti',
      supportsCards: true,
      supportsMobile: true,
      currencies: ['NPR'],
    });
  }

  if (config.razorpay.keyId && config.razorpay.keySecret) {
    gateways.push({
      id: 'razorpay',
      name: 'Razorpay',
      supportsCards: true,
      currencies: ['INR', 'USD'],
    });
  }

  return gateways;
};

export default {
  createKhaltiPayment,
  verifyKhaltiPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getAvailableGateways,
};
