'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AccountMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');

      // Clear cookies
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      localStorage.clear();
      router.push('/login');
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Account Icon Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <Image 
              src="/resources/account_icon.svg" 
              alt="Account" 
              width={16} 
              height={16}
              className="text-white"
            />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:block">
            {user.firstName} {user.lastName}
          </span>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 capitalize">{user.role}</p>
            </div>
            
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setShowLogoutModal(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Logout
              </h3>
              
              {/* Message */}
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>
              
              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  No, Not yet
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountMenu; 