"use client";

import { useState } from 'react';
import { useNotifications } from './NotificationContext';

export default function NotificationTest() {
  const [testResult, setTestResult] = useState(null);
  const { notifications, refreshNotifications } = useNotifications();

  const testResidentNotification = async () => {
    try {
      // Get current user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const residentId = userData.uniqueId || userData.residentId || userData.id;
      
      if (!residentId) {
        setTestResult({ success: false, error: 'No resident ID found' });
        return;
      }

      // Create a test notification for the resident
      const testNotification = {
        type: 'info_update_approved',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working',
        targetRole: 'resident',
        targetUserId: residentId,
        senderUserId: 'admin-test',
        priority: 'medium',
        status: 'completed'
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testNotification)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Test notification created:', result);
        
        // Refresh notifications to see if it appears
        await refreshNotifications();
        
        setTestResult({ 
          success: true, 
          message: 'Test notification created successfully',
          notificationId: result.notification?.id 
        });
      } else {
        const errorText = await response.text();
        setTestResult({ success: false, error: errorText });
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  const testNotificationFetch = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const residentId = userData.uniqueId || userData.residentId || userData.id;
      
      const response = await fetch(`/api/notifications?targetRole=resident&residentId=${residentId}&limit=10`);
      const result = await response.json();
      
      setTestResult({ 
        success: true, 
        message: `Fetched ${result.notifications?.length || 0} notifications`,
        notifications: result.notifications 
      });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Notification Test</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Current Notifications:</strong>
          <div className="bg-gray-100 p-1 rounded text-xs max-h-20 overflow-auto">
            {notifications.map(n => (
              <div key={n.id} className="border-b border-gray-200 py-1">
                {n.title} - {n.type} - {n.targetRole}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testResidentNotification}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Test Create
          </button>
          <button
            onClick={testNotificationFetch}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
          >
            Test Fetch
          </button>
          <button
            onClick={refreshNotifications}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
          >
            Refresh
          </button>
        </div>
        
        {testResult && (
          <div>
            <strong>Test Result:</strong>
            <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 