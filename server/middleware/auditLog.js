const AuditLog = require('../models/AuditLog')

// Middleware to log user actions
const logActivity = (action, resource = null) => {
  return async (req, res, next) => {
    // Store original methods to restore later
    const originalSend = res.send
    const originalJson = res.json

    // Override res.send to capture response
    res.send = function (data) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAction(req, action, resource, data)
      }
      originalSend.call(this, data)
    }

    res.json = function (data) {
      // Log the action after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAction(req, action, resource, data)
      }
      originalJson.call(this, data)
    }

    next()
  }
}

// Helper function to log the action
const logAction = async (req, action, resource, responseData) => {
  try {
    if (!req.user || !req.user.id) {
      return // Skip logging if no user
    }

    const logData = {
      userId: req.user.id,
      action,
      resource: resource || req.originalUrl,
      resourceId: req.params.id || req.body.id,
      details: {
        method: req.method,
        url: req.originalUrl,
        body: sanitizeLogData(req.body),
        query: req.query,
        params: req.params,
        responseStatus: req.res.statusCode
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }

    // Add specific details based on action
    if (action === 'CREATE_EMPLOYEE' || action === 'UPDATE_EMPLOYEE') {
      logData.details.employeeData = sanitizeLogData(req.body)
    } else if (action === 'DELETE_EMPLOYEE') {
      logData.details.deletedEmployeeId = req.params.id
    }

    await AuditLog.logAction(logData)
  } catch (error) {
    console.error('Failed to log audit action:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

// Helper function to sanitize sensitive data from logs
const sanitizeLogData = data => {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sanitized = { ...data }
  const sensitiveFields = ['password', 'token', 'secret', 'key']

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}

// Middleware to log login attempts
const logLoginAttempt = async (req, res, next) => {
  const originalSend = res.send
  const originalJson = res.json

  res.send = function (data) {
    if (req.user) {
      logAction(req, 'LOGIN', 'AUTH', data)
    }
    originalSend.call(this, data)
  }

  res.json = function (data) {
    if (req.user) {
      logAction(req, 'LOGIN', 'AUTH', data)
    }
    originalJson.call(this, data)
  }

  next()
}

// Middleware to log logout
const logLogout = async (req, res, next) => {
  if (req.user) {
    await logAction(req, 'LOGOUT', 'AUTH', {})
  }
  next()
}

module.exports = {
  logActivity,
  logLoginAttempt,
  logLogout
}
