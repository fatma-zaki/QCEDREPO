const express = require('express');
const { verifyToken, logActivity } = require('../middleware/auth');
const { requirePermission, requireRole } = require('../middleware/permissions');
const {
  sendWelcomeEmail,
  sendBulkEmail,
  sendAnnouncement,
  getEmailTemplates
} = require('../controllers/emailController');

const router = express.Router();

// @route   GET /api/email/templates
// @desc    Get available email templates
// @access  Private
router.get('/templates', [
  verifyToken,
  requirePermission('view_employees')
], getEmailTemplates);

// @route   POST /api/email/welcome/:employeeId
// @desc    Send welcome email to employee
// @access  Private (HR/Admin only)
router.post('/welcome/:employeeId', [
  verifyToken,
  requirePermission('create_employees'),
  logActivity('SEND_WELCOME_EMAIL', 'EMAIL')
], sendWelcomeEmail);

// @route   POST /api/email/bulk
// @desc    Send bulk emails to employees
// @access  Private (HR/Admin only)
router.post('/bulk', [
  verifyToken,
  requirePermission('create_employees'),
  logActivity('SEND_BULK_EMAIL', 'EMAIL')
], sendBulkEmail);

// @route   POST /api/email/announcement
// @desc    Send announcement to all employees
// @access  Private (Admin only)
router.post('/announcement', [
  verifyToken,
  requireRole('admin'),
  logActivity('SEND_ANNOUNCEMENT', 'EMAIL')
], sendAnnouncement);

module.exports = router;
