const express = require('express');
const { verifyToken, requireAuth, logActivity } = require('../middleware/auth');
const { requirePermission, requireRole, filterDataByRole } = require('../middleware/permissions');
const { generalLimiter } = require('../middleware/rateLimiting');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeePermissions,
  changePassword
} = require('../controllers/userController');

const router = express.Router();

// @route   GET /api/users/permissions
// @desc    Get current user permissions
// @access  Private
router.get('/permissions', verifyToken, getEmployeePermissions);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  verifyToken,
  logActivity('CHANGE_PASSWORD', 'USER')
], changePassword);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin/HR only)
router.get('/', [
  verifyToken,
  requirePermission('manage_users'),
  filterDataByRole
], getEmployees);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', [
  verifyToken,
  logActivity('VIEW_USER', 'USER')
], getEmployee);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', [
  generalLimiter,
  verifyToken,
  requireRole('admin'),
  logActivity('CREATE_USER', 'USER')
], createEmployee);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', [
  verifyToken,
  logActivity('UPDATE_USER', 'USER')
], updateEmployee);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', [
  verifyToken,
  requireRole('admin'),
  logActivity('DELETE_USER', 'USER')
], deleteEmployee);

module.exports = router;
