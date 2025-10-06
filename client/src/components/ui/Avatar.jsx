import React from 'react';
import { User } from 'lucide-react';

/**
 * Reusable Avatar component for user profile pictures
 */
const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'default',
  fallbackIcon = 'user',
  className = '',
  onClick = null,
  status = null, // 'online', 'offline', 'away'
  ...props
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
    '2xl': 'h-24 w-24',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    default: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
    xl: 'h-5 w-5',
    '2xl': 'h-6 w-6',
  };

  const baseClasses = `relative inline-flex items-center justify-center rounded-full bg-gray-300 text-gray-600 ${sizeClasses[size]} ${className}`;

  return (
    <div className="relative inline-block" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={baseClasses} {...props}>
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className={`${src ? 'hidden' : 'flex'} h-full w-full items-center justify-center rounded-full bg-gray-300 text-gray-600`}
        >
          <User className={`${sizeClasses[size]} p-1`} />
        </div>
      </div>
      
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full border-2 border-white ${statusColors[status]} ${statusSizes[size]}`}
        />
      )}
    </div>
  );
};

export default Avatar;
