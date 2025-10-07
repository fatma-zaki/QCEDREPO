const express = require('express');
const { verifyToken, logActivity } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const {
  generateEmployeeQR,
  generateContactQR,
  generateEmployeeCardQR,
  generateBulkQR
} = require('../controllers/qrController');

const router = express.Router();

// @route   GET /api/qr/employee/:id
// @desc    Generate QR code for employee
// @access  Private (View employees permission)
router.get('/employee/:id', [
  verifyToken,
  requirePermission('view_employees'),
  logActivity('GENERATE_QR', 'EMPLOYEE')
], generateEmployeeQR);

// @route   GET /api/qr/contact/:id
// @desc    Generate QR code for contact sharing
// @access  Private (View employees permission)
router.get('/contact/:id', [
  verifyToken,
  requirePermission('view_employees'),
  logActivity('GENERATE_CONTACT_QR', 'EMPLOYEE')
], generateContactQR);

// @route   GET /api/qr/card/:id
// @desc    Generate QR code for employee card
// @access  Private (View employees permission)
router.get('/card/:id', [
  verifyToken,
  requirePermission('view_employees'),
  logActivity('GENERATE_CARD_QR', 'EMPLOYEE')
], generateEmployeeCardQR);

// @route   POST /api/qr/bulk
// @desc    Generate QR codes for multiple employees
// @access  Private (Export data permission)
router.post('/bulk', [
  verifyToken,
  requirePermission('export_data'),
  logActivity('GENERATE_BULK_QR', 'EMPLOYEE')
], generateBulkQR);

module.exports = router;
