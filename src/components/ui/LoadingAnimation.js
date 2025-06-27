import React from 'react';

const LoadingAnimation = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-8 flex flex-col items-center space-y-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/30 rounded-full animate-spin border-t-white"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-green-400/50"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-white text-center">
          <p className="text-lg font-medium">{message}</p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation; 