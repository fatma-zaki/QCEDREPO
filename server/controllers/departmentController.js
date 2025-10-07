const Department = require('../models/Department');
const Employee = require('../models/Employee');

// Helper function to ensure only one manager per department
const enforceOneManagerPerDepartment = async (departmentId, newManagerId) => {
  if (!newManagerId) return true; // No manager assigned
  
  // Check if the new manager is already a manager of another department
  const existingDepartment = await Department.findOne({ 
    head: newManagerId, 
    _id: { $ne: departmentId } 
  });
  
  if (existingDepartment) {
    throw new Error(`Employee is already a manager of ${existingDepartment.name} department`);
  }
  
  return true;
};

// Mock data for development when database is not available
const mockDepartments = [
  { _id: '1', name: 'IT', description: 'Information Technology' },
  { _id: '2', name: 'HR', description: 'Human Resources' },
  { _id: '3', name: 'Finance', description: 'Finance Department' }
];

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('employeeCount')
      .sort({ name: 1 });

    // Add employee count to each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          employeeCount
        };
      })
    );

    res.json({
      success: true,
      count: departmentsWithCount.length,
      data: departmentsWithCount
    });
  } catch (error) {
    console.error('Get departments error:', error);
    
    // Fallback to mock data
    console.log('⚠️ Using mock departments as fallback');
    res.json({
      success: true,
      count: mockDepartments.length,
      data: mockDepartments
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Public
const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('employeeCount');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department'
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
const createDepartment = async (req, res) => {
  try {
    const { name, description, organizationalCode, level } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Create department data object
    const departmentData = {
      name,
      description: description || '',
      level: level || 'department'
    };

    // Add organizationalCode if provided
    if (organizationalCode) {
      departmentData.organizationalCode = organizationalCode;
    }

    const department = new Department(departmentData);
    await department.save();

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create department'
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
const updateDepartment = async (req, res) => {
  try {
    const { name, description, organizationalCode, level, head } = req.body;

    // Check if department exists
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if another department with same name exists
    const existingDepartment = await Department.findOne({ 
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Enforce one manager per department constraint
    if (head) {
      try {
        await enforceOneManagerPerDepartment(req.params.id, head);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    // Update department fields
    department.name = name;
    if (description !== undefined) department.description = description;
    if (organizationalCode !== undefined) department.organizationalCode = organizationalCode;
    if (level !== undefined) department.level = level;
    if (head !== undefined) department.head = head;
    
    await department.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Update department error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update department'
    });
  }
};

// @desc    Assign manager to department
// @route   PUT /api/departments/:id/manager
// @access  Private (Admin only)
const assignManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const departmentId = req.params.id;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if manager exists
    if (managerId) {
      const manager = await Employee.findById(managerId);
      if (!manager) {
        return res.status(404).json({
          success: false,
          message: 'Manager not found'
        });
      }

      // Check if manager has manager role
      if (manager.role !== 'manager') {
        return res.status(400).json({
          success: false,
          message: 'Employee must have manager role to be assigned as department head'
        });
      }
    }

    // Enforce one manager per department constraint
    try {
      await enforceOneManagerPerDepartment(departmentId, managerId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Update department head
    department.head = managerId;
    await department.save();

    // Populate the manager details
    await department.populate('head', 'firstName lastName email role');

    res.json({
      success: true,
      message: managerId ? 'Manager assigned successfully' : 'Manager removed successfully',
      data: department
    });
  } catch (error) {
    console.error('Assign manager error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign manager'
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res) => {
  try {
    // Check if department exists
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({ department: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. It has ${employeeCount} employee(s). Please reassign or delete employees first.`
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department'
    });
  }
};

// @desc    Get employees in a department
// @route   GET /api/departments/:id/employees
// @access  Public
const getDepartmentEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    // Check if department exists
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const query = { department: req.params.id };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { extension: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ firstName: 1 })
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
    console.error('Get department employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department employees'
    });
  }
};

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  assignManager,
  deleteDepartment,
  getDepartmentEmployees
};
