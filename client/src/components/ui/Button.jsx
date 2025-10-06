import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

const Button = memo(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none';
  
  const variants = {
    primary: 'bg-qassim-blue hover:bg-qassim-blue-dark text-white focus:ring-qassim-blue',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
    outline: 'border-2 border-qassim-blue text-qassim-blue hover:bg-qassim-blue hover:text-white focus:ring-qassim-blue',
    ghost: 'text-qassim-blue hover:bg-qassim-blue/10 focus:ring-qassim-blue',
    gold: 'bg-qassim-gold hover:bg-qassim-gold-dark text-qassim-blue focus:ring-qassim-gold'
  };
  
  const sizes = {
    xs: 'px-3 py-2 text-xs min-h-[32px]', // Minimum 32px touch target
    sm: 'px-4 py-2.5 text-sm min-h-[36px]',
    md: 'px-5 py-3 text-sm min-h-[44px]', // Minimum 44px for primary actions
    lg: 'px-6 py-4 text-base min-h-[48px]',
    xl: 'px-8 py-5 text-lg min-h-[52px]'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;
  
  const isDisabled = disabled || loading;
  
  const renderIcon = () => {
    if (loading) {
      return <Loader2 className="animate-spin" />;
    }
    if (icon) {
      return icon;
    }
    return null;
  };
  
  const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <button
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {renderIcon() && iconPosition === 'left' && (
        <span className={`mr-2 ${iconSize}`}>
          {renderIcon()}
        </span>
      )}
      {children}
      {renderIcon() && iconPosition === 'right' && (
        <span className={`ml-2 ${iconSize}`}>
          {renderIcon()}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
