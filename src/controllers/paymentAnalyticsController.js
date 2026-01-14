import { validationResult } from 'express-validator';
import * as paymentAnalyticsService from '../services/paymentAnalyticsService.js';

/**
 * Get payment analytics (Admin)
 */
export const getPaymentAnalytics = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate = new Date().toISOString(),
      paymentMethod = null,
    } = req.query;

    const analytics = await paymentAnalyticsService.getPaymentAnalytics({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      paymentMethod,
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment trends
 */
export const getPaymentTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const trends = await paymentAnalyticsService.getPaymentTrends(days);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top payment methods
 */
export const getTopPaymentMethods = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const methods = await paymentAnalyticsService.getTopPaymentMethods(limit);

    res.json({
      success: true,
      data: methods,
    });
  } catch (error) {
    next(error);
  }
};
