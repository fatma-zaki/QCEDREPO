const QRCode = require('qrcode');
const Employee = require('../models/Employee');

// @desc    Generate QR code for employee
// @route   GET /api/qr/employee/:id
// @access  Private
const generateEmployeeQR = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('reportsTo', 'name position');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Create employee data for QR code
    const employeeData = {
      id: employee._id,
      name: employee.name,
      extension: employee.extension,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department?.name,
      manager: employee.manager?.name,
      qrGeneratedAt: new Date().toISOString()
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(employeeData), {
      width: 256,
      margin: 2,
      color: {
        dark: '#1e3a8a', // Qassim blue
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        employeeData,
        employee
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
};

// @desc    Generate QR code for contact sharing
// @route   GET /api/qr/contact/:id
// @access  Private
const generateContactQR = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Create vCard format for contact sharing
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${employee.name}`,
      `ORG:Qassim Chamber`,
      `TITLE:${employee.position || ''}`,
      `TEL:${employee.extension || ''}`,
      `EMAIL:${employee.email || ''}`,
      `NOTE:Department: ${employee.department?.name || ''}`,
      'END:VCARD'
    ].join('\n');

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(vCard, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        vCard,
        employee
      }
    });
  } catch (error) {
    console.error('Generate contact QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate contact QR code'
    });
  }
};

// @desc    Generate QR code for employee card
// @route   GET /api/qr/card/:id
// @access  Private
const generateEmployeeCardQR = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('reportsTo', 'name position');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Create employee card data
    const cardData = {
      type: 'employee_card',
      employeeId: employee._id,
      name: employee.name,
      extension: employee.extension,
      department: employee.department?.name,
      position: employee.position,
      avatar: employee.avatar,
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year validity
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(cardData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        cardData,
        employee
      }
    });
  } catch (error) {
    console.error('Generate employee card QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate employee card QR code'
    });
  }
};

// @desc    Bulk generate QR codes for multiple employees
// @route   POST /api/qr/bulk
// @access  Private
const generateBulkQR = async (req, res) => {
  try {
    const { employeeIds, type = 'employee_card' } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs array is required'
      });
    }

    const employees = await Employee.find({ _id: { $in: employeeIds } })
      .populate('department', 'name')
      .populate('reportsTo', 'name position');

    const qrCodes = [];

    for (const employee of employees) {
      let qrCodeDataURL;
      
      if (type === 'contact') {
        // Generate contact QR
        const vCard = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${employee.name}`,
          `ORG:Qassim Chamber`,
          `TITLE:${employee.position || ''}`,
          `TEL:${employee.extension || ''}`,
          `EMAIL:${employee.email || ''}`,
          `NOTE:Department: ${employee.department?.name || ''}`,
          'END:VCARD'
        ].join('\n');

        qrCodeDataURL = await QRCode.toDataURL(vCard, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1e3a8a',
            light: '#ffffff'
          }
        });
      } else {
        // Generate employee card QR
        const cardData = {
          type: 'employee_card',
          employeeId: employee._id,
          name: employee.name,
          extension: employee.extension,
          department: employee.department?.name,
          position: employee.position,
          avatar: employee.avatar,
          generatedAt: new Date().toISOString(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(cardData), {
          width: 256,
          margin: 2,
          color: {
            dark: '#1e3a8a',
            light: '#ffffff'
          }
        });
      }

      qrCodes.push({
        employeeId: employee._id,
        employeeName: employee.name,
        qrCode: qrCodeDataURL
      });
    }

    res.json({
      success: true,
      data: {
        qrCodes,
        count: qrCodes.length,
        type
      }
    });
  } catch (error) {
    console.error('Generate bulk QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulk QR codes'
    });
  }
};

module.exports = {
  generateEmployeeQR,
  generateContactQR,
  generateEmployeeCardQR,
  generateBulkQR
};
