import React from 'react';

export function LoadingSpinner({ size = 'md', message = 'Loading...', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-b-2 border-green-600 ${sizeClasses[size]}`}
        aria-label="Loading"
      />
      {message && (
        <span className="mt-2 text-sm text-gray-600 animate-pulse">
          {message}
        </span>
      )}
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" message="Loading page..." />
    </div>
  );
}

export function TableLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
      <LoadingSpinner size="md" message="Loading data..." />
    </div>
  );
}

export default LoadingSpinner; 