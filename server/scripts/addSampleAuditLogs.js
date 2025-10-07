const mongoose = require('mongoose');
const Log = require('../models/Log');
const Employee = require('../models/Employee');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/qced')
  .then(() => {
    console.log('Connected to MongoDB');
    return addSampleLogs();
  })
  .then(() => {
    console.log('Sample audit logs added successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

async function addSampleLogs() {
  try {
    // Get a sample employee
    const employee = await Employee.findOne();
    if (!employee) {
      console.log('No employees found. Please create an employee first.');
      return;
    }

    // Add some sample audit logs
    const sampleLogs = [
      {
        user: employee._id,
        action: 'CREATE',
        target: 'EMPLOYEE',
        targetId: employee._id,
        details: {
          employeeName: employee.name,
          action: 'Created new employee'
        }
      },
      {
        user: employee._id,
        action: 'UPDATE',
        target: 'EMPLOYEE',
        targetId: employee._id,
        details: {
          employeeName: employee.name,
          action: 'Updated employee information'
        }
      },
      {
        user: employee._id,
        action: 'LOGIN',
        target: 'SYSTEM',
        details: {
          action: 'User logged in'
        }
      },
      {
        user: employee._id,
        action: 'EXPORT',
        target: 'EMPLOYEE',
        details: {
          action: 'Exported employee data'
        }
      }
    ];

    await Log.insertMany(sampleLogs);
    console.log(`Added ${sampleLogs.length} sample audit logs`);
  } catch (error) {
    console.error('Error adding sample logs:', error);
    throw error;
  }
}
