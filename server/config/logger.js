const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('./environment');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.dirname(config.logging.logFile);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'qced-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: []
});

// Add console transport for development
if (config.logging.enableConsole) {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Add file transport for production
if (config.logging.enableFile) {
  // Error log file
  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }));

  // Combined log file
  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  }));

  // Audit log file
  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'audit-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '90d',
    zippedArchive: true
  }));
}

// Handle uncaught exceptions
logger.exceptions.handle(
  new DailyRotateFile({
    filename: path.join(logsDir, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
);

// Handle unhandled promise rejections
logger.rejections.handle(
  new DailyRotateFile({
    filename: path.join(logsDir, 'rejections-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  })
);

// Custom logging methods
class Logger {
  constructor(winstonLogger) {
    this.logger = winstonLogger;
  }

  // Standard logging methods
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Custom logging methods for different contexts
  http(message, meta = {}) {
    this.logger.info(message, { ...meta, type: 'http' });
  }

  database(message, meta = {}) {
    this.logger.info(message, { ...meta, type: 'database' });
  }

  auth(message, meta = {}) {
    this.logger.info(message, { ...meta, type: 'auth' });
  }

  security(message, meta = {}) {
    this.logger.warn(message, { ...meta, type: 'security' });
  }

  business(message, meta = {}) {
    this.logger.info(message, { ...meta, type: 'business' });
  }

  audit(message, meta = {}) {
    this.logger.info(message, { ...meta, type: 'audit' });
  }

  performance(message, meta = {}) {
    this.logger.info(message, { ...meta, type: 'performance' });
  }

  // Request logging
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || req.user?._id || 'anonymous',
      userRole: req.user?.role || 'anonymous'
    };

    if (res.statusCode >= 400) {
      this.error('HTTP Request Error', logData);
    } else {
      this.http('HTTP Request', logData);
    }
  }

  // Error logging with context
  logError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    };

    this.error('Application Error', errorData);
  }

  // Database operation logging
  logDatabaseOperation(operation, collection, duration, meta = {}) {
    this.database('Database Operation', {
      operation,
      collection,
      duration: `${duration}ms`,
      ...meta
    });
  }

  // Authentication logging
  logAuth(event, userId, meta = {}) {
    this.auth('Authentication Event', {
      event,
      userId,
      ...meta
    });
  }

  // Security event logging
  logSecurity(event, meta = {}) {
    this.security('Security Event', {
      event,
      ...meta
    });
  }

  // Business logic logging
  logBusiness(event, meta = {}) {
    this.business('Business Event', {
      event,
      ...meta
    });
  }

  // Performance logging
  logPerformance(operation, duration, meta = {}) {
    this.performance('Performance Event', {
      operation,
      duration: `${duration}ms`,
      ...meta
    });
  }
}

// Create logger instance
const appLogger = new Logger(logger);

// Export both winston logger and custom logger
module.exports = {
  logger: appLogger,
  winston: logger
};
