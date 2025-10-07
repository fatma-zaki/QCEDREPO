const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Employee = require('../../models/Employee');
const Department = require('../../models/Department');

describe('Auth Controller', () => {
  let testDepartment;
  let testEmployee;

  beforeAll(async () => {
    testDepartment = await Department.create({
      name: 'Test Department',
      organizationalCode: 'TD-001',
      description: 'Test department for auth tests'
    });

    testEmployee = await Employee.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@test.com',
      password: 'TestPass123',
      extension: '1001',
      department: testDepartment._id,
      role: 'employee'
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid email credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'john.doe@test.com',
          password: 'TestPass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('john.doe@test.com');
    });

    it('should login with valid extension credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: '1001',
          password: 'TestPass123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'john.doe@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'nonexistent@test.com',
          password: 'TestPass123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'TestPass123'
          // Missing identifier
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });
  });

  describe('GET /api/auth/verify', () => {
    let authToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'john.doe@test.com',
          password: 'TestPass123'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'john.doe@test.com',
          password: 'TestPass123'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to login endpoint', async () => {
      const promises = [];
      
      // Make multiple rapid login attempts
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              identifier: 'nonexistent@test.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
