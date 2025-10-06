import React, { memo } from 'react';

const Card = memo(({
  children,
  title,
  subtitle,
  header,
  footer,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  className = '',
  hover = false,
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };
  
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  
  const baseClasses = 'bg-white border border-gray-200';
  const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${hoverClass} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {header && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          {header}
        </div>
      )}
      
      {title && (
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={title || header ? '' : ''}>
        {children}
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = memo(({ children, className = '', ...props }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardBody = memo(({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
));

CardBody.displayName = 'CardBody';

export const CardFooter = memo(({ children, className = '', ...props }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export default Card;
