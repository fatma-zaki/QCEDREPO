const User = require('../models/Employee');

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  admin: [
    'view_employees',
    'create_employees',
    'edit_employees',
    'delete_employees',
    'view_departments',
    'create_departments',
    'edit_departments',
    'delete_departments',
    'view_analytics',
    'export_data',
    'manage_users',
    'view_audit_logs',
    'system_settings'
  ],
  hr: [
    'view_employees',
    'create_employees',
    'edit_employees',
    'view_departments',
    'view_analytics',
    'export_data'
  ],
  manager: [
    'view_employees',
    'edit_employees',
    'view_departments',
    'view_analytics'
  ],
  employee: [
    'view_employees'
  ]
};

// Middleware to check if user has specific permission
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      // Check if database is connected
      if (User.db.readyState !== 1) {
        console.log('⚠️ Database not connected');
        return res.status(503).json({
          success: false,
          message: 'Database connection unavailable'
        });
      }

      const user = await User.findById(req.user._id || req.user.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user has the required permission
      const hasPermission = user.permissions.includes(permission) || 
                           ROLE_PERMISSIONS[user.role]?.includes(permission);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      req.user.permissions = user.permissions;
      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user has any of the specified permissions
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id || req.user.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const hasAnyPermission = permissions.some(permission => 
        user.permissions.includes(permission) || 
        ROLE_PERMISSIONS[user.role]?.includes(permission)
      );

      if (!hasAnyPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      req.user.permissions = user.permissions;
      req.user.role = user.role;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id || req.user.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      const hasRole = Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role privileges'
        });
      }

      req.user.role = user.role;
      req.user.permissions = user.permissions;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Role check failed'
      });
    }
  };
};

// Middleware to filter data based on user role and department
const filterDataByRole = (req, res, next) => {
  const user = req.user;
  
  // Add role-based filters to request
  req.roleFilters = {};
  
  if (user.role === 'manager' || user.role === 'employee') {
    // Managers and employees can only see their department
    req.roleFilters.department = user.department;
  }
  
  if (user.role === 'employee') {
    // Employees can only see active employees
    req.roleFilters.isActive = true;
  }
  
  next();
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireRole,
  filterDataByRole,
  ROLE_PERMISSIONS
};
