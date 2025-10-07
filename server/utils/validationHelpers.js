/**
 * Centralized validation helper utilities
 */

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic international format)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate extension number
 */
const isValidExtension = (extension) => {
  const extRegex = /^\d{3,6}$/;
  return extRegex.test(extension);
};

/**
 * Validate employee code format
 */
const isValidEmployeeCode = (code) => {
  const codeRegex = /^[A-Z]{2,4}\d{3,6}$/;
  return codeRegex.test(code);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate ObjectId format
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate date format
 */
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate date range
 */
const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }
  return startDate <= endDate;
};

/**
 * Validate role format
 */
const isValidRole = (role) => {
  const validRoles = ['admin', 'hr', 'manager', 'employee'];
  return validRoles.includes(role.toLowerCase());
};

/**
 * Validate department name
 */
const isValidDepartmentName = (name) => {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 50;
};

/**
 * Validate employee name format
 */
const isValidEmployeeName = (name) => {
  const nameRegex = /^[a-zA-Z\s\u0600-\u06FF]{2,50}$/; // Supports English and Arabic
  return nameRegex.test(name.trim());
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate file extension
 */
const isValidFileExtension = (filename, allowedExtensions = []) => {
  if (!filename || !Array.isArray(allowedExtensions)) return false;
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * Validate file size
 */
const isValidFileSize = (size, maxSizeInMB = 5) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
};

/**
 * Validate pagination parameters
 */
const isValidPagination = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  return !isNaN(pageNum) && pageNum >= 1 && 
         !isNaN(limitNum) && limitNum >= 1 && limitNum <= 100;
};

/**
 * Validate search query
 */
const isValidSearchQuery = (query) => {
  return typeof query === 'string' && query.trim().length >= 1 && query.trim().length <= 100;
};

/**
 * Validate sort parameters
 */
const isValidSortField = (field, allowedFields = []) => {
  return allowedFields.includes(field);
};

/**
 * Validate sort order
 */
const isValidSortOrder = (order) => {
  return ['asc', 'desc'].includes(order.toLowerCase());
};

/**
 * Validate boolean parameter
 */
const isValidBoolean = (value) => {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    return ['true', 'false', '1', '0'].includes(value.toLowerCase());
  }
  return false;
};

/**
 * Convert string to boolean
 */
const stringToBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1'].includes(value.toLowerCase());
  }
  return false;
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidExtension,
  isValidEmployeeCode,
  isValidPassword,
  isValidObjectId,
  isValidDate,
  isValidDateRange,
  isValidRole,
  isValidDepartmentName,
  isValidEmployeeName,
  sanitizeString,
  isValidFileExtension,
  isValidFileSize,
  isValidPagination,
  isValidSearchQuery,
  isValidSortField,
  isValidSortOrder,
  isValidBoolean,
  stringToBoolean
};
