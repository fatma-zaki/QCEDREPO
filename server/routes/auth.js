const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, logActivity } = require('../middleware/auth');
const { authValidations } = require('../middleware/validation');
const { authLimiter, bruteForce, generalLimiter } = require('../middleware/rateLimiting');
const {
  login,
  logout,
  getMe,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, bruteForce.prevent, authValidations.login, login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', verifyToken, logout);

// @route   GET /api/auth/verify
// @desc    Verify token and get current user
// @access  Private
router.get('/verify', generalLimiter, verifyToken, getMe);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', verifyToken, getMe);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
  verifyToken,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
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
}, changePassword);

module.exports = router;
