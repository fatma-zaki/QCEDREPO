const crypto = require('crypto');

class SecretsManager {
  constructor() {
    this.secrets = new Map();
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('qced-secrets', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('qced-secrets', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  setSecret(key, value) {
    const encrypted = this.encrypt(value);
    this.secrets.set(key, encrypted);
  }

  getSecret(key) {
    const encrypted = this.secrets.get(key);
    if (!encrypted) return null;
    
    try {
      return this.decrypt(encrypted);
    } catch (error) {
      console.error(`Failed to decrypt secret ${key}:`, error);
      return null;
    }
  }

  removeSecret(key) {
    return this.secrets.delete(key);
  }

  // Load secrets from environment or external source
  loadSecrets() {
    const secretsToLoad = [
      'MONGODB_URI',
      'JWT_SECRET',
      'EMAIL_PASSWORD',
      'ADMIN_PASSWORD'
    ];

    secretsToLoad.forEach(secretKey => {
      const value = process.env[secretKey];
      if (value) {
        this.setSecret(secretKey, value);
        // Clear from environment after loading
        delete process.env[secretKey];
      }
    });
  }

  // Get all secret keys (for debugging)
  listSecretKeys() {
    return Array.from(this.secrets.keys());
  }

  // Clear all secrets (for cleanup)
  clearAllSecrets() {
    this.secrets.clear();
  }
}

// Create singleton instance
const secretsManager = new SecretsManager();

// Auto-load secrets on initialization
secretsManager.loadSecrets();

module.exports = secretsManager;
