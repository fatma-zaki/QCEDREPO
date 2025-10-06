import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with error tracking services like Sentry here
      console.error('Production error:', { error, errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, onRetry }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    onRetry();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="card p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're sorry, but something unexpected happened. This might be a temporary issue.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                Error Details (Development):
              </p>
              <p className="text-xs text-red-600 dark:text-red-300 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
