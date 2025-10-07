const Log = require('../models/Log');
const Employee = require('../models/Employee');

// @desc    Get audit logs
// @route   GET /api/audit
// @access  Private (Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      resource,
      startDate,
      endDate,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    // User filter - enforce role-based access
    if (userId) {
      // Only allow users to see their own logs unless they're admin
      if (req.user.role !== 'admin' && userId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own audit logs.'
        });
      }
      query.user = userId;
    } else if (req.user.role !== 'admin') {
      // Non-admin users can only see their own logs
      query.user = req.user._id;
    }

    // Action filter
    if (action) {
      query.action = action;
    }

    // Resource filter (using target from model)
    if (resource) {
      query.target = { $regex: resource, $options: 'i' };
    }

    // Date range filter (using createdAt from model)
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { target: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await Log.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Log.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/audit/stats
// @access  Private (Admin only)
const getAuditStats = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get action counts
    const actionStats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get user activity
    const userStats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          count: 1,
          lastActivity: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get daily activity
    const dailyStats = await Log.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        actionStats,
        userStats,
        dailyStats,
        period: days
      }
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics'
    });
  }
};

// @desc    Get single audit log
// @route   GET /api/audit/:id
// @access  Private (Admin only)
const getAuditLog = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id)
      .populate('user', 'name email role');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log'
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditStats,
  getAuditLog
};
