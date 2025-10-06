/**
 * Centralized data formatting utilities
 */

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if doesn't match expected format
};

/**
 * Format extension number
 */
export const formatExtension = (extension) => {
  if (!extension) return 'N/A';
  return extension.toString();
};

/**
 * Format email with validation
 */
export const formatEmail = (email) => {
  if (!email) return 'N/A';
  return email.toLowerCase().trim();
};

/**
 * Format name (title case)
 */
export const formatName = (name) => {
  if (!name) return 'N/A';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format department name
 */
export const formatDepartment = (department) => {
  if (!department) return 'N/A';
  if (typeof department === 'object' && department.name) {
    return department.name;
  }
  return department.toString();
};

/**
 * Format employee code
 */
export const formatEmployeeCode = (code) => {
  if (!code) return 'N/A';
  return code.toString().padStart(4, '0');
};

/**
 * Format salary/currency
 */
export const formatCurrency = (amount, currency = 'SAR') => {
  if (!amount || isNaN(amount)) return 'N/A';
  
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format role name
 */
export const formatRole = (role) => {
  if (!role) return 'N/A';
  return role
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format boolean values
 */
export const formatBoolean = (value, trueText = 'Yes', falseText = 'No') => {
  if (value === null || value === undefined) return 'N/A';
  return value ? trueText : falseText;
};

/**
 * Format array as comma-separated string
 */
export const formatArray = (array, maxItems = 3) => {
  if (!array || !Array.isArray(array)) return 'N/A';
  if (array.length === 0) return 'None';
  if (array.length <= maxItems) return array.join(', ');
  return array.slice(0, maxItems).join(', ') + ` +${array.length - maxItems} more`;
};
