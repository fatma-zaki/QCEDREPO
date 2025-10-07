const express = require('express');
const { verifyToken, requireAdmin, logActivity } = require('../middleware/auth');
const { exportValidations } = require('../middleware/validation');
const { exportLimiter } = require('../middleware/rateLimiting');
const {
  exportEmployees
} = require('../controllers/exportController');

const router = express.Router();

// @route   GET /api/export/employees
// @desc    Export employees to CSV or Excel
// @access  Private (Authenticated users - Admin, Manager, HR)
router.get('/employees', [
  exportLimiter,
  verifyToken,
  exportValidations.employees,
  logActivity('EXPORT', 'EMPLOYEE')
], exportEmployees);

module.exports = router;
