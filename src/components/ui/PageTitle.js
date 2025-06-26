import React from 'react';

const PageTitle = ({ 
  title, 
  subtitle, 
  showRedLine = true,
  className = "" 
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Title and Subtitle */}
      <div className="mb-6">
        <h1 className="text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 mt-2 text-lg">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Red Horizontal Line */}
      {showRedLine && (
        <div className="w-full h-1 bg-red-300 rounded-full"></div>
      )}
    </div>
  );
};

export default PageTitle; 