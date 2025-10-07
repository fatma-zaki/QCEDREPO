const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, requireAdmin, logActivity } = require('../middleware/auth');
const { requirePermission, filterDataByRole } = require('../middleware/permissions');
const { employeeValidations } = require('../middleware/validation');
const { searchLimiter, uploadLimiter, generalLimiter } = require('../middleware/rateLimiting');
const router = express.Router();
const {
  getEmployees,
  searchEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  bulkDeleteEmployees,
  bulkUpdateEmployees,
  bulkToggleEmployeeStatus,
  bulkAssignDepartment,
  resetEmployeePassword,
  updateMe,
  getManagerTeam
} = require('../controllers/employeeController');
// duplicate import removed

// Approve documents (admin or manager of employee)
router.post('/:id/documents/approve', verifyToken, async (req, res) => {
  try {
    const Employee = require('../models/Employee')
    const target = await Employee.findById(req.params.id)
    if (!target) return res.status(404).json({ success: false, message: 'Employee not found' })
    const isAdmin = req.user.role === 'admin'
    const isManager = String(target.reportsTo || target.manager || '') === String(req.user._id)
    if (!isAdmin && !isManager) return res.status(403).json({ success: false, message: 'Not authorized' })
    target.documentsStatus = 'approved'
    target.documentsApprovedBy = req.user._id
    target.documentsApprovedAt = new Date()
    await target.save({ validateBeforeSave: false })
    res.json({ success: true, message: 'Documents approved', data: { approvedBy: req.user._id, approvedAt: target.documentsApprovedAt } })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to approve documents' })
  }
})

// Reject documents
router.post('/:id/documents/reject', verifyToken, async (req, res) => {
  try {
    const Employee = require('../models/Employee')
    const target = await Employee.findById(req.params.id)
    if (!target) return res.status(404).json({ success: false, message: 'Employee not found' })
    const isAdmin = req.user.role === 'admin'
    const isManager = String(target.reportsTo || target.manager || '') === String(req.user._id)
    if (!isAdmin && !isManager) return res.status(403).json({ success: false, message: 'Not authorized' })
    target.documentsStatus = 'rejected'
    target.documentsApprovedBy = req.user._id
    target.documentsApprovedAt = new Date()
    await target.save({ validateBeforeSave: false })
    res.json({ success: true, message: 'Documents rejected' })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to reject documents' })
  }
})

// Manager team endpoint
router.get('/team', verifyToken, getManagerTeam)

// @route   GET /api/employees
// @desc    Get all employees with search and filter
// @access  Public (for public directory)
router.get('/', generalLimiter, employeeValidations.search, getEmployees);

// @route   GET /api/employees/search
// @desc    Advanced search employees
// @access  Public
router.get('/search', searchLimiter, employeeValidations.search, searchEmployees);

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Public
router.get('/:id', employeeValidations.getById, getEmployee);

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (Admin only)
router.post('/', [
  verifyToken,
  requirePermission('create_employees'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ max: 60 })
    .withMessage('First name cannot exceed 60 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ max: 60 })
    .withMessage('Last name cannot exceed 60 characters'),
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('extension')
    .notEmpty()
    .withMessage('Extension is required')
    .matches(/^\d{3,6}$/)
    .withMessage('Extension must be 3-6 digits'),
  body('department')
    .isMongoId()
    .withMessage('Valid department ID is required'),
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'hr', 'manager', 'employee'])
    .withMessage('Invalid role'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  logActivity('CREATE', 'EMPLOYEE')
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
}, createEmployee);

// @route   PUT /api/employees/me
// @desc    Update current employee profile
// @access  Private
router.put('/me', [
  verifyToken,
  logActivity('UPDATE', 'EMPLOYEE')
], updateMe);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (Admin only)
router.put('/:id', [
  verifyToken,
  requirePermission('edit_employees'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('First name cannot exceed 60 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Last name cannot exceed 60 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('extension')
    .optional()
    .matches(/^\d{3,6}$/)
    .withMessage('Extension must be 3-6 digits'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Valid department ID is required'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  logActivity('UPDATE', 'EMPLOYEE')
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
}, updateEmployee);

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin only)
router.delete('/:id', [
  verifyToken,
  requirePermission('delete_employees'),
  logActivity('DELETE', 'EMPLOYEE')
], deleteEmployee);

// @route   PATCH /api/employees/:id/toggle-status
// @desc    Toggle employee active status
// @access  Private (Admin only)
router.patch('/:id/toggle-status', [
  verifyToken,
  requirePermission('edit_employees'),
  logActivity('UPDATE', 'EMPLOYEE')
], toggleEmployeeStatus);

// @route   DELETE /api/employees/bulk
// @desc    Bulk delete employees
// @access  Private (Admin only)
router.delete('/bulk', [
  verifyToken,
  requirePermission('delete_employees'),
  logActivity('BULK_DELETE', 'EMPLOYEE')
], bulkDeleteEmployees);

// @route   PUT /api/employees/bulk
// @desc    Bulk update employees
// @access  Private (Admin only)
router.put('/bulk', [
  verifyToken,
  requirePermission('edit_employees'),
  logActivity('BULK_UPDATE', 'EMPLOYEE')
], bulkUpdateEmployees);

// @route   PATCH /api/employees/bulk/toggle-status
// @desc    Bulk toggle employee status
// @access  Private (Admin only)
router.patch('/bulk/toggle-status', [
  verifyToken,
  requirePermission('edit_employees'),
  logActivity('BULK_TOGGLE_STATUS', 'EMPLOYEE')
], bulkToggleEmployeeStatus);

// @route   PATCH /api/employees/bulk/assign-department
// @desc    Bulk assign department
// @access  Private (Admin only)
router.patch('/bulk/assign-department', [
  verifyToken,
  requirePermission('edit_employees'),
  logActivity('BULK_ASSIGN_DEPARTMENT', 'EMPLOYEE')
], bulkAssignDepartment);

// @route   PUT /api/employees/:id/password
// @desc    Admin reset employee password
// @access  Private (Admin only)
router.put('/:id/password', [
  verifyToken,
  requirePermission('edit_employees'),
  logActivity('UPDATE', 'EMPLOYEE')
], resetEmployeePassword);

module.exports = router;