"use client";

import { HelpCircle, Clock } from 'lucide-react';

export default function Module5() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Module 5</h1>
        <p className="text-gray-600">This module is coming soon</p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Module 5 - Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            This module is currently under development. We're working hard to bring you new features and functionality.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Expected release: Q2 2024</span>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Stay tuned!</strong> We'll notify all residents when this module becomes available.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-gray-600">Advanced resident support features</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-gray-600">Interactive help and guidance system</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-gray-600">Community engagement tools</p>
          </div>
        </div>
      </div>
    </div>
  );
} 