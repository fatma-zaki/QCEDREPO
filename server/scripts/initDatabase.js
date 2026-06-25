const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import models
const Department = require('../models/Department');
const Employee = require('../models/Employee');


// Sample data
const sampleDepartments = [
  { name: 'Human Resources' },
  { name: 'Information Technology' },
  { name: 'Finance' },
  { name: 'Marketing' },
  { name: 'Operations' },
  { name: 'Customer Service' },
  { name: 'Sales' },
  { name: 'Research & Development' }
];

const sampleEmployees = [
  { firstName: 'Admin', lastName: 'User', username: 'admin', email: 'admin@company.com', password: 'Admin@123', extension: '1000', position: 'System Administrator', phone: '+966500000000', role: 'admin', permissions: ['*'] },
  { firstName: 'Ahmed', lastName: 'Al-Rashid', username: 'ahmed.rashid', email: 'ahmed.rashid@company.com', password: 'Pass@123', extension: '1001', position: 'HR Manager', phone: '+966501234567', role: 'hr' },
  { firstName: 'Sarah', lastName: 'Johnson', username: 'sarah.johnson', email: 'sarah.johnson@company.com', password: 'Pass@123', extension: '1002', position: 'HR Specialist', phone: '+966501234568', role: 'hr' },
  { firstName: 'Mohammed', lastName: 'Al-Sheikh', username: 'mohammed.sheikh', email: 'mohammed.sheikh@company.com', password: 'Pass@123', extension: '2001', position: 'IT Director', phone: '+966501234569', role: 'manager' },
  { firstName: 'Emily', lastName: 'Chen', username: 'emily.chen', email: 'emily.chen@company.com', password: 'Pass@123', extension: '2002', position: 'Software Developer', phone: '+966501234570' },
  { firstName: 'Omar', lastName: 'Al-Mansouri', username: 'omar.mansouri', email: 'omar.mansouri@company.com', password: 'Pass@123', extension: '2003', position: 'System Administrator', phone: '+966501234571' },
  { firstName: 'Lisa', lastName: 'Wang', username: 'lisa.wang', email: 'lisa.wang@company.com', password: 'Pass@123', extension: '3001', position: 'Finance Manager', phone: '+966501234572' },
  { firstName: 'Khalid', lastName: 'Al-Zahrani', username: 'khalid.zahrani', email: 'khalid.zahrani@company.com', password: 'Pass@123', extension: '3002', position: 'Accountant', phone: '+966501234573' },
  { firstName: 'Jennifer', lastName: 'Smith', username: 'jennifer.smith', email: 'jennifer.smith@company.com', password: 'Pass@123', extension: '4001', position: 'Marketing Director', phone: '+966501234574' },
  { firstName: 'Abdullah', lastName: 'Al-Qahtani', username: 'abdullah.qahtani', email: 'abdullah.qahtani@company.com', password: 'Pass@123', extension: '4002', position: 'Marketing Specialist', phone: '+966501234575' },
  { firstName: 'Maria', lastName: 'Garcia', username: 'maria.garcia', email: 'maria.garcia@company.com', password: 'Pass@123', extension: '5001', position: 'Operations Manager', phone: '+966501234576' },
  { firstName: 'Fahad', lastName: 'Al-Otaibi', username: 'fahad.otaibi', email: 'fahad.otaibi@company.com', password: 'Pass@123', extension: '5002', position: 'Operations Coordinator', phone: '+966501234577' },
  { firstName: 'Rachel', lastName: 'Brown', username: 'rachel.brown', email: 'rachel.brown@company.com', password: 'Pass@123', extension: '6001', position: 'Customer Service Manager', phone: '+966501234578' },
  { firstName: 'Saeed', lastName: 'Al-Ghamdi', username: 'saeed.ghamdi', email: 'saeed.ghamdi@company.com', password: 'Pass@123', extension: '6002', position: 'Customer Service Rep', phone: '+966501234579' },
  { firstName: 'David', lastName: 'Wilson', username: 'david.wilson', email: 'david.wilson@company.com', password: 'Pass@123', extension: '7001', position: 'Sales Director', phone: '+966501234580' },
  { firstName: 'Noura', lastName: 'Al-Sabah', username: 'noura.sabah', email: 'noura.sabah@company.com', password: 'Pass@123', extension: '7002', position: 'Sales Representative', phone: '+966501234581' },
  { firstName: 'James', lastName: 'Taylor', username: 'james.taylor', email: 'james.taylor@company.com', password: 'Pass@123', extension: '8001', position: 'R&D Manager', phone: '+966501234582' },
  { firstName: 'Fatima', lastName: 'Al-Mutairi', username: 'fatima.mutairi', email: 'fatima.mutairi@company.com', password: 'Pass@123', extension: '8002', position: 'Research Scientist', phone: '+966501234583' }
];

async function initializeDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🔄 Clearing existing data...');
    await Department.deleteMany({});
    await Employee.deleteMany({});
    await mongoose.connection.collection('counters').deleteMany({});
    // await User.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create departments
    console.log('🔄 Creating departments...');
    const departments = await Department.insertMany(sampleDepartments);
    console.log(`✅ Created ${departments.length} departments`);

    // Create employees with department assignments (use save() for password hashing)
    console.log('🔄 Creating employees...');
    const employees = [];
    for (let i = 0; i < sampleEmployees.length; i++) {
      const deptIndex = i % departments.length;
      const emp = new Employee({
        ...sampleEmployees[i],
        department: departments[deptIndex]._id
      });
      await emp.save();
      employees.push(emp);
    }
    console.log(`✅ Created ${employees.length} employees`);

    console.log('\n📊 Database Initialization Summary:');
    console.log(`   Departments: ${departments.length}`);
    console.log(`   Employees: ${employees.length}`);
    console.log('\n👤 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@company.com');
    console.log('   Password: Admin@123');

    console.log('\n🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the initialization
initializeDatabase();
