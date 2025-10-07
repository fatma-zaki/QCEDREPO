const { logger } = require('../config/logger');
const morgan = require('morgan');

// Custom token for response time
morgan.token('response-time', (req, res) => {
  if (!req._hrStartTime) return '0';
  const diff = process.hrtime(req._hrStartTime);
  return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
});

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user?.id || req.user?._id || 'anonymous';
});

// Custom token for user role
morgan.token('user-role', (req) => {
  return req.user?.role || 'anonymous';
});

// Custom token for request body (for POST/PUT requests)
morgan.token('request-body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    // Don't log sensitive data
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const body = { ...req.body };
    
    sensitiveFields.forEach(field => {
      if (body[field]) {
        body[field] = '[REDACTED]';
      }
    });
    
    return JSON.stringify(body);
  }
  return '-';
});

// Custom format for morgan
const morganFormat = ':remote-addr - :user-id [:user-role] ":method :url HTTP/:http-version" :status :response-time ms - :res[content-length] ":referrer" ":user-agent" - :request-body';

// Morgan middleware for HTTP logging
const httpLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.http(message.trim());
    }
  },
  skip: (req, res) => {
    // Skip logging for health checks and static files
    return req.url === '/api/health' || 
           req.url === '/api/ready' || 
           req.url.startsWith('/static/');
  }
});

// Request timing middleware
const requestTiming = (req, res, next) => {
  req._hrStartTime = process.hrtime();
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.logError(err, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || req.user?._id || 'anonymous',
    userRole: req.user?.role || 'anonymous',
    body: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ? req.body : undefined
  });
  
  next(err);
};

// Security event logging middleware
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
    /on\w+\s*=/i  // Event handler injection
  ];

  const url = req.originalUrl;
  const userAgent = req.get('User-Agent') || '';
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      logger.logSecurity('Suspicious request detected', {
        method: req.method,
        url: req.originalUrl,
        userAgent,
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id || req.user?._id || 'anonymous',
        pattern: pattern.toString()
      });
      break;
    }
  }
  
  next();
};

// Rate limiting logging middleware
const rateLimitLogger = (req, res, next) => {
  // This will be used with express-rate-limit
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      logger.logSecurity('Rate limit exceeded', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || req.user?._id || 'anonymous'
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Database query logging middleware
const databaseLogger = (req, res, next) => {
  const originalSend = res.send;
  const startTime = Date.now();
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log slow queries
    if (duration > 1000) { // 1 second
      logger.performance('Slow database operation', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        userId: req.user?.id || req.user?._id || 'anonymous'
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Business logic logging middleware
const businessLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log important business operations
    const importantEndpoints = [
      '/api/employees',
      '/api/departments',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/export'
    ];
    
    const isImportantEndpoint = importantEndpoints.some(endpoint => 
      req.originalUrl.startsWith(endpoint)
    );
    
    if (isImportantEndpoint && res.statusCode < 400) {
      logger.logBusiness('Business operation completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        userId: req.user?.id || req.user?._id || 'anonymous',
        userRole: req.user?.role || 'anonymous'
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  httpLogger,
  requestTiming,
  errorLogger,
  securityLogger,
  rateLimitLogger,
  databaseLogger,
  businessLogger
};
