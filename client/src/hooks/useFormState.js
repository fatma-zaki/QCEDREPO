import { useState, useCallback } from 'react';

/**
 * Universal form state management hook
 * Handles form data, validation, submission, and reset logic
 */
export const useFormState = (initialData = {}, options = {}) => {
  const {
    onSubmit: onSubmitCallback,
    onReset: onResetCallback,
    validateOnChange = false,
    resetOnSubmit = false
  } = options;

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, [errors]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    updateField(name, fieldValue);
  }, [updateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    try {
      if (onSubmitCallback) {
        await onSubmitCallback(formData);
      }

      if (resetOnSubmit) {
        resetForm();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmitCallback, resetOnSubmit]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    
    if (onResetCallback) {
      onResetCallback();
    }
  }, [initialData, onResetCallback]);

  // Set form data (useful for editing)
  const setForm = useCallback((data) => {
    setFormData(data);
    setErrors({});
    setTouched({});
  }, []);

  // Set specific error
  const setError = useCallback((field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  // Set multiple errors
  const setMultipleErrors = useCallback((errorObj) => {
    setErrors(errorObj);
  }, []);

  // Validate field
  const validateField = useCallback((field, value, rules) => {
    if (!rules) return null;

    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) return error;
    }
    return null;
  }, [formData]);

  // Validate entire form
  const validateForm = useCallback((validationRules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const value = formData[field];
      const rules = validationRules[field];
      const error = validateField(field, value, rules);
      
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  return {
    // State
    formData,
    errors,
    touched,
    isSubmitting,
    
    // Actions
    handleChange,
    handleSubmit,
    updateField,
    resetForm,
    setForm,
    setError,
    setMultipleErrors,
    validateField,
    validateForm,
    
    // Utilities
    hasErrors: Object.keys(errors).length > 0,
    isFieldTouched: (field) => touched[field] || false,
    isFieldValid: (field) => !errors[field],
    isFormValid: Object.keys(errors).length === 0
  };
};

/**
 * Validation rules factory
 */
export const createValidationRules = {
  required: (message = 'This field is required') => (value) => 
    !value || (typeof value === 'string' && !value.trim()) ? message : null,
  
  minLength: (min, message) => (value) => 
    value && value.length < min ? (message || `Must be at least ${min} characters`) : null,
  
  maxLength: (max, message) => (value) => 
    value && value.length > max ? (message || `Must be no more than ${max} characters`) : null,
  
  email: (message = 'Invalid email address') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : null;
  },
  
  phone: (message = 'Invalid phone number') => (value) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return value && !phoneRegex.test(value) ? message : null;
  },
  
  pattern: (regex, message) => (value) => 
    value && !regex.test(value) ? message : null,
  
  match: (targetField, message) => (value, formData) => 
    value !== formData[targetField] ? message : null,
  
  custom: (validator, message) => (value, formData) => 
    !validator(value, formData) ? message : null
};

/**
 * Pre-built validation rule sets
 */
export const commonValidations = {
  email: [
    createValidationRules.required('Email is required'),
    createValidationRules.email()
  ],
  
  password: [
    createValidationRules.required('Password is required'),
    createValidationRules.minLength(6, 'Password must be at least 6 characters'),
    createValidationRules.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
  ],
  
  name: [
    createValidationRules.required('Name is required'),
    createValidationRules.minLength(2, 'Name must be at least 2 characters'),
    createValidationRules.maxLength(50, 'Name must be no more than 50 characters')
  ],
  
  phone: [
    createValidationRules.phone()
  ],
  
  extension: [
    createValidationRules.required('Extension is required'),
    createValidationRules.pattern(/^\d{3,6}$/, 'Extension must be 3-6 digits')
  ]
};
