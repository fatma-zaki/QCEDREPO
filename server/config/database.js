const mongoose = require('mongoose');
const config = require('./environment');

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionStartTime = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.healthCheckInterval = null;
    this.metrics = {
      connectionAttempts: 0,
      successfulConnections: 0,
      failedConnections: 0,
      lastConnectionTime: null,
      lastError: null,
      averageResponseTime: 0,
      totalQueries: 0,
      failedQueries: 0
    };
  }

  async connect() {
    try {
      this.connectionStartTime = Date.now();
      this.metrics.connectionAttempts++;

      // Set up connection event listeners
      this.setupEventListeners();

      // Connect to MongoDB
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      
      this.isConnected = true;
      this.metrics.successfulConnections++;
      this.metrics.lastConnectionTime = new Date();
      this.metrics.lastError = null;
      this.retryCount = 0;

      console.log('✅ MongoDB connected successfully');
      
      // Start health check monitoring
      this.startHealthCheck();
      
      return true;
    } catch (error) {
      this.handleConnectionError(error);
      return false;
    }
  }

  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('📡 MongoDB connection established');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      this.isConnected = false;
      this.metrics.lastError = error.message;
      this.metrics.failedConnections++;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      this.isConnected = false;
      this.attemptReconnection();
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      this.isConnected = true;
      this.metrics.successfulConnections++;
    });

    // Query monitoring
    mongoose.connection.on('commandStarted', (event) => {
      this.metrics.totalQueries++;
      event.startTime = Date.now();
    });

    mongoose.connection.on('commandSucceeded', (event) => {
      if (event.startTime) {
        const responseTime = Date.now() - event.startTime;
        this.updateAverageResponseTime(responseTime);
      }
    });

    mongoose.connection.on('commandFailed', (event) => {
      this.metrics.failedQueries++;
      console.error('Database query failed:', event);
    });
  }

  async attemptReconnection() {
    if (this.retryCount >= this.maxRetries) {
      console.error('Max reconnection attempts reached. Giving up.');
      return false;
    }

    this.retryCount++;
    console.log(`Attempting to reconnect to MongoDB (attempt ${this.retryCount}/${this.maxRetries})...`);

    setTimeout(async () => {
      try {
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        this.retryCount = 0;
      } catch (error) {
        console.error('Reconnection failed:', error.message);
        this.attemptReconnection();
      }
    }, this.retryDelay);
  }

  startHealthCheck() {
    // Check database health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
  }

  async performHealthCheck() {
    try {
      const startTime = Date.now();
      
      // Check if connection exists and is ready
      if (!mongoose.connection.db || mongoose.connection.readyState !== 1) {
        console.log('🏥 Database health check failed: No connection');
        this.metrics.lastError = 'No database connection';
        return false;
      }
      
      // Simple ping to check connection
      await mongoose.connection.db.admin().ping();
      
      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);
      
      console.log(`🏥 Database health check passed (${responseTime}ms)`);
      return true;
    } catch (error) {
      console.error('🏥 Database health check failed:', error.message);
      this.metrics.lastError = error.message;
      return false;
    }
  }

  updateAverageResponseTime(newTime) {
    if (this.metrics.averageResponseTime === 0) {
      this.metrics.averageResponseTime = newTime;
    } else {
      this.metrics.averageResponseTime = (this.metrics.averageResponseTime + newTime) / 2;
    }
  }

  handleConnectionError(error) {
    this.metrics.failedConnections++;
    this.metrics.lastError = error.message;
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide helpful error messages for common Atlas issues
    if (error.message.includes('IP whitelist') || error.message.includes('whitelist')) {
      console.error('🔧 MongoDB Atlas IP Whitelist Issue:');
      console.error('   Your current IP address needs to be added to the MongoDB Atlas IP whitelist.');
      console.error('   Visit: https://www.mongodb.com/docs/atlas/security-whitelist/');
      console.error('   Or add 0.0.0.0/0 to allow all IPs (less secure, for development only)');
    }
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('🔧 MongoDB Atlas SSL/TLS Issue:');
      console.error('   This might be a network or SSL configuration issue.');
      console.error('   Try checking your network connection and MongoDB Atlas cluster status.');
    }
    
    if (error.message.includes('option') && error.message.includes('not supported')) {
      console.error('🔧 MongoDB Configuration Issue:');
      console.error('   An unsupported connection option was used.');
      console.error('   Check the MongoDB driver documentation for supported options.');
    }
    
    if (this.retryCount < this.maxRetries) {
      console.log(`Retrying connection in ${this.retryDelay / 1000} seconds...`);
      setTimeout(() => {
        this.retryCount++;
        this.connect();
      }, this.retryDelay);
    } else {
      console.error('🚫 Max retry attempts reached. Server will continue without database connection.');
      console.error('💡 The application will use mock data and limited functionality.');
    }
  }

  getHealthStatus() {
    return {
      isConnected: this.isConnected,
      connectionState: mongoose.connection.readyState,
      connectionStateText: this.getConnectionStateText(mongoose.connection.readyState),
      metrics: { ...this.metrics },
      uptime: this.connectionStartTime ? Date.now() - this.connectionStartTime : 0,
      retryCount: this.retryCount,
      lastCheck: new Date()
    };
  }

  getConnectionStateText(state) {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[state] || 'unknown';
  }

  async disconnect() {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('📴 MongoDB connection closed');
      return true;
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      return false;
    }
  }

  async getDatabaseStats() {
    try {
      // Check if connection exists and is ready
      if (!mongoose.connection.db || mongoose.connection.readyState !== 1) {
        return null;
      }
      
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;
