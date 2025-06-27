import React from 'react';

// Mobile-optimized card wrapper
export const MobileCard = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Responsive grid container
export const ResponsiveGrid = ({ children, cols = "1 md:2 lg:3 xl:4" }) => (
  <div className={`grid grid-cols-${cols} gap-4 md:gap-6`}>
    {children}
  </div>
);

// Mobile-friendly filter section
export const MobileFilters = ({ children, title, subtitle }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 border-b border-gray-100">
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        {children}
      </div>
    </div>
  </div>
);

// Enhanced mobile-friendly select
export const MobileSelect = ({ label, icon, value, onChange, options, ...props }) => (
  <div className="relative group w-full sm:w-auto">
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Mobile-optimized stats display
export const MobileStats = ({ value, label, trend, color = "blue" }) => (
  <div className="text-center p-4">
    <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-${color}-600 to-${color === 'blue' ? 'indigo' : color}-600 bg-clip-text text-transparent mb-2`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-sm font-medium text-gray-600">{label}</div>
    {trend && (
      <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
        trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {trend}
      </div>
    )}
  </div>
);

// Loading skeleton for mobile
export const MobileSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
    <div className="space-y-3">
      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  </div>
);

// Error state for mobile
export const MobileError = ({ message, onRetry }) => (
  <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
    <div className="text-red-600 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
    <p className="text-red-600 text-sm mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Touch-friendly button
export const MobileButton = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-sm hover:shadow-md",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-sm hover:shadow-md"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-4 py-2 text-sm min-h-[40px]",
    lg: "px-6 py-3 text-base min-h-[44px]"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Collapsible section for mobile
export const MobileCollapsible = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gray-50 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-800">{title}</span>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default {
  MobileCard,
  ResponsiveGrid,
  MobileFilters,
  MobileSelect,
  MobileStats,
  MobileSkeleton,
  MobileError,
  MobileButton,
  MobileCollapsible
}; 