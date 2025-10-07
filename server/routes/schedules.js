const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');
const {
  getDepartmentSchedule,
  getAllSchedules,
  createOrUpdateSchedule,
  publishSchedule,
  getEmployeeSchedule,
  getScheduleHistory
} = require('../controllers/scheduleController');

// @route   GET /api/schedules
// @desc    Get all schedules
// @access  Private
router.get('/', verifyToken, getAllSchedules);

// @route   GET /api/schedules/department/:departmentId
// @desc    Get schedule for a department
// @access  Private
router.get('/department/:departmentId', verifyToken, getDepartmentSchedule);

// @route   GET /api/schedules/employee/:employeeId
// @desc    Get employee's schedule
// @access  Private
router.get('/employee/:employeeId', verifyToken, getEmployeeSchedule);

// @route   POST /api/schedules
// @desc    Create or update schedule
// @access  Private (Manager or Admin)
router.post('/', verifyToken, requireRole(['admin', 'manager']), createOrUpdateSchedule);

// @route   POST /api/schedules/:id/publish
// @desc    Publish schedule
// @access  Private (Manager or Admin)
router.post('/:id/publish', verifyToken, requireRole(['admin', 'manager']), publishSchedule);

// @route   GET /api/schedules/:scheduleId/history
// @desc    Get schedule action history
// @access  Private
router.get('/:scheduleId/history', verifyToken, getScheduleHistory);

module.exports = router;
