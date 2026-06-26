const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const config = require('./config/environment');
const databaseManager = require('./config/database');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

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

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazy DB connection — reuse across warm invocations
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await databaseManager.connect();
      dbConnected = true;
    } catch (err) {
      console.error('DB connection error:', err.message);
    }
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

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

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
