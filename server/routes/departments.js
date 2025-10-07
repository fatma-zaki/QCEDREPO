const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, requireAdmin, logActivity } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiting');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  assignManager,
  deleteDepartment,
  getDepartmentEmployees
} = require('../controllers/departmentController');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Public (for frontend display)
router.get('/', generalLimiter, getDepartments);

// @route   GET /api/departments/:id
// @desc    Get single department
// @access  Public
router.get('/:id', getDepartment);

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/', [
  verifyToken,
  requireAdmin,
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  logActivity('CREATE', 'DEPARTMENT')
], (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}, createDepartment);

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin only)
router.put('/:id', [
  verifyToken,
  requireAdmin,
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  logActivity('UPDATE', 'DEPARTMENT')
], (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}, updateDepartment);

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete('/:id', [
  verifyToken,
  requireAdmin,
  logActivity('DELETE', 'DEPARTMENT')
], deleteDepartment);

// @route   PUT /api/departments/:id/manager
// @desc    Assign manager to department
// @access  Private (Admin only)
router.put('/:id/manager', [
  verifyToken,
  requireAdmin,
  body('managerId')
    .optional()
    .isMongoId()
    .withMessage('Manager ID must be a valid MongoDB ObjectId'),
  logActivity('UPDATE', 'DEPARTMENT')
], (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}, assignManager);

// @route   GET /api/departments/:id/employees
// @desc    Get employees in a department
// @access  Public
router.get('/:id/employees', getDepartmentEmployees);

module.exports = router;
