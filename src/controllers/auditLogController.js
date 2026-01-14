import { validationResult } from 'express-validator';
import * as auditLogService from '../services/auditLogService.js';

/**
 * Get audit logs (Admin)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      userId = null,
      action = null,
      entityType = null,
      entityId = null,
      flagged = null,
      startDate = null,
      endDate = null,
      page = 1,
      limit = 50,
    } = req.query;

    const result = await auditLogService.getAuditLogs({
      userId,
      action,
      entityType,
      entityId,
      flagged: flagged === 'true' ? true : flagged === 'false' ? false : null,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
