const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT',
      'GENERATE_QR', 'GENERATE_CONTACT_QR', 'GENERATE_CARD_QR', 'GENERATE_BULK_QR',
      'VIEW_AUDIT_LOGS', 'VIEW_AUDIT_STATS', 'VIEW_AUDIT_LOG',
      'BULK_DELETE', 'BULK_UPDATE', 'BULK_TOGGLE_STATUS', 'BULK_ASSIGN_DEPARTMENT',
      'SEND_WELCOME_EMAIL', 'SEND_BULK_EMAIL', 'SEND_ANNOUNCEMENT',
      'CHANGE_PASSWORD', 'VIEW_USER', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER'
    ]
  },
  target: {
    type: String,
    required: true,
    enum: ['DEPARTMENT', 'EMPLOYEE', 'USER', 'SYSTEM', 'AUDIT', 'EMAIL']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Not required for system actions
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ action: 1, createdAt: -1 });
logSchema.index({ target: 1, createdAt: -1 });
logSchema.index({ createdAt: -1 });

// Static method to create log entry
logSchema.statics.createLog = async function(userId, action, target, targetId = null, details = {}, req = null) {
  const logData = {
    user: userId,
    action,
    target,
    targetId,
    details
  };
  
  // Add request information if available
  if (req) {
    logData.ipAddress = req.ip || req.connection.remoteAddress;
    logData.userAgent = req.get('User-Agent');
  }
  
  return await this.create(logData);
};

// Static method to get logs with pagination
logSchema.statics.getLogs = function(page = 1, limit = 50, filters = {}) {
  const query = {};
  
  if (filters.user) {
    query.user = filters.user;
  }
  
  if (filters.action) {
    query.action = filters.action;
  }
  
  if (filters.target) {
    query.target = filters.target;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }
  
  return this.find(query)
    .populate('user', 'username email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Log', logSchema);
