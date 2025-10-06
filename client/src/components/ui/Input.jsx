import React, { forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  type = 'text',
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  const baseClasses = 'block border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : isFocused 
      ? 'border-qassim-blue focus:ring-qassim-blue focus:border-qassim-blue' 
      : 'border-gray-300 focus:ring-qassim-blue focus:border-qassim-blue';
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const inputClasses = `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${widthClass} ${className}`;
  
  const handleFocus = (e) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`${inputClasses} ${leftIcon ? 'pl-10' : ''} ${(rightIcon || isPassword) ? 'pr-10' : ''}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {(rightIcon || isPassword) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isPassword ? (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            ) : (
              <span className="text-gray-400">
                {rightIcon}
              </span>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
