"use client";

import React from 'react';

const SmartHomeLoader = ({ size = 80, color = "#14B8A6", message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div 
        className="relative animate-pulse"
        style={{ width: size, height: size }}
      >
        {/* Outer rotating ring */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ 
            borderTopColor: color,
            borderRightColor: color,
            opacity: 0.6,
            animationDuration: '2s'
          }}
        />
        
        {/* Inner rotating ring - opposite direction */}
        <div 
          className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
          style={{ 
            borderBottomColor: color,
            borderLeftColor: color,
            opacity: 0.4,
            animationDuration: '1.5s',
            animationDirection: 'reverse'
          }}
        />
        
        {/* Central house icon */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ color }}
        >
          <svg 
            width={size * 0.4} 
            height={size * 0.4} 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            {/* House shape */}
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
        
        {/* Circuit connection dots - animated */}
        <div className="absolute inset-0">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                backgroundColor: color,
                top: `${20 + Math.sin(index * Math.PI / 2) * 30}%`,
                left: `${50 + Math.cos(index * Math.PI / 2) * 30}%`,
                animationDelay: `${index * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
        
        {/* Circuit board lines with flowing energy */}
        <div className="absolute inset-0">
          {[0, 1, 2, 3].map((index) => {
            const angle = index * Math.PI / 2;
            const startX = 50;
            const startY = 50;
            const endX = 50 + Math.cos(angle) * 35;
            const endY = 50 + Math.sin(angle) * 35;
            
            return (
              <div key={`circuit-${index}`} className="absolute inset-0">
                {/* Static circuit line */}
                <div
                  className="absolute"
                  style={{
                    width: '2px',
                    height: `${Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) * 0.8}%`,
                    backgroundColor: color,
                    opacity: 0.3,
                    top: `${startY}%`,
                    left: `${startX}%`,
                    transform: `rotate(${angle * 180 / Math.PI}deg)`,
                    transformOrigin: 'top center'
                  }}
                />
                
                {/* Flowing energy pulse */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`,
                    top: `${startY}%`,
                    left: `${startX}%`,
                    transform: 'translate(-50%, -50%)',
                    animation: `flow-${index} 2s infinite linear`,
                    animationDelay: `${index * 0.5}s`
                  }}
                />
                
                {/* CSS keyframes for flowing animation */}
                <style jsx>{`
                  @keyframes flow-${index} {
                    0% {
                      top: ${startY}%;
                      left: ${startX}%;
                      opacity: 0;
                    }
                    20% {
                      opacity: 1;
                    }
                    80% {
                      opacity: 1;
                    }
                    100% {
                      top: ${endY}%;
                      left: ${endX}%;
                      opacity: 0;
                    }
                  }
                `}</style>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Loading message */}
      {message && (
        <div className="mt-4 text-center">
          <span className="text-lg font-medium text-gray-700">{message}</span>
        </div>
      )}
    </div>
  );
};

export default SmartHomeLoader; 