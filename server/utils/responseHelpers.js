/**
 * Centralized response helper utilities for consistent API responses
 */

/**
 * Send success response
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send error response
 */
const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send validation error response
 */
const sendValidationError = (res, errors, message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send not found response
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send unauthorized response
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send forbidden response
 */
const sendForbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send paginated response
 */
const sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page * pagination.limit < pagination.total,
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Extract pagination parameters from request
 */
const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create pagination object for response
 */
const createPagination = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

/**
 * Format validation errors from express-validator
 */
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.path,
    message: error.msg,
    value: error.value
  }));
};

/**
 * Safe JSON parse with fallback
 */
const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return fallback;
  }
};

/**
 * Generate random string for tokens/IDs
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize filename for safe file operations
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Calculate query execution time
 */
const measureQueryTime = () => {
  const start = Date.now();
  return () => Date.now() - start;
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendPaginated,
  getPaginationParams,
  createPagination,
  formatValidationErrors,
  safeJsonParse,
  generateRandomString,
  sanitizeFilename,
  measureQueryTime
};
