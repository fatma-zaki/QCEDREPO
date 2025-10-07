const mongoose = require('mongoose');
const Employee = require('../../models/Employee');
const Department = require('../../models/Department');

describe('Employee Model', () => {
  let testDepartment;

  beforeEach(async () => {
    // Create a test department
    testDepartment = await Department.create({
      name: 'Test Department',
      organizationalCode: 'TD-001',
      description: 'Test department for unit tests'
    });
  });

  describe('Employee Creation', () => {
    it('should create a new employee with valid data', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@test.com',
        password: 'TestPass123',
        extension: '1001',
        department: testDepartment._id,
        role: 'employee'
      };

      const employee = await Employee.create(employeeData);

      expect(employee).toBeDefined();
      expect(employee.firstName).toBe('John');
      expect(employee.lastName).toBe('Doe');
      expect(employee.email).toBe('john.doe@test.com');
      expect(employee.extension).toBe('1001');
      expect(employee.role).toBe('employee');
      expect(employee.employeeCode).toMatch(/^EMP-\d{6}$/);
      expect(employee.isActive).toBe(true);
    });

    it('should not create employee with duplicate email', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@test.com',
        password: 'TestPass123',
        extension: '1001',
        department: testDepartment._id
      };

      await Employee.create(employeeData);

      const duplicateEmployeeData = {
        ...employeeData,
        username: 'johndoe2',
        extension: '1002'
      };

      await expect(Employee.create(duplicateEmployeeData))
        .rejects
        .toThrow(/duplicate key error/i);
    });

    it('should hash password on creation', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@test.com',
        password: 'TestPass123',
        extension: '1001',
        department: testDepartment._id
      };

      const employee = await Employee.create(employeeData);
      
      expect(employee.password).not.toBe('TestPass123');
      expect(employee.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });
  });

  describe('Employee Methods', () => {
    let employee;

    beforeEach(async () => {
      employee = await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@test.com',
        password: 'TestPass123',
        extension: '1001',
        department: testDepartment._id
      });
    });

    it('should compare password correctly', async () => {
      const isMatch = await employee.comparePassword('TestPass123');
      const isNotMatch = await employee.comparePassword('WrongPassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });

    it('should check permissions correctly', () => {
      employee.permissions = ['employee:read', 'employee:update'];
      
      expect(employee.hasPermission('employee:read')).toBe(true);
      expect(employee.hasPermission('employee:delete')).toBe(false);
      expect(employee.hasPermission('*')).toBe(false);
      
      employee.permissions = ['*'];
      expect(employee.hasPermission('anything')).toBe(true);
    });

    it('should generate full name correctly', () => {
      expect(employee.fullName).toBe('John Doe');
      
      employee.lastName = '';
      expect(employee.fullName).toBe('John');
      
      employee.firstName = '';
      expect(employee.fullName).toBe('johndoe');
    });

    it('should lock and unlock account', async () => {
      expect(employee.accountLocked).toBe(false);
      
      await employee.lockAccount();
      expect(employee.accountLocked).toBe(true);
      
      await employee.unlockAccount();
      expect(employee.accountLocked).toBe(false);
      expect(employee.loginAttempts).toBe(0);
    });

    it('should generate password reset token', () => {
      const token = employee.generatePasswordReset();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(40); // 20 bytes hex = 40 chars
      expect(employee.resetPasswordToken).toBe(token);
      expect(employee.resetPasswordExpires).toBeInstanceOf(Date);
    });

    it('should generate two-factor code', () => {
      const code = employee.generateTwoFactorCode();
      
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
      expect(employee.twoFactorCode).toBe(code);
      expect(employee.twoFactorExpires).toBeInstanceOf(Date);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@test.com',
        password: 'TestPass123',
        extension: '1001',
        department: testDepartment._id
      });

      await Employee.create({
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane.smith@test.com',
        password: 'TestPass123',
        extension: '1002',
        department: testDepartment._id,
        role: 'manager'
      });
    });

    it('should find employee by credentials (email)', async () => {
      const result = await Employee.findByCredentials('john.doe@test.com', 'TestPass123');
      
      expect(result).toBeDefined();
      expect(result.firstName).toBe('John');
      expect(result.password).toBeUndefined(); // Should not include password
    });

    it('should find employee by credentials (extension)', async () => {
      const result = await Employee.findByCredentials('1002', 'TestPass123');
      
      expect(result).toBeDefined();
      expect(result.firstName).toBe('Jane');
    });

    it('should return null for invalid credentials', async () => {
      const result = await Employee.findByCredentials('invalid@test.com', 'wrongpass');
      
      expect(result).toBeNull();
    });

    it('should search employees with filters', async () => {
      const result = await Employee.searchEmployees({
        q: 'John',
        page: 1,
        limit: 10
      });
      
      expect(result.results).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.results[0].firstName).toBe('John');
    });

    it('should search employees by role', async () => {
      const result = await Employee.searchEmployees({
        role: 'manager',
        page: 1,
        limit: 10
      });
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].role).toBe('manager');
    });
  });

  describe('Validation', () => {
    it('should require all mandatory fields', async () => {
      const incompleteData = {
        firstName: 'John'
        // Missing other required fields
      };

      await expect(Employee.create(incompleteData))
        .rejects
        .toThrow(/validation failed/i);
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'invalid-email',
        password: 'TestPass123',
        extension: '1001',
        department: testDepartment._id
      };

      await expect(Employee.create(invalidEmailData))
        .rejects
        .toThrow(/invalid email/i);
    });

    it('should validate extension format', async () => {
      const invalidExtensionData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@test.com',
        password: 'TestPass123',
        extension: 'abc',
        department: testDepartment._id
      };

      await expect(Employee.create(invalidExtensionData))
        .rejects
        .toThrow(/extension must be 3-6 digits/i);
    });
  });
});
