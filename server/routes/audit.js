const express = require('express');
const { verifyToken, requireAuth, logActivity } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const {
  getAuditLogs,
  getAuditStats,
  getAuditLog
} = require('../controllers/auditController');

const router = express.Router();

// @route   GET /api/audit
// @desc    Get audit logs
// @access  Private (Admin can see all, others can see their own)
router.get('/', [
  verifyToken
], getAuditLogs);

// @route   GET /api/audit/stats
// @desc    Get audit log statistics
// @access  Private (Admin only)
router.get('/stats', [
  verifyToken,
  requirePermission('view_audit_logs')
], getAuditStats);

// @route   GET /api/audit/:id
// @desc    Get single audit log
// @access  Private (Admin only)
router.get('/:id', [
  verifyToken,
  requirePermission('view_audit_logs')
], getAuditLog);

module.exports = router;
