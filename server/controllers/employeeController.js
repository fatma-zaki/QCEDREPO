const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { notifyManagers } = require('../services/emailService');

// Mock data for development when database is not available
// const mockEmployees = [
//   {
//     _id: '1',
//     name: 'أحمد محمد',
//     extension: '1001',
//     department: { name: 'IT' },
//     email: 'ahmed@company.com',
//     phone: '+966501234567',
//     position: 'Software Developer',
//     isActive: true
//   },
//   {
//     _id: '2', 
//     name: 'فاطمة أحمد',
//     extension: '1002',
//     department: { name: 'HR' },
//     email: 'fatima@company.com',
//     phone: '+966507654321',
//     position: 'HR Manager',
//     isActive: true
//   },
//   {
//     _id: '3',
//     name: 'محمد علي',
//     extension: '1003', 
//     department: { name: 'Finance' },
//     email: 'mohammed@company.com',
//     phone: '+966509876543',
//     position: 'Accountant',
//     isActive: true
//   }
// ];

// const mockDepartments = [
//   { _id: '1', name: 'IT', description: 'Information Technology' },
//   { _id: '2', name: 'HR', description: 'Human Resources' },
//   { _id: '3', name: 'Finance', description: 'Finance Department' }
// ];

// @desc    Get all employees with search and filter
// @route   GET /api/employees
// @access  Public
const getEmployees = async (req, res) => {
  try {
    console.log('🔍 Fetching employees...');
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      department = '', 
      isActive = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query object
    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { extension: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by department
    if (department) {
      query.department = department;
    }
    
    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      count: employees.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: employees
    });
  } catch (error) {
    console.error('❌ Get employees error:', error);
    console.error('Error details:', error.message);
    
    // Fallback response when database is not available
    console.log('⚠️ Database error, returning empty result');
    res.json({
      success: true,
      count: 0,
      total: 0,
      page: 1,
      pages: 1,
      data: []
    });
  }
};

// @desc    Get manager's team (same department employees)
// @route   GET /api/employees/team
// @access  Private (Manager or Admin)
const getManagerTeam = async (req, res) => {
  try {
    const me = await Employee.findById(req.user._id).populate('department', 'name manager')
    if (!me) return res.status(404).json({ success: false, message: 'Employee not found' })

    let departmentId
    if (req.user.role === 'admin') {
      departmentId = req.query.departmentId || me.department?._id
      if (!departmentId) return res.status(400).json({ success: false, message: 'departmentId is required for admin' })
    } else if (req.user.role === 'manager') {
      departmentId = me.department?._id
      if (!departmentId) return res.status(400).json({ success: false, message: 'Manager has no department' })
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const team = await Employee.find({ department: departmentId, isActive: { $ne: false } })
      .select('firstName lastName username email position phone extension department avatar')
      .populate('department', 'name')

    return res.json({ success: true, count: team.length, data: team })
  } catch (error) {
    console.error('Get manager team error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch team' })
  }
}

// @desc    Advanced search employees
// @route   GET /api/employees/search
// @access  Public
const searchEmployees = async (req, res) => {
  try {
    const { q, department, isActive } = req.query;
    
    const filters = {};
    if (department) filters.department = department;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const employees = await Employee.searchEmployees(q, filters);
    
    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search employees'
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Public
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee'
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin only)
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      extension,
      department,
      email,
      password,
      role,
      phone,
      position,
      hireDate,
      salary,
      reportsTo,
      skills,
      emergencyContacts,
      address,
      avatar,
      isActive = true
    } = req.body;
 
// Validate required fields
    if ((!req.body.firstName && !name) || !extension || !department || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name (or name), extension, department, email, and password are required'
      });
    }

    // Check if extension already exists
    const existingEmployee = await Employee.findOne({ extension });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this extension already exists'
      });
    }

    // Verify department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }
// create employee
    const employee = new Employee({
      firstName: req.body.firstName || name?.split(' ')[0] || '',
      lastName: req.body.lastName || name?.split(' ').slice(1).join(' ') || '',
      username: req.body.username || email?.split('@')[0] || '',
      extension,
      department,
      email,
      password,
      role,
      phone,
      position,
      hireDate,
      salary,
      reportsTo,
      skills: skills || [],
      emergencyContacts: emergencyContacts || [],
      address,
      avatar,
      isActive
    });

    await employee.save();
    await employee.populate('department', 'name');
    await employee.populate('reportsTo', 'name position');

    // Notify managers about new employee (temporarily disabled to fix 500 error)
    // notifyManagers(employee).catch(error => {
    //   console.error('Failed to notify managers:', error);
    // });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee'
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin only)
const updateEmployee = async (req, res) => {
  try {
    // Check if employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Prevent non-admin users from updating admin employees
    if (employee.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can update admin accounts'
      });
    }

    const {
      firstName,
      lastName,
      name, // for backward compatibility
      extension,
      department,
      email,
      phone,
      position,
      hireDate,
      salary,
      manager,
      skills,
      emergencyContacts,
      address,
      avatar,
      isActive,
      currentPassword,
      newPassword
    } = req.body;

    // Handle password update if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }
      
      // Verify current password
      const employeeWithPassword = await Employee.findById(req.params.id).select('+password');
      const isCurrentPasswordValid = await employeeWithPassword.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }
    }

    // Handle name field - convert from 'name' to firstName/lastName if needed
    let firstNameToUse = firstName;
    let lastNameToUse = lastName;
    
    if (name && !firstName && !lastName) {
      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      firstNameToUse = nameParts[0] || '';
      lastNameToUse = nameParts.slice(1).join(' ') || '';
    }

    // Validate required fields
    if (firstNameToUse !== undefined && (!firstNameToUse || firstNameToUse.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'First name is required'
      });
    }
    
    if (lastNameToUse !== undefined && (!lastNameToUse || lastNameToUse.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Last name is required'
      });
    }
    
    if (email !== undefined && (!email || !email.includes('@'))) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    // Check if extension is being changed and if it already exists
    if (extension && extension !== employee.extension) {
      const existingEmployee = await Employee.findOne({ 
        extension, 
        _id: { $ne: req.params.id } 
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this extension already exists'
        });
      }
    }

    // Verify department exists if being changed
    if (department && department !== employee.department.toString()) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
    }

    // Update employee fields
    if (firstNameToUse !== undefined) employee.firstName = firstNameToUse;
    if (lastNameToUse !== undefined) employee.lastName = lastNameToUse;
    if (extension !== undefined) employee.extension = extension;
    if (department !== undefined) employee.department = department;
    if (email !== undefined) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (position !== undefined) employee.position = position;
    if (hireDate !== undefined) employee.hireDate = hireDate;
    if (salary !== undefined) employee.salary = salary;
    if (manager !== undefined) employee.manager = manager;
    if (skills !== undefined) employee.skills = skills;
    if (emergencyContacts !== undefined) employee.emergencyContacts = emergencyContacts;
    if (address !== undefined) employee.address = address;
    if (avatar !== undefined) employee.avatar = avatar;
    if (isActive !== undefined) employee.isActive = isActive;
    if (newPassword !== undefined) employee.password = newPassword; // will be hashed by pre-save hook

    await employee.save();
    await employee.populate('department', 'name');
    await employee.populate('reportsTo', 'name position');

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update employee: ' + (error.message || 'Unknown error')
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    // Check if employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee'
    });
  }
};

// @desc    Toggle employee active status
// @route   PATCH /api/employees/:id/toggle-status
// @access  Private (Admin only)
const toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.isActive = !employee.isActive;
    await employee.save();
    await employee.populate('department', 'name');

    res.json({
      success: true,
      message: `Employee ${employee.isActive ? 'activated' : 'deactivated'} successfully`,
      data: employee
    });
  } catch (error) {
    console.error('Toggle employee status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle employee status'
    });
  }
};

// @desc    Update current employee (self)
// @route   PUT /api/employees/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    // Check if database is connected
    if (Employee.db.readyState !== 1) {
      console.log('⚠️ Database not connected');
      return res.status(503).json({
        success: false,
        message: 'Database connection unavailable'
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      address,
      avatar,
      currentPassword,
      newPassword
    } = req.body;

    // Validate password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }
      
      // Verify current password
      const employeeWithPassword = await Employee.findById(req.user._id).select('+password');
      const isCurrentPasswordValid = await employeeWithPassword.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }
    }

    // Validate required fields (only if provided)
    if (firstName !== undefined && firstName !== null && firstName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'First name cannot be empty'
      });
    }
    
    if (lastName !== undefined && lastName !== null && lastName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Last name cannot be empty'
      });
    }
    
    if (email !== undefined && email !== null && email.trim().length > 0 && !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    const allowed = ['firstName', 'lastName', 'email', 'phone', 'position', 'address', 'avatar'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        updates[key] = req.body[key];
      }
    }

    // Add password update if provided
    if (newPassword !== undefined) updates.password = newPassword;

    // Allow self-update of ID images
    if (req.body.idFrontUrl !== undefined) updates.idFrontUrl = req.body.idFrontUrl
    if (req.body.idBackUrl !== undefined) updates.idBackUrl = req.body.idBackUrl
    // Reset documents status to pending on change
    if (updates.idFrontUrl || updates.idBackUrl) {
      updates.documentsStatus = 'pending'
      updates.documentsApprovedBy = undefined
      updates.documentsApprovedAt = undefined
    }

    const employee = await Employee.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('department', 'name');
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, message: 'Profile updated', data: employee });
  } catch (error) {
    console.error('Update self error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to update profile: ' + (error.message || 'Unknown error') });
  }
};

// @desc    Bulk delete employees
// @route   DELETE /api/employees/bulk
// @access  Private (Admin only)
const bulkDeleteEmployees = async (req, res) => {
  try {
    const { employeeIds } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs array is required'
      });
    }

    const result = await Employee.deleteMany({ _id: { $in: employeeIds } });

    res.json({
      success: true,
      message: `${result.deletedCount} employees deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
        requestedCount: employeeIds.length
      }
    });
  } catch (error) {
    console.error('Bulk delete employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employees'
    });
  }
};

// @desc    Bulk update employees
// @route   PUT /api/employees/bulk
// @access  Private (Admin only)
const bulkUpdateEmployees = async (req, res) => {
  try {
    const { employeeIds, updateData } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs array is required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} employees updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        requestedCount: employeeIds.length
      }
    });
  } catch (error) {
    console.error('Bulk update employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employees'
    });
  }
};

// @desc    Bulk toggle employee status
// @route   PATCH /api/employees/bulk/toggle-status
// @access  Private (Admin only)
const bulkToggleEmployeeStatus = async (req, res) => {
  try {
    const { employeeIds, isActive } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs array is required'
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $set: { isActive } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} employees ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        requestedCount: employeeIds.length,
        isActive
      }
    });
  } catch (error) {
    console.error('Bulk toggle employee status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle employee status'
    });
  }
};

// @desc    Bulk assign department
// @route   PATCH /api/employees/bulk/assign-department
// @access  Private (Admin only)
const bulkAssignDepartment = async (req, res) => {
  try {
    const { employeeIds, departmentId } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs array is required'
      });
    }

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }

    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { $set: { department: departmentId } }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} employees assigned to department successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        requestedCount: employeeIds.length,
        department: department.name
      }
    });
  } catch (error) {
    console.error('Bulk assign department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign department'
    });
  }
};

// @desc    Admin reset employee password
// @route   PUT /api/employees/:id/password
// @access  Private (Admin only or edit_employees permission)
const resetEmployeePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const employee = await Employee.findById(req.params.id).select('+password');
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.password = newPassword; // hashed by pre-save hook
    await employee.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Reset employee password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
};

module.exports = {
  getEmployees,
  searchEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
  bulkDeleteEmployees,
  bulkUpdateEmployees,
  bulkToggleEmployeeStatus,
  bulkAssignDepartment,
  resetEmployeePassword,
  updateMe,
  getManagerTeam
};
