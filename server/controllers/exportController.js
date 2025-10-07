const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Employee = require('../models/Employee');
const Department = require('../models/Department');

// @desc    Export employees to CSV or Excel
// @route   GET /api/export/employees
// @access  Private (Authenticated users)
const exportEmployees = async (req, res) => {
  try {
    const { 
      type = 'csv', 
      department = '', 
      isActive = '',
      search = '' 
    } = req.query;

    // Validate export type
    if (!['csv', 'excel'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export type. Use "csv" or "excel"'
      });
    }

    // Build query object
    const query = {};
    
    // Filter by department
    if (department) {
      query.department = department;
    }
    
    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { extension: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch employees with department information
    const employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ name: 1 });

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No employees found matching the criteria'
      });
    }

    // Prepare data for export
    const exportData = employees.map(employee => ({
      'Employee Name': employee.name,
      'Extension': employee.extension,
      'Department': employee.department?.name || 'N/A',
      'Position': employee.position || 'N/A',
      'Email': employee.email || 'N/A',
      'Phone': employee.phone || 'N/A',
      'Status': employee.isActive ? 'Active' : 'Inactive',
      'Created Date': employee.createdAt.toLocaleDateString(),
      'Last Updated': employee.updatedAt.toLocaleDateString()
    }));

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `employees_export_${timestamp}`;

    if (type === 'csv') {
      // Export to CSV
      const csvWriter = createCsvWriter({
        path: `./exports/${filename}.csv`,
        header: [
          { id: 'Employee Name', title: 'Employee Name' },
          { id: 'Extension', title: 'Extension' },
          { id: 'Department', title: 'Department' },
          { id: 'Position', title: 'Position' },
          { id: 'Email', title: 'Email' },
          { id: 'Phone', title: 'Phone' },
          { id: 'Status', title: 'Status' },
          { id: 'Created Date', title: 'Created Date' },
          { id: 'Last Updated', title: 'Last Updated' }
        ]
      });

      await csvWriter.writeRecords(exportData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      
      // Read and send the CSV file
      const fs = require('fs');
      const csvContent = fs.readFileSync(`./exports/${filename}.csv`);
      res.send(csvContent);
      
      // Clean up the file
      try {
        fs.unlinkSync(`./exports/${filename}.csv`);
      } catch (error) {
        console.warn('Failed to clean up temporary CSV file:', error.message);
      }

    } else if (type === 'excel') {
      // Export to Excel using ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees');

      // Add headers
      const headers = Object.keys(exportData[0]);
      worksheet.columns = headers.map(header => ({
        header: header,
        key: header,
        width: 20
      }));

      // Add data rows
      exportData.forEach(row => {
        worksheet.addRow(row);
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      // Generate Excel buffer
      const excelBuffer = await workbook.xlsx.writeBuffer();

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.send(excelBuffer);
    }

  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export employees'
    });
  }
};

module.exports = {
  exportEmployees
};
