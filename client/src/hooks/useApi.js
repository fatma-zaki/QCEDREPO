import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotifications } from '../components/NotificationSystem';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Custom hook for API calls with loading states and error handling
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { error: showError, success: showSuccess } = useNotifications();

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      showLoading = true,
      showErrorNotification = true,
      showSuccessNotification = false,
      successMessage = 'Operation completed successfully',
      errorMessage = 'An error occurred'
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await apiCall();
      
      if (showSuccessNotification && successMessage) {
        showSuccess(successMessage);
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      setError(errorMsg);
      
      if (showErrorNotification) {
        showError(errorMsg);
      }

      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [showError, showSuccess]);

  return { execute, loading, error, api };
};

/**
 * Hook for handling backend availability
 */
export const useBackendStatus = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const checkBackendStatus = useCallback(async () => {
    try {
      await api.get('/health');
      setIsBackendAvailable(true);
      setLastChecked(new Date());
    } catch (error) {
      setIsBackendAvailable(false);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    // Check on mount
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  return { isBackendAvailable, lastChecked, checkBackendStatus };
};

/**
 * Hook for API calls with retry logic
 */
export const useApiWithRetry = (maxRetries = 3, retryDelay = 1000) => {
  const { execute, loading, error } = useApi();

  const executeWithRetry = useCallback(async (apiCall, options = {}) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await execute(apiCall, options);
      } catch (err) {
        lastError = err;
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (err.response?.status >= 400 && err.response?.status < 500 && err.response?.status !== 429) {
          throw err;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw err;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    
    throw lastError;
  }, [execute, maxRetries, retryDelay]);

  return { executeWithRetry, loading, error };
};

export default api;
