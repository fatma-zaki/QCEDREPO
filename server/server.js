const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/environment');
const databaseManager = require('./config/database');
const { logger } = require('./config/logger');
const { 
  generalLimiter,
  authLimiter,
  uploadLimiter,
  exportLimiter,
  searchLimiter,
  speedLimiter,
  ipLimiter,
  bruteForce
} = require('./middleware/rateLimiting');
const { 
  httpLogger, 
  requestTiming, 
  errorLogger, 
  securityLogger,
  rateLimitLogger,
  databaseLogger,
  businessLogger 
} = require('./middleware/logging');

// Import routes
const authRoutes = require('./routes/auth');
const departmentRoutes = require('./routes/departments');
const employeeRoutes = require('./routes/employees');
const exportRoutes = require('./routes/export');
const userRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const qrRoutes = require('./routes/qr');
const emailRoutes = require('./routes/email');
const messageRoutes = require('./routes/messages');
const scheduleRoutes = require('./routes/schedules');

const app = express();


// Security middleware
app.use(helmet());



// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware (should be first)
app.use(requestTiming);
app.use(httpLogger);
app.use(securityLogger);
app.use(rateLimitLogger);
app.use(databaseLogger);
app.use(businessLogger);

// Rate limiting - only apply IP-based limiting globally
// Individual routes will handle their own specific rate limiting
app.use(ipLimiter);
app.use(speedLimiter);

// MongoDB connection with error handling
databaseManager.connect().catch((error) => {
  console.warn('⚠️ MongoDB connection failed, server will continue in limited mode:', error.message);
  console.log('📝 Note: Some features may not work without database connection');
});

// Health check endpoint (works without database)
app.get('/api/health', (req, res) => {
  const dbStatus = databaseManager.getHealthStatus();
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.connectionStateText
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/schedules', scheduleRoutes);


// Readiness endpoint (checks DB connectivity)
app.get('/api/ready', async (req, res) => {
  try {
    const healthStatus = databaseManager.getHealthStatus();
    const isReady = healthStatus.isConnected && healthStatus.connectionState === 1;
    
    if (isReady) {
      return res.json({ 
        ready: true, 
        db: 'connected', 
        timestamp: new Date().toISOString(),
        health: healthStatus
      });
    }
    
    return res.status(503).json({ 
      ready: false, 
      db: 'disconnected', 
      timestamp: new Date().toISOString(),
      health: healthStatus
    });
  } catch (e) {
    return res.status(503).json({ 
      ready: false, 
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database health endpoint
app.get('/api/health/database', async (req, res) => {
  try {
    const healthStatus = databaseManager.getHealthStatus();
    const dbStats = await databaseManager.getDatabaseStats();
    
    res.json({
      status: healthStatus.isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: healthStatus,
      stats: dbStats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Liveness endpoint (should be last, but explicit path)
app.get('/live', (req, res) => res.json({ live: true }))

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || req.user?._id || 'anonymous'
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

const PORT = config.port;
const httpServer = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: config.nodeEnv,
    healthCheckUrl: `http://localhost:${PORT}/api/health`
  });
  
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Realtime (Socket.IO)
try {
  const { initRealtime } = require('./realtime')
  const origins = config.cors.origin
  initRealtime(httpServer, origins)
  console.log('🛰️ Realtime server initialized')
} catch (e) {
  console.error('❌ Realtime initialization failed:', e.message)
  console.error('Stack trace:', e.stack)
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  console.log('SIGTERM received, shutting down gracefully...');
  await databaseManager.disconnect();
  httpServer.close(() => {
    logger.info('Process terminated');
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  console.log('SIGINT received, shutting down gracefully...');
  await databaseManager.disconnect();
  httpServer.close(() => {
    logger.info('Process terminated');
    console.log('Process terminated');
    process.exit(0);
  });
});
