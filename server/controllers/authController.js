const Employee = require('../models/Employee');
const { generateToken } = require('../middleware/auth');
const Log = require('../models/Log');

// Mock users for development when database is not available
const mockAdminUser = {
  _id: 'admin123',
  username: 'admin',
  email: 'admin@company.com',
  role: 'admin',
  lastLogin: new Date()
};

const mockEmployeeUser = {
  _id: 'employee123',
  username: 'malek',
  email: 'malek@example.com',
  role: 'employee',
  lastLogin: new Date()
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, identifier, password } = req.body;
    const loginIdentifier = username || identifier;

    // Check if database is connected
    if (Employee.db.readyState !== 1) {
      console.log('⚠️ Database not connected');
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection unavailable' 
      });
    }

    // Find user by credentials (new model returns lean object or null)
    const found = await Employee.findByCredentials(loginIdentifier, password)
    if (!found || found.locked) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(found._id || found.id);

    // Log login activity (best-effort)
    try {
      await Log.createLog(found._id || found.id, 'LOGIN', 'SYSTEM', null, { loginTime: new Date() }, req);
    } catch {}

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: found._id || found.id,
          id: found._id || found.id, // Include both for compatibility
          username: found.username || found.name,
          email: found.email,
          role: found.role,
          lastLogin: found.lastLogin,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
          firstName: found.firstName,
          lastName: found.lastName,
          extension: found.extension,
          department: found.department,
          phone: found.phone,
          position: found.position,
          avatar: found.avatar
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, message: error.message || 'Login failed' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    try { await Log.createLog(req.user._id, 'LOGOUT', 'SYSTEM', null, { logoutTime: new Date() }, req) } catch {}
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          _id: req.user._id,
          id: req.user._id, // Include both for compatibility
          username: req.user.username || req.user.name,
          email: req.user.email,
          role: req.user.role,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          extension: req.user.extension,
          department: req.user.department,
          phone: req.user.phone,
          position: req.user.position,
          avatar: req.user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user information' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await Employee.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    try { await Log.createLog(req.user._id, 'UPDATE', 'USER', req.user._id, { action: 'password_change' }, req) } catch {}
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

module.exports = { login, logout, getMe, changePassword };
