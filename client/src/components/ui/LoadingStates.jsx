import React from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import Button from './Button';
import EmptyState from './EmptyState';
import QassimLoadingSpinner from './QassimLoadingSpinner';

/**
 * Universal loading spinner component
 */
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = 'Loading...',
  className = '' 
}) => {
  return (
    <QassimLoadingSpinner 
      size={size} 
      text={text} 
      className={className} 
    />
  );
};

/**
 * Loading overlay component
 */
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  text = 'Loading...',
  size = 'lg' 
}) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
        <LoadingSpinner size={size} text={text} />
      </div>
    </div>
  );
};

/**
 * Enhanced skeleton loading component with shimmer effect
 */
export const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  lines = 1,
  rounded = 'rounded-lg',
  variant = 'default'
}) => {
  const variants = {
    default: 'bg-gray-200',
    light: 'bg-gray-100',
    dark: 'bg-gray-300',
    blue: 'bg-blue-100',
  };

  if (lines === 1) {
    return (
      <div className={`animate-pulse ${variants[variant]} ${rounded} ${width} ${height} ${className} relative overflow-hidden`}>
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse ${variants[variant]} ${rounded} ${width} ${height} relative overflow-hidden`}
        >
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      ))}
    </div>
  );
};

/**
 * Table skeleton loader
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {/* Header skeleton */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={`header-${index}`} height="h-6" />
      ))}
    </div>
    
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="h-4" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Enhanced card skeleton loader
 */
export const CardSkeleton = ({ className = '', showAvatar = false }) => (
  <div className={`card p-6 ${className}`}>
    <div className="space-y-4">
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton width="w-12" height="h-12" rounded="rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton width="w-1/3" height="h-4" />
            <Skeleton width="w-1/4" height="h-3" />
          </div>
        </div>
      )}
      <Skeleton width="w-3/4" height="h-6" />
      <Skeleton height="h-4" />
      <Skeleton width="w-1/2" height="h-4" />
      <div className="flex gap-3">
        <Skeleton width="w-24" height="h-10" rounded="rounded-xl" />
        <Skeleton width="w-24" height="h-10" rounded="rounded-xl" />
      </div>
    </div>
  </div>
);

/**
 * Dashboard stats skeleton
 */
export const StatsSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} className="p-6" />
    ))}
  </div>
);

/**
 * Employee card skeleton
 */
export const EmployeeCardSkeleton = ({ className = '' }) => (
  <div className={`card p-6 ${className}`}>
    <div className="flex items-center space-x-4">
      <Skeleton width="w-16" height="h-16" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-1/2" height="h-5" />
        <Skeleton width="w-1/3" height="h-4" />
        <Skeleton width="w-1/4" height="h-3" />
      </div>
    </div>
  </div>
);

/**
 * Table row skeleton
 */
export const TableRowSkeleton = ({ columns = 4 }) => (
  <tr className="border-b border-gray-200">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <Skeleton width="w-full" height="h-4" />
      </td>
    ))}
  </tr>
);

/**
 * Error state component
 */
export const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data.',
  onRetry,
  retryText = 'Try Again',
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
    <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 mb-4 max-w-md">
      {message}
    </p>
    {onRetry && (
      <Button
        variant="outline"
        onClick={onRetry}
        icon={<RefreshCw className="w-4 h-4" />}
      >
        {retryText}
      </Button>
    )}
  </div>
);

// EmptyState is now imported from './EmptyState'
// Create a wrapper for backward compatibility
const EmptyStateWrapper = ({ title, message, actionText, onAction, icon, ...props }) => {
  const actions = actionText && onAction ? [
    <button
      key="action"
      onClick={onAction}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {actionText}
    </button>
  ] : [];

  return (
    <EmptyState
      title={title}
      description={message}
      icon={icon}
      actions={actions}
      {...props}
    />
  );
};

/**
 * Conditional loading wrapper
 */
export const ConditionalLoading = ({ 
  isLoading, 
  error, 
  isEmpty, 
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  ...props 
}) => {
  if (isLoading) {
    return loadingComponent || <LoadingSpinner {...props} />;
  }

  if (error) {
    return errorComponent || <ErrorState onRetry={props.onRetry} />;
  }

  if (isEmpty) {
    return emptyComponent || <EmptyStateWrapper {...props} />;
  }

  return children;
};

export default LoadingSpinner;
