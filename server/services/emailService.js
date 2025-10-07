const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (employee) => ({
    subject: `Welcome to Qassim Chamber - ${employee.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #fbbf24); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Qassim Chamber!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Hello ${employee.name}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Welcome to the Qassim Chamber family! We're excited to have you on board.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e3a8a;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Your Employee Information:</h3>
            <p><strong>Name:</strong> ${employee.name}</p>
            <p><strong>Position:</strong> ${employee.position || 'N/A'}</p>
            <p><strong>Department:</strong> ${employee.department?.name || 'N/A'}</p>
            <p><strong>Extension:</strong> ${employee.extension || 'N/A'}</p>
            <p><strong>Email:</strong> ${employee.email}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            You can now access the employee directory and update your profile information.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" 
               style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Employee Directory
            </a>
          </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Qassim Chamber. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  employeeUpdate: (employee, changes) => ({
    subject: `Employee Information Updated - ${employee.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #fbbf24); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Employee Information Updated</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Hello ${employee.name}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Your employee information has been updated in our system.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Updated Information:</h3>
            ${Object.entries(changes).map(([key, value]) => 
              `<p><strong>${key}:</strong> ${value}</p>`
            ).join('')}
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            If you have any questions about these changes, please contact your HR department.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Qassim Chamber. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (user, resetLink) => ({
    subject: 'Password Reset Request - Qassim Chamber',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #fbbf24); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Hello ${user.username}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            We received a request to reset your password for your Qassim Chamber account.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #6b7280;">
            This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Qassim Chamber. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  newEmployeeNotification: (employee, manager) => ({
    subject: `New Employee Added - ${employee.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #fbbf24); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">New Employee Added</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Hello ${manager.username}!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            A new employee has been added to your department.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #1e3a8a; margin-top: 0;">New Employee Details:</h3>
            <p><strong>Name:</strong> ${employee.name}</p>
            <p><strong>Position:</strong> ${employee.position || 'N/A'}</p>
            <p><strong>Department:</strong> ${employee.department?.name || 'N/A'}</p>
            <p><strong>Extension:</strong> ${employee.extension || 'N/A'}</p>
            <p><strong>Email:</strong> ${employee.email || 'N/A'}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/employees" 
               style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Employee Directory
            </a>
          </div>
        </div>
        <div style="background: #1f2937; padding: 20px; text-align: center; color: #9ca3af;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Qassim Chamber. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"Qassim Chamber" <${process.env.SMTP_USER || 'noreply@qassimchamber.com'}>`,
      to: to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, template, data) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail(recipient, template, data);
    results.push({ recipient, ...result });
  }
  
  return results;
};

// Send notification to managers when employee is added
const notifyManagers = async (employee) => {
  try {
    const User = require('../models/User');
    const managers = await User.find({ 
      role: { $in: ['manager', 'hr', 'admin'] },
      department: employee.department
    });

    if (managers.length > 0) {
      const recipients = managers.map(manager => manager.email).filter(email => email);
      if (recipients.length > 0) {
        await sendBulkEmails(recipients, 'newEmployeeNotification', { employee, manager: managers[0] });
      }
    }
  } catch (error) {
    console.error('Failed to notify managers:', error);
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  notifyManagers,
  emailTemplates
};
