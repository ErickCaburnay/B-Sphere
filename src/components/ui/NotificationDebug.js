"use client";

import { useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';

export default function NotificationDebug() {
  const [debugInfo, setDebugInfo] = useState({});
  const { notifications, unreadCount, loading, error, refreshNotifications } = useNotifications();

  const testNotificationCreation = async () => {
    try {
      const testPayload = {
        type: 'info_update_request',
        title: 'Test Notification from Debug',
        message: 'This is a test notification to verify the system is working',
        targetRole: 'admin',
        senderUserId: 'debug-test',
        priority: 'medium',
        status: 'pending'
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      const result = await response.json();
      console.log('Test notification creation result:', result);
      
      // Refresh notifications after creating test notification
      await refreshNotifications();
      
      setDebugInfo(prev => ({
        ...prev,
        testCreation: {
          success: response.ok,
          result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Test notification creation failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        testCreation: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testNotificationFetch = async () => {
    try {
      const response = await fetch('/api/notifications?targetRole=admin&limit=10');
      const result = await response.json();
      
      console.log('Test notification fetch result:', result);
      
      setDebugInfo(prev => ({
        ...prev,
        testFetch: {
          success: response.ok,
          result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Test notification fetch failed:', error);
      setDebugInfo(prev => ({
        ...prev,
        testFetch: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      contextState: {
        notificationsCount: notifications.length,
        unreadCount,
        loading,
        error,
        timestamp: new Date().toISOString()
      }
    }));
  }, [notifications.length, unreadCount, loading, error]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Notification Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Context State:</strong>
          <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo.contextState, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Notifications:</strong>
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
            onClick={testNotificationCreation}
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
        
        {debugInfo.testCreation && (
          <div>
            <strong>Test Creation:</strong>
            <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo.testCreation, null, 2)}
            </pre>
          </div>
        )}
        
        {debugInfo.testFetch && (
          <div>
            <strong>Test Fetch:</strong>
            <pre className="bg-gray-100 p-1 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo.testFetch, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 