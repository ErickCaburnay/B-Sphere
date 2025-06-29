import React from 'react';
import { Phone } from 'lucide-react';

export function ContactNumberInput({ 
  register, 
  errors, 
  name = 'contactNumber', 
  label = 'Contact Number', 
  required = false,
  placeholder = '0921 234 5678',
  className = '',
  ...props 
}) {
  const formatContactNumber = (value) => {
    // Remove all non-digits
    let numbers = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    if (numbers.length > 11) {
      numbers = numbers.substring(0, 11);
    }
    
    // If user starts typing without 0, add it for Philippine mobile numbers
    if (numbers.length > 0 && !numbers.startsWith('0')) {
      // If they start with 9, assume it's a Philippine mobile number
      if (numbers.startsWith('9')) {
        numbers = '0' + numbers;
      }
    }
    
    // Format the number: 0XXX XXX XXXX
    let formatted = '';
    if (numbers.length > 0) {
      if (numbers.length <= 4) {
        formatted = numbers;
      } else if (numbers.length <= 7) {
        formatted = `${numbers.substring(0, 4)} ${numbers.substring(4)}`;
      } else {
        formatted = `${numbers.substring(0, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7, 11)}`;
      }
    }
    
    return formatted;
  };

  const validateContactNumber = (value) => {
    if (!value && required) return `${label} is required`;
    if (!value) return true; // Allow empty if not required
    
    // Remove spaces and check if it's exactly 11 digits starting with 09
    const cleanNumber = value.replace(/\s/g, '');
    const isValid = /^09\d{9}$/.test(cleanNumber);
    
    if (!isValid) {
      return `${label} must be 11 digits starting with 09 (e.g., 0921 234 5678)`;
    }
    
    return true;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 text-left">
        <Phone className="h-4 w-4 inline mr-1" />
        <span>{label}</span>
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        {...register(name, {
          validate: validateContactNumber,
          pattern: {
            value: /^09\d{2}\s\d{3}\s\d{4}$/,
            message: `${label} must be in format: 0921 234 5678`
          }
        })}
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${className}`}
        placeholder={placeholder}
        onInput={(e) => {
          e.target.value = formatContactNumber(e.target.value);
        }}
        onKeyDown={(e) => {
          // Allow backspace, delete, tab, escape, enter, arrow keys
          if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow home, end
            (e.keyCode >= 35 && e.keyCode <= 36)) {
            return;
          }
          // Ensure that it is a number and stop the keypress
          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
          }
        }}
        {...props}
      />
      {errors[name] && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>⚠</span>
          <span>{errors[name].message}</span>
        </p>
      )}
    </div>
  );
}

// Utility function to clean contact number for database storage
export const cleanContactNumber = (contactNumber) => {
  if (!contactNumber) return null;
  return contactNumber.replace(/\s/g, ''); // Remove spaces for storage
};

// Utility function to format contact number for display
export const formatContactNumberDisplay = (contactNumber) => {
  if (!contactNumber) return '';
  
  // Remove all non-digits
  const numbers = contactNumber.replace(/\D/g, '');
  
  // Format as 0XXX XXX XXXX
  if (numbers.length === 11 && numbers.startsWith('09')) {
    return `${numbers.substring(0, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7, 11)}`;
  }
  
  return contactNumber; // Return as-is if not in expected format
}; 