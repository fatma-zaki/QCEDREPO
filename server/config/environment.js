const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : process.env.NODE_ENV === 'test' 
    ? '.env.test' 
    : '.env.development';

dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });

// Environment validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'PORT'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Configuration object with defaults and validation
const config = {
  // Server configuration
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      w: 'majority',
      // Connection timeout settings
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      // Retry configuration
      retryReads: true,
      maxIdleTimeMS: 30000
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: process.env.JWT_ISSUER || 'qced-api',
    audience: process.env.JWT_AUDIENCE || 'qced-client'
  },
  
  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 30, // minutes
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10) || 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 500, // Increased from 100 to 500
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'false'
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@qassimchamber.com'
  },
  
  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
    uploadPath: process.env.UPLOAD_PATH || './uploads'
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
    enableFile: process.env.LOG_FILE === 'true',
    logFile: process.env.LOG_FILE_PATH || './logs/app.log'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || (process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:5173']),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  
  // Admin default credentials (only for development)
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@company.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  }
};

// Validation helpers
const validateConfig = () => {
  const errors = [];
  
  // Validate MongoDB URI format
  if (!config.mongodb.uri || !config.mongodb.uri.startsWith('mongodb')) {
    errors.push('Invalid MongoDB URI format');
  }
  
  // Validate JWT secret strength
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    errors.push('JWT secret must be at least 32 characters long');
  }
  
  // Validate email configuration in production
  if (config.nodeEnv === 'production') {
    if (!config.email.host || !config.email.user || !config.email.password) {
      errors.push('Email configuration is required in production');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
};

// Run validation
validateConfig();

module.exports = config;
