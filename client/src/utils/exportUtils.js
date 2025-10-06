/**
 * Universal export utilities for CSV, Excel, and other formats
 */

/**
 * Convert data to CSV format
 */
export const toCSV = (data, options = {}) => {
  const {
    headers = [],
    fields = [],
    filename = 'export.csv',
    delimiter = ',',
    includeHeaders = true
  } = options;

  if (!data || data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers.length > 0 
    ? headers 
    : fields.length > 0 
      ? fields 
      : Object.keys(data[0]);

  // Escape CSV values
  const escape = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    return stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')
      ? `"${stringValue.replace(/"/g, '""')}"`
      : stringValue;
  };

  // Create CSV rows
  const rows = [];
  
  if (includeHeaders) {
    rows.push(csvHeaders.map(escape).join(delimiter));
  }

  data.forEach(item => {
    const values = csvHeaders.map(header => {
      const value = fields.length > 0 
        ? getNestedValue(item, header)
        : item[header];
      return escape(value);
    });
    rows.push(values.join(delimiter));
  });

  return rows.join('\n');
};

/**
 * Convert data to Excel format (HTML table that Excel can open)
 */
export const toExcel = (data, options = {}) => {
  const {
    headers = [],
    fields = [],
    filename = 'export.xls',
    sheetName = 'Sheet1'
  } = options;

  if (!data || data.length === 0) {
    return '';
  }

  const excelHeaders = headers.length > 0 
    ? headers 
    : fields.length > 0 
      ? fields 
      : Object.keys(data[0]);

  const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const headerRow = `<tr>${excelHeaders.map(header => 
    `<th>${escapeHtml(header)}</th>`
  ).join('')}</tr>`;

  const dataRows = data.map(item => {
    const values = excelHeaders.map(header => {
      const value = fields.length > 0 
        ? getNestedValue(item, header)
        : item[header];
      return `<td>${escapeHtml(value)}</td>`;
    });
    return `<tr>${values.join('')}</tr>`;
  }).join('');

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${escapeHtml(sheetName)}">
  <Table>
   ${headerRow}
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;
};

/**
 * Convert data to JSON format
 */
export const toJSON = (data, options = {}) => {
  const {
    filename = 'export.json',
    pretty = true
  } = options;

  return pretty 
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);
};

/**
 * Download file with given content and filename
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export data in specified format
 */
export const exportData = (data, format, options = {}) => {
  const {
    filename,
    ...formatOptions
  } = options;

  let content;
  let mimeType;
  let fileExtension;

  switch (format.toLowerCase()) {
    case 'csv':
      content = toCSV(data, formatOptions);
      mimeType = 'text/csv;charset=utf-8;';
      fileExtension = 'csv';
      break;
    
    case 'excel':
    case 'xls':
    case 'xlsx':
      content = toExcel(data, formatOptions);
      mimeType = 'application/vnd.ms-excel';
      fileExtension = 'xls';
      break;
    
    case 'json':
      content = toJSON(data, formatOptions);
      mimeType = 'application/json';
      fileExtension = 'json';
      break;
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  const finalFilename = filename || `export.${fileExtension}`;
  downloadFile(content, finalFilename, mimeType);
};

/**
 * Predefined export configurations
 */
export const exportConfigs = {
  employees: {
    csv: {
      headers: ['Name', 'Email', 'Extension', 'Department', 'Role', 'Status'],
      fields: ['name', 'email', 'extension', 'department.name', 'role', 'status'],
      filename: 'employees.csv'
    },
    excel: {
      headers: ['Name', 'Email', 'Extension', 'Department', 'Role', 'Status'],
      fields: ['name', 'email', 'extension', 'department.name', 'role', 'status'],
      filename: 'employees.xls',
      sheetName: 'Employees'
    }
  },
  
  departments: {
    csv: {
      headers: ['Name', 'Description', 'Organizational Code', 'Level'],
      fields: ['name', 'description', 'organizationalCode', 'level'],
      filename: 'departments.csv'
    },
    excel: {
      headers: ['Name', 'Description', 'Organizational Code', 'Level'],
      fields: ['name', 'description', 'organizationalCode', 'level'],
      filename: 'departments.xls',
      sheetName: 'Departments'
    }
  }
};

/**
 * Hook for export functionality
 */
export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(async (data, format, options = {}) => {
    setIsExporting(true);
    
    try {
      // If data is a function, call it to get the data
      const actualData = typeof data === 'function' ? await data() : data;
      
      exportData(actualData, format, options);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportData,
    isExporting
  };
};

/**
 * Helper function to get nested object values
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object') {
      return current[key];
    }
    return undefined;
  }, obj);
};

/**
 * Format data for export (clean up, transform, etc.)
 */
export const formatDataForExport = (data, formatters = {}) => {
  return data.map(item => {
    const formatted = { ...item };
    
    Object.entries(formatters).forEach(([field, formatter]) => {
      if (formatted[field] !== undefined) {
        formatted[field] = formatter(formatted[field]);
      }
    });
    
    return formatted;
  });
};

/**
 * Common data formatters
 */
export const formatters = {
  date: (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  },
  
  currency: (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  },
  
  boolean: (value) => value ? 'Yes' : 'No',
  
  capitalize: (value) => {
    if (!value) return '';
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  },
  
  truncate: (maxLength = 50) => (value) => {
    if (!value) return '';
    const stringValue = String(value);
    return stringValue.length > maxLength 
      ? stringValue.substring(0, maxLength) + '...'
      : stringValue;
  }
};

export default exportData;
