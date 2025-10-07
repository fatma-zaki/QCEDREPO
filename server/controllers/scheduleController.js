const Schedule = require('../models/Schedule');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

// @desc    Get schedule for a department
// @route   GET /api/schedules/department/:departmentId
// @access  Private
const getDepartmentSchedule = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { weekStart } = req.query;

    let query = { department: departmentId, isActive: true };
    
    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      query.weekStart = { $gte: startDate, $lte: endDate };
    }

    const schedule = await Schedule.findOne(query)
      .populate('department', 'name')
      .populate('shifts.employee', 'firstName lastName username email position')
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .sort({ weekStart: -1 });

    if (!schedule) {
      return res.json({
        success: true,
        data: null,
        message: 'No schedule found for this department'
      });
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get department schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
};

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
const getAllSchedules = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, weekStart } = req.query;

    let query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      query.weekStart = { $gte: startDate, $lte: endDate };
    }

    const schedules = await Schedule.find(query)
      .populate('department', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName')
      .sort({ weekStart: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Schedule.countDocuments(query);

    res.json({
      success: true,
      count: schedules.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: schedules
    });
  } catch (error) {
    console.error('Get all schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules'
    });
  }
};

// @desc    Create or update schedule
// @route   POST /api/schedules
// @access  Private (Manager or Admin)
const createOrUpdateSchedule = async (req, res) => {
  try {
    const { department, schedule: scheduleData, shifts, isPublished, isActive } = req.body;
    const userId = req.user._id;

    // Check if user is admin or manager of the department
    const user = await Employee.findById(userId);
    if (user.role !== 'admin') {
      const departmentDoc = await Department.findById(department);
      if (!departmentDoc || departmentDoc.head.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to manage this department schedule'
        });
      }
    }

    // Get current week start (Monday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    // Check if schedule already exists for this department
    let schedule = await Schedule.findOne({
      department: department,
      isActive: true
    });

    if (schedule) {
      // Update existing schedule
      if (scheduleData) {
        schedule.schedule = scheduleData;
      }
      if (shifts) {
        schedule.shifts = shifts;
      }
      schedule.lastModifiedBy = userId;
      schedule.isPublished = isPublished !== undefined ? isPublished : schedule.isPublished;
      schedule.isActive = isActive !== undefined ? isActive : schedule.isActive;
      await schedule.save();
      try { 
        await AuditLog.create({ 
          actor: userId, 
          action: 'schedule.update', 
          targetType: 'schedule', 
          targetId: schedule._id, 
          metadata: { department, shiftsCount: shifts?.length || 0 } 
        }) 
      } catch {}
    } else {
      // Create new schedule
      schedule = new Schedule({
        department: department,
        weekStart: currentWeekStart,
        weekEnd: currentWeekEnd,
        schedule: scheduleData,
        shifts: shifts || [],
        createdBy: userId,
        lastModifiedBy: userId,
        isPublished: isPublished || false,
        isActive: isActive !== undefined ? isActive : true
      });
      await schedule.save();
      try { 
        await AuditLog.create({ 
          actor: userId, 
          action: 'schedule.create', 
          targetType: 'schedule', 
          targetId: schedule._id, 
          metadata: { department, shiftsCount: shifts?.length || 0 } 
        }) 
      } catch {}
    }

    await schedule.populate('department', 'name');
    await schedule.populate('shifts.employee', 'firstName lastName username email position');
    await schedule.populate('createdBy', 'firstName lastName');
    await schedule.populate('lastModifiedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Schedule saved successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Create/update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save schedule'
    });
  }
};

// @desc    Publish schedule
// @route   POST /api/schedules/:id/publish
// @access  Private (Manager or Admin)
const publishSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check permissions
    const user = await Employee.findById(userId);
    if (user.role !== 'admin') {
      const department = await Department.findById(schedule.department);
      if (!department || department.manager.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to publish this schedule'
        });
      }
    }

    schedule.isPublished = true;
    schedule.lastModifiedBy = userId;
    await schedule.save();
    try { await AuditLog.create({ actor: userId, action: 'schedule.publish', targetType: 'schedule', targetId: schedule._id }) } catch {}

    res.json({
      success: true,
      message: 'Schedule published successfully',
      data: schedule
    });
  } catch (error) {
    console.error('Publish schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish schedule'
    });
  }
};

// @desc    Get employee's schedule
// @route   GET /api/schedules/employee/:employeeId
// @access  Private
const getEmployeeSchedule = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { weekStart } = req.query;

    let query = { 'shifts.employee': employeeId };
    
    if (weekStart) {
      const startDate = new Date(weekStart);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      query.weekStart = { $gte: startDate, $lte: endDate };
    }

    const schedules = await Schedule.find(query)
      .populate('department', 'name')
      .populate('shifts.employee', 'firstName lastName username email position')
      .sort({ weekStart: -1 });

    // Filter to only show the employee's shifts
    const employeeSchedules = schedules.map(schedule => ({
      ...schedule.toObject(),
      shifts: schedule.shifts.filter(shift => 
        shift.employee._id.toString() === employeeId
      )
    }));

    res.json({
      success: true,
      data: employeeSchedules
    });
  } catch (error) {
    console.error('Get employee schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee schedule'
    });
  }
};

// @desc    Get schedule action history
// @route   GET /api/schedules/:scheduleId/history
// @access  Private
const getScheduleHistory = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const history = await AuditLog.find({
      targetType: 'schedule',
      targetId: scheduleId
    })
    .populate('actor', 'firstName lastName username role')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get schedule history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule history'
    });
  }
};

module.exports = {
  getDepartmentSchedule,
  getAllSchedules,
  createOrUpdateSchedule,
  publishSchedule,
  getEmployeeSchedule,
  getScheduleHistory
};
