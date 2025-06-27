import React from 'react';

// Screen reader friendly announcements
export const ScreenReaderAnnouncement = ({ message, priority = "polite" }) => (
  <div 
    className="sr-only" 
    aria-live={priority}
    aria-atomic="true"
  >
    {message}
  </div>
);

// Skip navigation link
export const SkipNavigation = () => (
  <a 
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    Skip to main content
  </a>
);

// Accessible chart wrapper with description
export const AccessibleChart = ({ 
  children, 
  title, 
  description, 
  data, 
  type = "chart",
  className = "" 
}) => (
  <div 
    className={`relative ${className}`}
    role="img"
    aria-labelledby={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    aria-describedby={`chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
  >
    <div className="sr-only">
      <h3 id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}>
        {title}
      </h3>
      <div id={`chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}>
        {description}
        {data && (
          <div>
            Data summary: {Array.isArray(data) ? 
              data.map((item, index) => 
                `${item.label || `Item ${index + 1}`}: ${item.value || item}`
              ).join(', ') : 
              JSON.stringify(data)
            }
          </div>
        )}
      </div>
    </div>
    {children}
  </div>
);

// High contrast mode toggle
export const HighContrastToggle = () => {
  const [highContrast, setHighContrast] = React.useState(false);
  
  React.useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
      title={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </button>
  );
};

// Font size adjuster
export const FontSizeAdjuster = () => {
  const [fontSize, setFontSize] = React.useState('normal');
  
  React.useEffect(() => {
    document.documentElement.classList.remove('text-sm', 'text-lg', 'text-xl');
    if (fontSize !== 'normal') {
      document.documentElement.classList.add(`text-${fontSize}`);
    }
  }, [fontSize]);
  
  return (
    <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Text Size:</span>
      <button
        onClick={() => setFontSize('sm')}
        className={`px-2 py-1 text-xs rounded ${fontSize === 'sm' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        aria-label="Small text size"
      >
        A
      </button>
      <button
        onClick={() => setFontSize('normal')}
        className={`px-2 py-1 text-sm rounded ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        aria-label="Normal text size"
      >
        A
      </button>
      <button
        onClick={() => setFontSize('lg')}
        className={`px-2 py-1 text-base rounded ${fontSize === 'lg' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        aria-label="Large text size"
      >
        A
      </button>
      <button
        onClick={() => setFontSize('xl')}
        className={`px-2 py-1 text-lg rounded ${fontSize === 'xl' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        aria-label="Extra large text size"
      >
        A
      </button>
    </div>
  );
};

// Keyboard navigation helper
export const KeyboardNavigationHelper = ({ children }) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab navigation enhancement
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation');
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  return children;
};

// Focus trap for modals
export const FocusTrap = ({ children, active = true }) => {
  const trapRef = React.useRef();
  
  React.useEffect(() => {
    if (!active || !trapRef.current) return;
    
    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);
  
  return (
    <div ref={trapRef}>
      {children}
    </div>
  );
};

// Accessible tooltip
export const AccessibleTooltip = ({ children, content, position = "top" }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const tooltipId = React.useId();
  
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg pointer-events-none ${positionClasses[position]}`}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
            'right-full top-1/2 -translate-y-1/2 -mr-1'
          }`}></div>
        </div>
      )}
    </div>
  );
};

// Loading state with progress indication
export const AccessibleLoading = ({ progress, message = "Loading..." }) => (
  <div 
    role="status" 
    aria-live="polite"
    className="flex flex-col items-center justify-center p-8"
  >
    <div className="relative w-16 h-16 mb-4">
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
      <div 
        className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"
        style={{
          animationDuration: '1s'
        }}
      ></div>
      {progress !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-blue-600">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
    <div className="text-center">
      <div className="text-gray-800 font-medium">{message}</div>
      {progress !== undefined && (
        <div className="mt-2 w-48 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
    <span className="sr-only">
      {progress !== undefined ? `Loading ${Math.round(progress)}% complete` : message}
    </span>
  </div>
);

export default {
  ScreenReaderAnnouncement,
  SkipNavigation,
  AccessibleChart,
  HighContrastToggle,
  FontSizeAdjuster,
  KeyboardNavigationHelper,
  FocusTrap,
  AccessibleTooltip,
  AccessibleLoading
}; 