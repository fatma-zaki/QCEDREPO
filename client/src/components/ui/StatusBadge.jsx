import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Unified Status Badge component for consistent status display
 */
const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'default',
  showIcon = true,
  className = '' 
}) => {
  const getStatusConfig = (status) => {
    const statusMap = {
      // Employee Status
      active: { 
        label: 'Active', 
        color: 'green', 
        icon: CheckCircle,
        bgClass: 'bg-green-100 text-green-800',
        borderClass: 'border-green-200'
      },
      inactive: { 
        label: 'Inactive', 
        color: 'red', 
        icon: XCircle,
        bgClass: 'bg-red-100 text-red-800',
        borderClass: 'border-red-200'
      },
      
      // General Status
      pending: { 
        label: 'Pending', 
        color: 'yellow', 
        icon: Clock,
        bgClass: 'bg-yellow-100 text-yellow-800',
        borderClass: 'border-yellow-200'
      },
      approved: { 
        label: 'Approved', 
        color: 'green', 
        icon: CheckCircle,
        bgClass: 'bg-green-100 text-green-800',
        borderClass: 'border-green-200'
      },
      rejected: { 
        label: 'Rejected', 
        color: 'red', 
        icon: XCircle,
        bgClass: 'bg-red-100 text-red-800',
        borderClass: 'border-red-200'
      },
      warning: { 
        label: 'Warning', 
        color: 'orange', 
        icon: AlertCircle,
        bgClass: 'bg-orange-100 text-orange-800',
        borderClass: 'border-orange-200'
      },
      
      // Message Status
      read: { 
        label: 'Read', 
        color: 'blue', 
        icon: CheckCircle,
        bgClass: 'bg-blue-100 text-blue-800',
        borderClass: 'border-blue-200'
      },
      unread: { 
        label: 'Unread', 
        color: 'gray', 
        icon: Clock,
        bgClass: 'bg-gray-100 text-gray-800',
        borderClass: 'border-gray-200'
      },
    };

    return statusMap[status] || {
      label: status,
      color: 'gray',
      icon: AlertCircle,
      bgClass: 'bg-gray-100 text-gray-800',
      borderClass: 'border-gray-200'
    };
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-sm',
    default: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-2.5 text-lg',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const variants = {
    default: `inline-flex items-center rounded-full border font-medium ${config.bgClass} ${config.borderClass}`,
    outline: `inline-flex items-center rounded-full border-2 ${config.borderClass} text-${config.color}-800 bg-white`,
    minimal: `inline-flex items-center rounded-md font-medium ${config.bgClass}`,
  };

  return (
    <span className={`${variants[variant]} ${sizeClasses[size]} ${className}`}>
      {showIcon && IconComponent && (
        <IconComponent className={`${iconSizes[size]} mr-1.5`} />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;
