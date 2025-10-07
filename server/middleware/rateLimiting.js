const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const ExpressBrute = require('express-brute');
const config = require('../config/environment');
const { logger } = require('../config/logger');

// Brute force protection (disabled - requires Redis)
console.warn('⚠️ Brute force protection disabled (Redis not available)');
console.log('📝 Note: To enable brute force protection, install Redis server or use cloud Redis service.');

// Create a dummy brute force middleware that just calls next()
const bruteForce = {
  prevent: (req, res, next) => next()
};

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
  skipFailedRequests: config.rateLimit.skipFailedRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      userId: req.user?.id || req.user?._id || 'anonymous'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.round(config.rateLimit.windowMs / 1000)
    });
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity('Authentication rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      identifier: req.body?.identifier || req.body?.username || req.body?.email
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity('File upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      userId: req.user?.id || req.user?._id || 'anonymous'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many file uploads, please try again later.',
      retryAfter: 3600 // 1 hour in seconds
    });
  }
});

// Export rate limiting
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 exports per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity('Export rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      userId: req.user?.id || req.user?._id || 'anonymous'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many export requests, please try again later.',
      retryAfter: 3600 // 1 hour in seconds
    });
  }
});

// Search rate limiting
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity('Search rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      userId: req.user?.id || req.user?._id || 'anonymous'
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many search requests, please try again later.',
      retryAfter: 60 // 1 minute in seconds
    });
  }
});

// Slow down middleware for gradual rate limiting
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});

// Role-based rate limiting
const createRoleBasedLimiter = (role, maxRequests) => {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: (req) => {
      // Check if user has the specified role
      if (req.user?.role === role) {
        return maxRequests;
      }
      // Default limit for other roles
      return config.rateLimit.maxRequests;
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.logSecurity('Role-based rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        userId: req.user?.id || req.user?._id || 'anonymous',
        userRole: req.user?.role || 'anonymous',
        expectedRole: role
      });
      
      res.status(429).json({
        success: false,
        message: `Rate limit exceeded for ${role} role.`,
        retryAfter: Math.round(config.rateLimit.windowMs / 1000)
      });
    }
  });
};

// Admin rate limiter (higher limits)
const adminLimiter = createRoleBasedLimiter('admin', 500);

// Manager rate limiter
const managerLimiter = createRoleBasedLimiter('manager', 200);

// HR rate limiter
const hrLimiter = createRoleBasedLimiter('hr', 200);

// Employee rate limiter
const employeeLimiter = createRoleBasedLimiter('employee', 100);

// IP-based rate limiting for anonymous users
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 50 to 200 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip if user is authenticated
    return !!req.user;
  },
  handler: (req, res) => {
    logger.logSecurity('IP rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 900 // 15 minutes in seconds
    });
  }
});

// Custom rate limiter factory
const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.logSecurity('Custom rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        userId: req.user?.id || req.user?._id || 'anonymous',
        customLimit: options.max || config.rateLimit.maxRequests
      });
      
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded.',
        retryAfter: Math.round((options.windowMs || config.rateLimit.windowMs) / 1000)
      });
    }
  };
  
  return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
  // Basic rate limiters
  generalLimiter,
  authLimiter,
  uploadLimiter,
  exportLimiter,
  searchLimiter,
  speedLimiter,
  ipLimiter,
  
  // Role-based rate limiters
  adminLimiter,
  managerLimiter,
  hrLimiter,
  employeeLimiter,
  
  // Brute force protection
  bruteForce,
  
  // Utility
  createCustomLimiter,
  createRoleBasedLimiter
};
