/**
 * Centralized date formatting and manipulation utilities
 */

/**
 * Format date to locale string with consistent options
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  try {
    return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date and time together
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  try {
    return new Date(date).toLocaleString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Unknown time';
  }
};

/**
 * Format time only
 */
export const formatTime = (date, options = {}) => {
  if (!date) return 'N/A';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  try {
    return new Date(date).toLocaleTimeString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};

/**
 * Create timestamp for exports
 */
export const createTimestamp = () => {
  return new Date().toISOString().replace(/[:.]/g, '-');
};

/**
 * Parse date safely
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    const today = new Date();
    const targetDate = new Date(date);
    
    return today.getDate() === targetDate.getDate() &&
           today.getMonth() === targetDate.getMonth() &&
           today.getFullYear() === targetDate.getFullYear();
  } catch (error) {
    return false;
  }
};

/**
 * Get date range for filtering
 */
export const getDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return { startDate, endDate };
};
