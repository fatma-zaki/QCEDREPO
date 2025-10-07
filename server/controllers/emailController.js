const { sendEmail, sendBulkEmails, emailTemplates } = require('../services/emailService');
const Employee = require('../models/Employee');
// const User = require('../models/Emplyee');

// @desc    Send welcome email to employee
// @route   POST /api/email/welcome/:employeeId
// @access  Private (HR/Admin only)
const sendWelcomeEmail = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId)
      .populate('department', 'name');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    if (!employee.email) {
      return res.status(400).json({
        success: false,
        message: 'Employee does not have an email address'
      });
    }

    const result = await sendEmail(employee.email, 'welcome', employee);

    if (result.success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email'
      });
    }
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email'
    });
  }
};

// @desc    Send bulk emails to employees
// @route   POST /api/email/bulk
// @access  Private (HR/Admin only)
const sendBulkEmail = async (req, res) => {
  try {
    const { employeeIds, template, customData } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs array is required'
      });
    }

    if (!template || !emailTemplates[template]) {
      return res.status(400).json({
        success: false,
        message: 'Valid email template is required'
      });
    }

    const employees = await Employee.find({ 
      _id: { $in: employeeIds },
      email: { $exists: true, $ne: null }
    }).populate('department', 'name');

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No employees with email addresses found'
      });
    }

    const recipients = employees.map(emp => emp.email);
    const results = await sendBulkEmails(recipients, template, { ...customData, employees });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Bulk email sent to ${successCount} employees`,
      data: {
        total: results.length,
        success: successCount,
        failed: failureCount,
        results
      }
    });
  } catch (error) {
    console.error('Send bulk email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk email'
    });
  }
};

// @desc    Send announcement to all employees
// @route   POST /api/email/announcement
// @access  Private (Admin only)
const sendAnnouncement = async (req, res) => {
  try {
    const { subject, message, departments } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    let query = { email: { $exists: true, $ne: null } };
    
    if (departments && departments.length > 0) {
      query.department = { $in: departments };
    }

    const employees = await Employee.find(query)
      .populate('department', 'name');

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No employees found to send announcement to'
      });
    }

    // Create custom email template for announcement
    const announcementTemplate = {
      subject: `Announcement: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #fbbf24); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">${subject}</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
              <div style="white-space: pre-line; line-height: 1.6; color: #374151;">${message}</div>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Best regards,<br>
              Qassim Chamber Management
            </p>
          </div>
          <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 Qassim Chamber. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const recipients = employees.map(emp => emp.email);
    const results = [];

    for (const recipient of recipients) {
      try {
        const transporter = require('../services/emailService').createTransporter();
        const mailOptions = {
          from: `"Qassim Chamber" <${process.env.SMTP_USER || 'noreply@qassimchamber.com'}>`,
          to: recipient,
          subject: announcementTemplate.subject,
          html: announcementTemplate.html
        };

        const result = await transporter.sendMail(mailOptions);
        results.push({ recipient, success: true, messageId: result.messageId });
      } catch (error) {
        results.push({ recipient, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Announcement sent to ${successCount} employees`,
      data: {
        total: results.length,
        success: successCount,
        failed: failureCount,
        results
      }
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send announcement'
    });
  }
};

// @desc    Get email templates
// @route   GET /api/email/templates
// @access  Private
const getEmailTemplates = async (req, res) => {
  try {
    const templates = Object.keys(emailTemplates).map(key => ({
      name: key,
      description: getTemplateDescription(key)
    }));

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email templates'
    });
  }
};

// Helper function to get template descriptions
const getTemplateDescription = (templateName) => {
  const descriptions = {
    welcome: 'Welcome email for new employees',
    employeeUpdate: 'Notification when employee information is updated',
    passwordReset: 'Password reset email',
    newEmployeeNotification: 'Notification to managers about new employees'
  };
  return descriptions[templateName] || 'Custom email template';
};

module.exports = {
  sendWelcomeEmail,
  sendBulkEmail,
  sendAnnouncement,
  getEmailTemplates
};
