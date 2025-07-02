"use client";

import { useState } from 'react';

export default function DebugAPI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testResidentAPI = async () => {
    setLoading(true);
    try {
      // Test getting all residents first
      const response = await fetch('/api/residents');
      const data = await response.json();
      
      console.log('All residents:', data);
      setResult(JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        const firstResident = data.data[0];
        console.log('First resident:', firstResident);
        
        // Test updating the first resident
        const updateData = {
          firstName: firstResident.firstName + '_UPDATED',
          updatedAt: new Date().toISOString()
        };
        
        const updateResponse = await fetch(`/api/residents/${firstResident.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        const updateResult = await updateResponse.json();
        console.log('Update result:', updateResult);
        
        setResult(prev => prev + '\n\nUpdate Result:\n' + JSON.stringify(updateResult, null, 2));
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkUserLocalStorage = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data from localStorage:', user);
        
        const info = {
          'localStorage user': user,
          'Available IDs': {
            'user.id': user.id,
            'user.uniqueId': user.uniqueId,
            'user.residentId': user.residentId,
            'user.firebaseUid': user.firebaseUid
          },
          'Recommendation': user.uniqueId || user.id || user.residentId
        };
        
        setResult(JSON.stringify(info, null, 2));
      } else {
        setResult('No user data found in localStorage');
      }
    } catch (error) {
      setResult('Error reading localStorage: ' + error.message);
    }
  };

  const testApprovalFlow = async () => {
    setLoading(true);
    try {
      // Get the notifications to see what we're working with
      const notificationsResponse = await fetch('/api/notifications?targetRole=admin&limit=10');
      if (!notificationsResponse.ok) {
        setResult('Failed to fetch notifications');
        return;
      }
      
      const notificationsData = await notificationsResponse.json();
      const infoUpdateNotifications = notificationsData.notifications.filter(n => n.type === 'info_update_request');
      
      if (infoUpdateNotifications.length === 0) {
        setResult('No info update request notifications found. Please create one from resident dashboard first.');
        return;
      }
      
      const notification = infoUpdateNotifications[0]; // Use the first one
      const pendingUpdate = notification.data; // Get the embedded data
      console.log('Testing approval flow with notification:', notification);
      console.log('Pending update from notification data:', pendingUpdate);
      
      let output = `Testing approval flow for resident: ${pendingUpdate.residentId}\n\n`;
      
      // Step 1: Check if resident exists
      console.log('Step 1: Checking if resident exists...');
      const checkResponse = await fetch(`/api/residents/${pendingUpdate.residentId}`);
      output += `Step 1 - Check resident (${pendingUpdate.residentId}):\n`;
      output += `Status: ${checkResponse.status}\n`;
      
      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        output += `Error: ${errorText}\n`;
        setResult(output);
        return;
      }
      
      const existingResident = await checkResponse.json();
      output += `Found resident: ${existingResident.firstName} ${existingResident.lastName}\n\n`;
      
      // Step 2: Test the update
      console.log('Step 2: Testing update...');
      const updateData = { ...pendingUpdate.requestedChanges };
      output += `Step 2 - Update data to send:\n${JSON.stringify(updateData, null, 2)}\n\n`;
      
      const updateResponse = await fetch(`/api/residents/${pendingUpdate.residentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      output += `Step 2 - Update response:\n`;
      output += `Status: ${updateResponse.status}\n`;
      
      if (updateResponse.ok) {
        const updatedResident = await updateResponse.json();
        output += `Update successful!\n`;
        output += `Updated resident: ${JSON.stringify(updatedResident, null, 2)}\n\n`;
        
        // Step 3: Verify the update by fetching again
        console.log('Step 3: Verifying update...');
        const verifyResponse = await fetch(`/api/residents/${pendingUpdate.residentId}`);
        if (verifyResponse.ok) {
          const verifiedResident = await verifyResponse.json();
          output += `Step 3 - Verification:\n`;
          output += `Updated resident from database: ${JSON.stringify(verifiedResident, null, 2)}\n`;
        }
      } else {
        const errorData = await updateResponse.json().catch(() => ({ error: 'Unknown error' }));
        output += `Update failed: ${JSON.stringify(errorData, null, 2)}\n`;
      }
      
      setResult(output);
    } catch (error) {
      console.error('Error in test approval flow:', error);
      setResult('Error in test approval flow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificResident = async () => {
    setLoading(true);
    try {
      const residentId = 'SF-000001';
      
      // Test getting specific resident
      console.log('Testing specific resident:', residentId);
      const getResponse = await fetch(`/api/residents/${residentId}`);
      console.log('GET response status:', getResponse.status);
      
      if (getResponse.ok) {
        const resident = await getResponse.json();
        console.log('Found resident:', resident);
        setResult(`Found resident:\n${JSON.stringify(resident, null, 2)}`);
        
        // Test updating this specific resident
        const updateData = {
          phone: '09123456777', // Change phone number
          email: 'updated@email.com'
        };
        
        console.log('Attempting to update with:', updateData);
        
        const updateResponse = await fetch(`/api/residents/${residentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        console.log('UPDATE response status:', updateResponse.status);
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('Update successful:', updateResult);
          setResult(prev => prev + '\n\nUpdate successful:\n' + JSON.stringify(updateResult, null, 2));
        } else {
          const errorData = await updateResponse.json();
          console.error('Update failed:', errorData);
          setResult(prev => prev + '\n\nUpdate failed:\n' + JSON.stringify(errorData, null, 2));
        }
      } else {
        const errorText = await getResponse.text();
        console.error('Resident not found:', errorText);
        setResult(`Resident not found: ${errorText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications?targetRole=admin&limit=5');
      const data = await response.json();
      
      console.log('Notifications:', data);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setResult('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={checkUserLocalStorage}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Check User localStorage
        </button>
        
        <button
          onClick={testApprovalFlow}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Approval Flow'}
        </button>
        
        <button
          onClick={testResidentAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Resident API'}
        </button>
        
        <button
          onClick={testSpecificResident}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test SF-000001 Resident'}
        </button>
        
        <button
          onClick={testNotifications}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Notifications API'}
        </button>
      </div>
      
      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
} 