 const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const Log = require('../models/Log');



// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if database is connected
    if (Employee.db.readyState !== 1) {
      console.log('⚠️ Database not connected');
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable'
      });
    }
    
  const user = await Employee.findById(decoded.userId)
    .select('-password')
    .populate('department', 'name organizationalCode');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Token verification failed.'
    });
  }
};

// Check if user has admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user has viewer or admin role
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  next();
};

// Logging middleware
const logActivity = (action, target) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const targetId = req.params.id || req.body._id || null;
        const details = {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode
        };
        
        // Add request body for create/update operations
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          details.body = req.body;
        }
        
        // Only log if database is connected
        if (Log.db && Log.db.readyState === 1) {
          Log.createLog(req.user._id, action, target, targetId, details, req)
            .catch(err => console.error('Logging error:', err));
        } else {
          console.log(`📝 Activity logged (mock): ${action} on ${target} by ${req.user._id}`);
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  requireAdmin,
  requireAuth,
  logActivity
};
