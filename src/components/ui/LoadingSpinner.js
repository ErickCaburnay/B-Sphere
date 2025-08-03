import React from 'react';
import SmartHomeLoader from './SmartHomeLoader';

export function LoadingSpinner({ size = 'md', message = 'Loading...', className = '' }) {
  const sizeMapping = {
    sm: 40,
    md: 60,
    lg: 80,
    xl: 100
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <SmartHomeLoader 
        size={sizeMapping[size]} 
        message={message}
        color="#14B8A6"
      />
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <SmartHomeLoader size={120} message="Loading page..." />
    </div>
  );
}

export function TableLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <SmartHomeLoader size={80} message="Loading data..." />
    </div>
  );
}

export default LoadingSpinner; 