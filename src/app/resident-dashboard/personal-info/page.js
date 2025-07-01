"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Edit2, 
  Save, 
  X, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function PersonalInfo() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditData({
        firstName: parsedUser.firstName || '',
        middleName: parsedUser.middleName || '',
        lastName: parsedUser.lastName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        birthdate: parsedUser.birthdate || '',
        address: {
          street: parsedUser.address?.street || '',
          barangay: parsedUser.address?.barangay || '',
          city: parsedUser.address?.city || '',
          province: parsedUser.address?.province || '',
          zipCode: parsedUser.address?.zipCode || ''
        }
      });
    } else {
      // Create a test user for debugging if no user is found
      const testUser = {
        id: 'test-resident-001',
        residentId: 'RES-2024-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '09123456789'
      };
      
      console.log('No user found, creating test user for debugging:', testUser);
      localStorage.setItem('user', JSON.stringify(testUser));
      setUser(testUser);
      setEditData({
        firstName: testUser.firstName || '',
        middleName: testUser.middleName || '',
        lastName: testUser.lastName || '',
        email: testUser.email || '',
        phone: testUser.phone || '',
        birthdate: testUser.birthdate || '',
        address: {
          street: '',
          barangay: '',
          city: '',
          province: '',
          zipCode: ''
        }
      });
    }
    
    // Check for pending updates
    checkPendingUpdates();
    setLoading(false);
  }, [router]);

  const checkPendingUpdates = async () => {
    try {
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
      console.log('Checking pending updates:', pendingUpdates);
      console.log('Current user ID:', user?.residentId || user?.id);
      
      const userPendingUpdate = pendingUpdates.find(update => 
        update.residentId === (user?.residentId || user?.id) && 
        update.status === 'pending'
      );
      console.log('Found pending update:', userPendingUpdate);
      setHasPendingUpdate(!!userPendingUpdate);

      // Also check for approval/rejection notifications
      if (user?.residentId || user?.id) {
        try {
          const response = await fetch(`/api/notifications?residentId=${user.residentId || user.id}&type=info_update_approved,info_update_rejected&limit=1`);
          if (response.ok) {
            const data = await response.json();
            const approvalNotifications = data.notifications || [];
            
            // If there's an approval notification, update user data and clear pending status
            const approvalNotification = approvalNotifications.find(n => n.type === 'info_update_approved');
            if (approvalNotification && userPendingUpdate) {
              // Update user data with approved changes
              const updatedUser = {
                ...user,
                ...userPendingUpdate.requestedChanges
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
              
              // Remove from pending updates
              const filteredUpdates = pendingUpdates.filter(u => u.id !== userPendingUpdate.id);
              localStorage.setItem('pendingUpdates', JSON.stringify(filteredUpdates));
              setHasPendingUpdate(false);
            }
            
            // If there's a rejection notification, just clear pending status
            const rejectionNotification = approvalNotifications.find(n => n.type === 'info_update_rejected');
            if (rejectionNotification && userPendingUpdate) {
              // Remove from pending updates
              const filteredUpdates = pendingUpdates.filter(u => u.id !== userPendingUpdate.id);
              localStorage.setItem('pendingUpdates', JSON.stringify(filteredUpdates));
              setHasPendingUpdate(false);
            }
          }
        } catch (apiError) {
          console.error('Error checking approval notifications:', apiError);
        }
      }
    } catch (error) {
      console.error('Error checking pending updates:', error);
    }
  };

  // Re-check pending updates when user changes
  useEffect(() => {
    if (user) {
      checkPendingUpdates();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested object properties (like address.street)
      const [parent, child] = name.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Instead of immediately updating user data, create a pending update request
      const updateRequestId = `update_${Date.now()}_${user.residentId || user.id}`;
      const fullName = `${editData.firstName} ${editData.lastName}`.trim();
      
      // Store the pending update request in localStorage (in real app, this would go to database)
      const pendingUpdate = {
        id: updateRequestId,
        residentId: user.residentId || user.id,
        originalData: user,
        requestedChanges: editData,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestedBy: fullName
      };
      
      // Store pending updates in localStorage
      const existingPendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
      existingPendingUpdates.push(pendingUpdate);
      localStorage.setItem('pendingUpdates', JSON.stringify(existingPendingUpdates));
      
      // Create notification for admin about personal info update request using new structure
      try {
        console.log('=== RESIDENT NOTIFICATION CREATION ===');
        console.log('User data:', user);
        console.log('Update request ID:', updateRequestId);
        console.log('Full name:', fullName);
        
        const notificationPayload = {
          type: 'info_update_request',
          title: `${fullName} requested to update their profile`,
          message: `Information update request from ${user.residentId || user.id}. Please review and approve the changes.`,
          requestId: updateRequestId,
          targetRole: 'admin',
          senderUserId: user.residentId || user.id,
          relatedDocType: 'residents',
          actionRequired: true,
          priority: 'medium',
          redirectTarget: 'modal',
          status: 'pending',
          data: { // Embed the actual update data
            id: updateRequestId,
            residentId: user.residentId || user.id,
            requestedBy: fullName,
            requestedAt: new Date().toISOString(),
            status: 'pending',
            originalData: {
              firstName: user.firstName || '',
              middleName: user.middleName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
              birthdate: user.birthdate || '',
              address: {
                street: user.address?.street || '',
                barangay: user.address?.barangay || '',
                city: user.address?.city || '',
                province: user.address?.province || '',
                zipCode: user.address?.zipCode || ''
              }
            },
            requestedChanges: {
              firstName: editData.firstName,
              middleName: editData.middleName,
              lastName: editData.lastName,
              email: editData.email,
              phone: editData.phone,
              birthdate: editData.birthdate,
              address: {
                street: editData.address.street,
                barangay: editData.address.barangay,
                city: editData.address.city,
                province: editData.address.province,
                zipCode: editData.address.zipCode
              }
            }
          }
        };
        
        console.log('Notification payload:', notificationPayload);
        
        const notificationResponse = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationPayload)
        });
        
        console.log('Notification response status:', notificationResponse.status);
        console.log('Notification response ok:', notificationResponse.ok);
        
        if (notificationResponse.ok) {
          const notificationResult = await notificationResponse.json();
          console.log('Notification created successfully:', notificationResult);
        } else {
          const errorText = await notificationResponse.text();
          console.error('Failed to create notification:', errorText);
          console.error('Response status:', notificationResponse.status);
          console.error('Response headers:', notificationResponse.headers);
          throw new Error(`Notification creation failed: ${errorText}`);
        }
              } catch (notificationError) {
          console.error('Failed to create notification:', notificationError);
          console.error('Error details:', {
            message: notificationError.message,
            stack: notificationError.stack
          });
          
          // Still proceed with the local update process even if notification fails
          setIsEditing(false);
          setHasPendingUpdate(true);
          
          // Show warning but don't completely fail
          alert('Update request saved locally, but failed to notify admin. Please contact admin directly about your request.');
        }
      
      // Reset editing state without updating user data
      setIsEditing(false);
      setHasPendingUpdate(true); // Show pending status
      
      // Show success message
      alert('Update request submitted successfully! Please wait for admin approval. You will be notified once your changes are reviewed.');
    } catch (error) {
      console.error('Error submitting update request:', error);
      alert('Failed to submit update request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset edit data to original user data
    setEditData({
      firstName: user.firstName || '',
      middleName: user.middleName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      birthdate: user.birthdate || '',
      address: {
        street: user.address?.street || '',
        barangay: user.address?.barangay || '',
        city: user.address?.city || '',
        province: user.address?.province || '',
        zipCode: user.address?.zipCode || ''
      }
    });
    setIsEditing(false);
  };

  // Function to clear all pending updates (for debugging)
  const clearAllPendingUpdates = () => {
    localStorage.removeItem('pendingUpdates');
    setHasPendingUpdate(false);
    console.log('All pending updates cleared');
    alert('All pending updates cleared!');
  };

  // Function to clear pending updates for testing
  const clearPendingUpdates = () => {
    localStorage.removeItem('pendingUpdates');
    setHasPendingUpdate(false);
    console.log('Pending updates cleared');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Update Alert */}
      {hasPendingUpdate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Update Request Pending</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your information update request is being reviewed by the admin. You'll be notified once it's processed.
                </p>
              </div>
            </div>
            <button
              onClick={clearPendingUpdates}
              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Clear pending status (for testing)"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Personal Information</h1>
            <p className="text-blue-100 text-lg">Manage your personal details and contact information</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={hasPendingUpdate}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 border shadow-lg ${
                  hasPendingUpdate 
                    ? 'bg-gray-400/20 text-gray-300 border-gray-400/20 cursor-not-allowed' 
                    : 'bg-white/20 backdrop-blur-sm text-white border-white/20 hover:bg-white/30'
                }`}
              >
                <Edit2 className="w-5 h-5" />
                {hasPendingUpdate ? 'Update Pending' : 'Edit Information'}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/20 backdrop-blur-sm text-white rounded-lg hover:bg-red-500/30 transition-all duration-200 border border-red-300/20"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500/20 backdrop-blur-sm text-white rounded-lg hover:bg-green-500/30 transition-all duration-200 border border-green-300/20 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resident ID Card */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">
              {user ? `${user.firstName} ${user.lastName}` : 'Resident'}
            </h2>
            <p className="text-blue-100 mb-2">Verified Barangay Resident</p>
            {user?.residentId && (
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-sm font-mono font-bold">
                  ID: {user.residentId}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-blue-100 text-sm">Status</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
          <p className="text-gray-600 mt-1">Update your personal details below</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={editData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your first name"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-900 font-medium">{user?.firstName || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Middle Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="middleName"
                  value={editData.middleName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your middle name (optional)"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-900 font-medium">{user?.middleName || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={editData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your last name"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-900 font-medium">{user?.lastName || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email address"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="w-5 h-5 text-green-500" />
                  <span className="text-gray-900 font-medium">{user?.email || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-900 font-medium">{user?.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Birth Date</label>
              {isEditing ? (
                <input
                  type="date"
                  name="birthdate"
                  value={editData.birthdate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-900 font-medium">
                    {user?.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not provided'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Address Information</h3>
          <p className="text-gray-600 mt-1">Your current residential address</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Street */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.street"
                  value={editData.address?.street || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your street address"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-900 font-medium">{user?.address?.street || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Barangay</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.barangay"
                  value={editData.address?.barangay || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your barangay"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-900 font-medium">{user?.address?.barangay || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.city"
                  value={editData.address?.city || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your city"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-900 font-medium">{user?.address?.city || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Province</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.province"
                  value={editData.address?.province || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your province"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-900 font-medium">{user?.address?.province || 'Not provided'}</span>
                </div>
              )}
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Zip Code</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address.zipCode"
                  value={editData.address?.zipCode || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your zip code"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <span className="text-gray-900 font-medium">{user?.address?.zipCode || 'Not provided'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 