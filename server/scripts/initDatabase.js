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
  {
    username: 'admin',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin'
  },
  // { name: 'Ahmed Al-Rashid', extension: '1001', position: 'HR Manager', email: 'ahmed.rashid@company.com', phone: '+966501234567' },
  // { name: 'Sarah Johnson', extension: '1002', position: 'HR Specialist', email: 'sarah.johnson@company.com', phone: '+966501234568' },
  // { name: 'Mohammed Al-Sheikh', extension: '2001', position: 'IT Director', email: 'mohammed.sheikh@company.com', phone: '+966501234569' },
  // { name: 'Emily Chen', extension: '2002', position: 'Software Developer', email: 'emily.chen@company.com', phone: '+966501234570' },
  // { name: 'Omar Al-Mansouri', extension: '2003', position: 'System Administrator', email: 'omar.mansouri@company.com', phone: '+966501234571' },
  // { name: 'Lisa Wang', extension: '3001', position: 'Finance Manager', email: 'lisa.wang@company.com', phone: '+966501234572' },
  // { name: 'Khalid Al-Zahrani', extension: '3002', position: 'Accountant', email: 'khalid.zahrani@company.com', phone: '+966501234573' },
  // { name: 'Jennifer Smith', extension: '4001', position: 'Marketing Director', email: 'jennifer.smith@company.com', phone: '+966501234574' },
  // { name: 'Abdullah Al-Qahtani', extension: '4002', position: 'Marketing Specialist', email: 'abdullah.qahtani@company.com', phone: '+966501234575' },
  // { name: 'Maria Garcia', extension: '5001', position: 'Operations Manager', email: 'maria.garcia@company.com', phone: '+966501234576' },
  // { name: 'Fahad Al-Otaibi', extension: '5002', position: 'Operations Coordinator', email: 'fahad.otaibi@company.com', phone: '+966501234577' },
  // { name: 'Rachel Brown', extension: '6001', position: 'Customer Service Manager', email: 'rachel.brown@company.com', phone: '+966501234578' },
  // { name: 'Saeed Al-Ghamdi', extension: '6002', position: 'Customer Service Rep', email: 'saeed.ghamdi@company.com', phone: '+966501234579' },
  // { name: 'David Wilson', extension: '7001', position: 'Sales Director', email: 'david.wilson@company.com', phone: '+966501234580' },
  // { name: 'Noura Al-Sabah', extension: '7002', position: 'Sales Representative', email: 'noura.sabah@company.com', phone: '+966501234581' },
  // { name: 'James Taylor', extension: '8001', position: 'R&D Manager', email: 'james.taylor@company.com', phone: '+966501234582' },
  // { name: 'Fatima Al-Mutairi', extension: '8002', position: 'Research Scientist', email: 'fatima.mutairi@company.com', phone: '+966501234583' }
];

const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin'
  }
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
    // await User.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create departments
    console.log('🔄 Creating departments...');
    const departments = await Department.insertMany(sampleDepartments);
    console.log(`✅ Created ${departments.length} departments`);

    // Create employees with department assignments
    console.log('🔄 Creating employees...');
    const employeesWithDepartments = sampleEmployees.map((employee, index) => {
      const departmentIndex = index % departments.length; // Cycle through departments
      return {
        ...employee,
        department: departments[departmentIndex]._id
      };
    });
    
    const employees = await Employee.insertMany(employeesWithDepartments);
    console.log(`✅ Created ${employees.length} employees`);

    // Create users
    console.log('🔄 Creating users...');
    // const emplyeees = [];
    // for (const userData of sampleUsers) {
    //   const user = new User(userData);
    //   await user.save(); // This will trigger the pre-save middleware to hash the password
    //   users.push(user);
    // }
    // console.log(`✅ Created ${users.length} users`);

    // Display summary
    // console.log('\n📊 Database Initialization Summary:');
    // console.log(`   Departments: ${departments.length}`);
    // console.log(`   Employees: ${employees.length}`);
    // console.log(`   Users: ${users.length}`);
    
    // console.log('\n👤 Default Admin Credentials:');
    // console.log('   Username: admin');
    // console.log('   Email: admin@company.com');
    // console.log('   Password: admin123');
    
    // console.log('\n👤 Default Viewer Credentials:');
    // console.log('   Username: viewer');
    // console.log('   Email: viewer@company.com');
    // console.log('   Password: viewer123');

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
