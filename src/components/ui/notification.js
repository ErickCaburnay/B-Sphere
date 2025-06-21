"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export function Notification({ type, message, onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Allow fade-out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  let bgColorClass = 'bg-gray-700';
  let icon = <Info size={20} className="text-white" />;

  switch (type) {
    case 'success':
      bgColorClass = 'bg-green-600';
      icon = <CheckCircle size={20} className="text-white" />;
      break;
    case 'error':
      bgColorClass = 'bg-red-600';
      icon = <XCircle size={20} className="text-white" />;
      break;
    case 'info':
      bgColorClass = 'bg-blue-600';
      icon = <Info size={20} className="text-white" />;
      break;
    default:
      break;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 text-white transition-all duration-300 transform
        ${bgColorClass} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
      style={{ zIndex: 1000 }}
    >
      {icon}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300);
        }
      }} className="ml-auto p-1 rounded-full hover:bg-white/20">
        <X size={16} className="text-white" />
      </button>
    </div>
  );
} 