import { validationResult } from 'express-validator';
import * as expenseService from '../services/expenseService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Create expense
 */
export const createExpense = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const userId = req.user.id;
  const expense = await expenseService.createExpense(req.body, userId);

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: expense,
  });
});

/**
 * Get expenses with filters
 */
export const getExpenses = asyncHandler(async (req, res) => {
  const {
    category,
    status,
    instructorId,
    courseId,
    startDate,
    endDate,
    page,
    limit,
    search,
  } = req.query;

  const filters = {
    category,
    status,
    instructorId,
    courseId,
    startDate,
    endDate,
    page: page || 1,
    limit: limit || 10,
    search,
  };

  const result = await expenseService.getExpenses(filters);

  res.json({
    success: true,
    data: result.expenses,
    pagination: result.pagination,
  });
});

/**
 * Get expense by ID
 */
export const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await expenseService.getExpenseById(id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found',
    });
  }

  res.json({
    success: true,
    data: expense,
  });
});

/**
 * Update expense
 */
export const updateExpense = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { id } = req.params;

  const expense = await expenseService.updateExpense(id, req.body);

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: expense,
  });
});

/**
 * Delete expense
 */
export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await expenseService.deleteExpense(id);

  res.json({
    success: true,
    message: 'Expense deleted successfully',
  });
});

/**
 * Approve expense
 */
export const approveExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const expense = await expenseService.approveExpense(id, userId);

    res.json({
      success: true,
      message: 'Expense approved successfully',
      data: expense,
    });
  } catch (error) {
    if (
      error.message === 'Expense not found' ||
      error.message === 'Expense is already approved' ||
      error.message === 'Cannot approve a rejected expense'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    throw error;
  }
});

/**
 * Reject expense
 */
export const rejectExpense = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  try {
    const expense = await expenseService.rejectExpense(id, userId, reason);

    res.json({
      success: true,
      message: 'Expense rejected successfully',
      data: expense,
    });
  } catch (error) {
    if (
      error.message === 'Expense not found' ||
      error.message === 'Expense is already rejected' ||
      error.message === 'Cannot reject a paid expense'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    throw error;
  }
});

/**
 * Mark expense as paid
 */
export const markExpenseAsPaid = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  const { paymentDate, paymentMethod, receiptUrl } = req.body;

  try {
    const expense = await expenseService.markExpenseAsPaid(id, {
      paymentDate,
      paymentMethod,
      receiptUrl,
    });

    res.json({
      success: true,
      message: 'Expense marked as paid successfully',
      data: expense,
    });
  } catch (error) {
    if (
      error.message === 'Expense not found' ||
      error.message === 'Expense must be approved before marking as paid' ||
      error.message === 'Expense is already marked as paid'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    throw error;
  }
});

/**
 * Get expense statistics
 */
export const getExpenseStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filters = {
    startDate,
    endDate,
  };

  const statistics = await expenseService.getExpenseStatistics(filters);

  res.json({
    success: true,
    data: statistics,
  });
});

