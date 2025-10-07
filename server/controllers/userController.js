const Employee = require('../models/Employee');
const { ROLE_PERMISSIONS } = require('../middleware/permissions');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, department, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Role filter
    if (role) {
      query.role = role;
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Search filter
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await Employee.find(query)
      .select('-password')
      .populate('department', 'name')
      .populate('employeeId', 'name position')
      .populate('manager', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getEmployee = async (req, res) => {
  try {
    const user = await Employee.findById(req.params.id)
      .select('-password')
      .populate('department', 'name')
      .populate('employeeId', 'name position extension')
      .populate('manager', 'username email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if user can view this profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
const createEmployee = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role = 'employee',
      department,
      manager,
      employeeId,
      permissions = [],
      // Optional nested employee profile payload to auto-create an employee
      employeeProfile
    } = req.body;

    // Check if user already exists
    const existingEmployee = await Employee.findOne({
      $or: [{ username }, { email }]
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this username or email already exists'
      });
    }

    // Set default permissions based on role
    const defaultPermissions = ROLE_PERMISSIONS[role] || [];
    const userPermissions = permissions.length > 0 ? permissions : defaultPermissions;

    let resolvedEmployeeId = employeeId;

    // If an employee profile payload is provided, create the Employee first
    if (!resolvedEmployeeId && employeeProfile) {
      const { name, extension, department: employeeDepartment, email: employeeEmail, phone, position, avatar, isActive } = employeeProfile;

      // Validate minimal required fields for Employee
      if (!name) {
        return res.status(400).json({ success: false, message: 'Employee name is required' });
      }
      if (!extension || !/^\d{3,6}$/.test(String(extension))) {
        return res.status(400).json({ success: false, message: 'Employee extension must be 3-6 digits' });
      }
      if (!employeeDepartment) {
        return res.status(400).json({ success: false, message: 'Employee department ID is required' });
      }

      // Ensure extension unique
      const existingExtension = await Employee.findOne({ extension: String(extension) });
      if (existingExtension) {
        return res.status(400).json({ success: false, message: 'Employee with this extension already exists' });
      }

      // Create the employee
      const newEmployee = new Employee({
        name,
        extension: String(extension),
        department: employeeDepartment,
        email: employeeEmail,
        phone,
        position,
        avatar,
        isActive: typeof isActive === 'boolean' ? isActive : true
      });
      await newEmployee.save();
      resolvedEmployeeId = newEmployee._id;
    }

    const user = new Employee({
      username,
      email,
      password,
      role,
      department,
      manager,
      employeeId: resolvedEmployeeId,
      permissions: userPermissions
    });

    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateEmployee = async (req, res) => {
  try {
    const {
      username,
      email,
      role,
      department,
      manager,
      employeeId,
      permissions,
      isActive
    } = req.body;

    const user = await Employee.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only admin can change role and permissions
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.permissions;
    }

    // Update user
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    });

    await user.save();

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const user = await Employee.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Prevent deleting own account
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await Employee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// @desc    Get user permissions
// @route   GET /api/users/permissions
// @access  Private
const getEmployeePermissions = async (req, res) => {
  try {
    const user = await Employee.findById(req.user.id).select('role permissions');
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const allPermissions = [...new Set([...rolePermissions, ...user.permissions])];

    res.json({
      success: true,
      data: {
        role: user.role,
        permissions: allPermissions
      }
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user permissions'
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await Employee.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeePermissions,
  changePassword
};
