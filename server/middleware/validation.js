const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../config/logger');

// Common validation rules
const commonValidations = {
  // ObjectId validation
  objectId: (field) => param(field).isMongoId().withMessage(`${field} must be a valid MongoDB ObjectId`),
  
  // Email validation
  email: (field = 'email') => body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage(`${field} must be a valid email address`),
  
  // Password validation
  password: (field = 'password', minLength = 6) => body(field)
    .isLength({ min: minLength })
    .withMessage(`${field} must be at least ${minLength} characters long`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(`${field} must contain at least one uppercase letter, one lowercase letter, and one number`),
  
  // Phone number validation
  phone: (field = 'phone') => body(field)
    .optional()
    .isMobilePhone()
    .withMessage(`${field} must be a valid phone number`),
  
  // Name validation
  name: (field = 'name', maxLength = 100) => body(field)
    .trim()
    .isLength({ min: 1, max: maxLength })
    .withMessage(`${field} must be between 1 and ${maxLength} characters`)
    .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
    .withMessage(`${field} must contain only letters and spaces`),
  
  // Username validation
  username: (field = 'username') => body(field)
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage(`${field} must be between 3 and 30 characters`)
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(`${field} can only contain letters, numbers, underscores, and hyphens`),
  
  // Extension validation
  extension: (field = 'extension') => body(field)
    .trim()
    .matches(/^\d{3,6}$/)
    .withMessage(`${field} must be 3-6 digits`),
  
  // Department validation
  department: (field = 'department') => body(field)
    .isMongoId()
    .withMessage(`${field} must be a valid department ID`),
  
  // Role validation
  role: (field = 'role') => body(field)
    .optional()
    .isIn(['admin', 'hr', 'manager', 'employee'])
    .withMessage(`${field} must be one of: admin, hr, manager, employee`),
  
  // Status validation
  status: (field = 'status') => body(field)
    .optional()
    .isIn(['active', 'suspended', 'terminated', 'on_leave'])
    .withMessage(`${field} must be one of: active, suspended, terminated, on_leave`),
  
  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  
  // Search validation
  search: () => query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
  
  // File validation
  file: (field = 'file', maxSize = 5 * 1024 * 1024) => (req, res, next) => {
    if (!req.file) {
      return next();
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }
    
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      });
    }
    
    next();
  }
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    logger.warn('Validation error', {
      method: req.method,
      url: req.originalUrl,
      errors: formattedErrors,
      userId: req.user?.id || req.user?._id || 'anonymous'
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Employee validation schemas
const employeeValidations = {
  create: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email(),
    commonValidations.username(),
    commonValidations.password(),
    commonValidations.extension(),
    commonValidations.department(),
    commonValidations.role(),
    commonValidations.phone(),
    body('position')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Position must be less than 100 characters'),
    body('nationalId')
      .optional()
      .trim()
      .isLength({ min: 10, max: 20 })
      .withMessage('National ID must be between 10 and 20 characters'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.objectId('id'),
    commonValidations.name('firstName').optional(),
    commonValidations.name('lastName').optional(),
    commonValidations.email().optional(),
    commonValidations.username().optional(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    commonValidations.extension().optional(),
    commonValidations.department().optional(),
    commonValidations.role().optional(),
    commonValidations.phone().optional(),
    commonValidations.status().optional(),
    body('position')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Position must be less than 100 characters'),
    handleValidationErrors
  ],
  
  getById: [
    commonValidations.objectId('id'),
    handleValidationErrors
  ],
  
  search: [
    commonValidations.search(),
    commonValidations.pagination(),
    query('department')
      .optional()
      .isMongoId()
      .withMessage('Department must be a valid MongoDB ObjectId'),
    query('role')
      .optional()
      .isIn(['admin', 'hr', 'manager', 'employee'])
      .withMessage('Role must be one of: admin, hr, manager, employee'),
    query('status')
      .optional()
      .isIn(['active', 'suspended', 'terminated', 'on_leave'])
      .withMessage('Status must be one of: active, suspended, terminated, on_leave'),
    handleValidationErrors
  ]
};

// Department validation schemas
const departmentValidations = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Department name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/)
      .withMessage('Department name must contain only letters and spaces'),
    body('organizationalCode')
      .trim()
      .matches(/^[A-Z]{2,5}-\d{2,4}$/)
      .withMessage('Organizational code must be in format: ABC-1234'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    body('level')
      .optional()
      .isIn(['board', 'administration', 'department', 'sub_department', 'team'])
      .withMessage('Level must be one of: board, administration, department, sub_department, team'),
    body('parentDepartment')
      .optional()
      .isMongoId()
      .withMessage('Parent department must be a valid MongoDB ObjectId'),
    body('contactEmail')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Contact email must be a valid email address'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.objectId('id'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Department name must be between 1 and 100 characters'),
    body('organizationalCode')
      .optional()
      .trim()
      .matches(/^[A-Z]{2,5}-\d{2,4}$/)
      .withMessage('Organizational code must be in format: ABC-1234'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    body('level')
      .optional()
      .isIn(['board', 'administration', 'department', 'sub_department', 'team'])
      .withMessage('Level must be one of: board, administration, department, sub_department, team'),
    body('parentDepartment')
      .optional()
      .isMongoId()
      .withMessage('Parent department must be a valid MongoDB ObjectId'),
    body('contactEmail')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Contact email must be a valid email address'),
    handleValidationErrors
  ],
  
  getById: [
    commonValidations.objectId('id'),
    handleValidationErrors
  ]
};

// Authentication validation schemas
const authValidations = {
  login: [
    body('identifier')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Email, username, or extension is required'),
    body('username')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Email, username, or extension is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    // Custom validation to ensure at least one identifier is provided
    body().custom((value, { req }) => {
      const identifier = req.body.identifier || req.body.username;
      if (!identifier || identifier.trim() === '') {
        throw new Error('Email, username, or extension is required');
      }
      return true;
    }),
    handleValidationErrors
  ],
  
  register: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email(),
    commonValidations.username(),
    commonValidations.password(),
    commonValidations.extension(),
    commonValidations.department(),
    commonValidations.role(),
    commonValidations.phone(),
    handleValidationErrors
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
    handleValidationErrors
  ]
};

// Export validation schemas
const exportValidations = {
  employees: [
    query('type')
      .optional()
      .isIn(['csv', 'excel'])
      .withMessage('Export type must be either csv or excel'),
    query('department')
      .optional()
      .isMongoId()
      .withMessage('Department must be a valid MongoDB ObjectId'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value'),
    commonValidations.search(),
    handleValidationErrors
  ]
};

// Schedule validation schemas
const scheduleValidations = {
  create: [
    commonValidations.objectId('employeeId'),
    body('date')
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    body('shiftStart')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Shift start must be in HH:MM format'),
    body('shiftEnd')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Shift end must be in HH:MM format'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.objectId('id'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    body('shiftStart')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Shift start must be in HH:MM format'),
    body('shiftEnd')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Shift end must be in HH:MM format'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters'),
    handleValidationErrors
  ]
};

module.exports = {
  commonValidations,
  employeeValidations,
  departmentValidations,
  authValidations,
  exportValidations,
  scheduleValidations,
  handleValidationErrors
};
