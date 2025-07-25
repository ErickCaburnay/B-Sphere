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
  Clock,
  Check,
  Upload,
  FileCheck,
  AlertCircle,
  Download,
  Trash2
} from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function PersonalInfo() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});
  const [hasPendingUpdate, setHasPendingUpdate] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const router = useRouter();

  // File upload functionality
  const {
    files,
    uploadProgress,
    errors: uploadErrors,
    isUploading,
    uploadedFiles,
    handleFileSelect,
    removeFile,
    deleteFile,
    handleUpload,
    clearAll
  } = useFileUpload('resident_documents', user?.uniqueId || '');

  useEffect(() => {
    const fetchResidentData = async () => {
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          console.error('No user data found in localStorage');
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        console.log('User data from localStorage:', parsedUser);

        // Try to get uniqueId from localStorage first
        let uniqueId = parsedUser.uniqueId || parsedUser.residentId;
        
        // If no uniqueId, try to find resident by Firebase UID
        if (!uniqueId && parsedUser.uid) {
          console.log('No uniqueId found, searching by Firebase UID:', parsedUser.uid);
          try {
            const searchResponse = await fetch(`/api/residents/search?firebaseUid=${parsedUser.uid}`);
            if (searchResponse.ok) {
              const searchResult = await searchResponse.json();
              if (searchResult.residents && searchResult.residents.length > 0) {
                const resident = searchResult.residents[0];
                uniqueId = resident.uniqueId;
                console.log('Found resident by Firebase UID:', resident);
                
                // Update localStorage with complete user data
                const updatedUserData = {
                  ...parsedUser,
                  uniqueId: resident.uniqueId,
                  residentId: resident.uniqueId, // For backward compatibility
                  ...resident
                };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
                console.log('Updated localStorage with complete user data');
              }
            }
          } catch (searchError) {
            console.error('Error searching by Firebase UID:', searchError);
          }
        }

        if (!uniqueId) {
          console.error('No uniqueId found in user data and could not find by Firebase UID');
          console.log('User data from localStorage:', parsedUser);
          // Try to use the id field as fallback
          uniqueId = parsedUser.id;
          if (!uniqueId) {
            router.push('/login');
            return;
          }
        }

        console.log('Fetching resident data for uniqueId:', uniqueId);
        const response = await fetch(`/api/residents/${uniqueId}`);
        
        if (!response.ok) {
          console.error(`Failed to fetch resident data: ${response.status}`);
          // Instead of throwing error, try to use the data from localStorage
          if (parsedUser && parsedUser.firstName && parsedUser.lastName) {
            console.log('Using data from localStorage as fallback');
            setUser(parsedUser);
            setEditData({
              firstName: parsedUser.firstName || '',
              middleName: parsedUser.middleName || '',
              lastName: parsedUser.lastName || '',
              suffix: parsedUser.suffix || '',
              birthdate: parsedUser.birthdate || '',
              birthplace: parsedUser.birthplace || '',
              gender: parsedUser.gender || '',
              citizenship: parsedUser.citizenship || '',
              address: parsedUser.address || '',
              contactNumber: parsedUser.contactNumber || '',
              email: parsedUser.email || '',
              voterStatus: parsedUser.voterStatus || '',
              maritalStatus: parsedUser.maritalStatus || '',
              employmentStatus: parsedUser.employmentStatus || '',
              occupation: parsedUser.occupation || '',
              educationalAttainment: parsedUser.educationalAttainment || '',
              isTUPAD: parsedUser.isTUPAD || false,
              is4Ps: parsedUser.is4Ps || false,
              isPWD: parsedUser.isPWD || false,
              isSoloParent: parsedUser.isSoloParent || false
            });
            return;
          } else {
            throw new Error(`Failed to fetch resident data: ${response.status}`);
          }
        }

        const residentData = await response.json();
        console.log('Fetched resident data:', residentData);

        // Update user state with fetched data
        setUser(residentData);
        
        // Initialize edit data with fetched resident data
        setEditData({
          firstName: residentData.firstName || '',
          middleName: residentData.middleName || '',
          lastName: residentData.lastName || '',
          suffix: residentData.suffix || '',
          birthdate: residentData.birthdate || '',
          birthplace: residentData.birthplace || '',
          gender: residentData.gender || '',
          citizenship: residentData.citizenship || '',
          address: residentData.address || '',
          contactNumber: residentData.contactNumber || '',
          email: residentData.email || '',
          voterStatus: residentData.voterStatus || '',
          maritalStatus: residentData.maritalStatus || '',
          employmentStatus: residentData.employmentStatus || '',
          occupation: residentData.occupation || '',
          educationalAttainment: residentData.educationalAttainment || '',
          isTUPAD: residentData.isTUPAD || false,
          is4Ps: residentData.is4Ps || false,
          isPWD: residentData.isPWD || false,
          isSoloParent: residentData.isSoloParent || false
        });

        // Check for pending updates
        checkPendingUpdates(residentData);
      } catch (error) {
        console.error('Error fetching resident data:', error);
        // Don't show alert for every error, just log it
        // The fallback to localStorage data should handle most cases
        console.log('Error details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResidentData();
  }, [router]);

  // Load existing uploaded files when user data is available
  useEffect(() => {
    if (user?.uniqueId) {
      // The useFileUpload hook will automatically load existing files
      // when the uniqueId changes, so we don't need to do anything here
      console.log('User uniqueId available for file upload:', user.uniqueId);
    }
  }, [user?.uniqueId]);

  // Custom upload handler with success message
  const handleFileUpload = async () => {
    try {
      await handleUpload();
      setUploadSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const checkPendingUpdates = async (residentData) => {
    try {
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
      console.log('Checking pending updates:', pendingUpdates);
      console.log('Current user uniqueId:', residentData?.uniqueId);
      
      const userPendingUpdate = pendingUpdates.find(update => 
        update.residentId === residentData?.uniqueId && 
        update.status === 'pending'
      );
      console.log('Found pending update:', userPendingUpdate);
      setHasPendingUpdate(!!userPendingUpdate);

      // Also check for approval/rejection notifications
      if (residentData?.uniqueId) {
        try {
          const response = await fetch(`/api/notifications?targetRole=resident&residentId=${residentData.uniqueId}&limit=10`);
          if (response.ok) {
            const data = await response.json();
            const notifications = data.notifications || [];
            
            // Check for approval notifications - process all relevant ones
            const approvalNotifications = notifications.filter(n => 
              (n.type === 'info_update_approved' || n.type === 'info_update_rejected') && 
              n.data && n.data.id
            );
            
            // Process approval notifications
            for (const notification of approvalNotifications) {
              // Find matching pending update for this notification
              const matchingPendingUpdate = pendingUpdates.find(update => 
                update.id === notification.data.id && 
                update.residentId === residentData?.uniqueId
              );
              
              if (matchingPendingUpdate) {
                console.log('Found matching pending update for notification:', notification.id);
                
                if (notification.type === 'info_update_approved') {
                  console.log('Processing approval notification, updating user data');
                  
                  // Update user data with approved changes from the notification data
                  const approvedChanges = notification.data.requestedChanges || matchingPendingUpdate.requestedChanges;
                  const updatedUser = {
                    ...residentData,
                    ...approvedChanges
                  };
                  
                  console.log('Updating user from:', residentData);
                  console.log('To:', updatedUser);
                  
                  setUser(updatedUser);
                  
                  // Update editData to reflect the approved changes
                  setEditData({
                    firstName: approvedChanges.firstName || '',
                    middleName: approvedChanges.middleName || '',
                    lastName: approvedChanges.lastName || '',
                    email: approvedChanges.email || '',
                    contactNumber: approvedChanges.contactNumber || '',
                    birthdate: approvedChanges.birthdate || '',
                    address: approvedChanges.address || '',
                    birthplace: approvedChanges.birthplace || '',
                    gender: approvedChanges.gender || '',
                    citizenship: approvedChanges.citizenship || '',
                    voterStatus: approvedChanges.voterStatus || '',
                    maritalStatus: approvedChanges.maritalStatus || '',
                    employmentStatus: approvedChanges.employmentStatus || '',
                    occupation: approvedChanges.occupation || '',
                    educationalAttainment: approvedChanges.educationalAttainment || '',
                    isTUPAD: approvedChanges.isTUPAD || false,
                    is4Ps: approvedChanges.is4Ps || false,
                    isPWD: approvedChanges.isPWD || false,
                    isSoloParent: approvedChanges.isSoloParent || false
                  });
                  
                  // Remove from pending updates
                  const filteredUpdates = pendingUpdates.filter(u => u.id !== matchingPendingUpdate.id);
                  localStorage.setItem('pendingUpdates', JSON.stringify(filteredUpdates));
                  setHasPendingUpdate(false);
                  
                  console.log('User data updated after approval');
                  
                } else if (notification.type === 'info_update_rejected') {
                  console.log('Processing rejection notification, clearing pending status');
                  // Just clear pending status, don't update user data
                  const filteredUpdates = pendingUpdates.filter(u => u.id !== matchingPendingUpdate.id);
                  localStorage.setItem('pendingUpdates', JSON.stringify(filteredUpdates));
                  setHasPendingUpdate(false);
                  
                  console.log('Pending status cleared after rejection');
                }
              }
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
      checkPendingUpdates(user);
    }
  }, [user]);

  // Set up continuous polling for approval notifications
  useEffect(() => {
    if (!user) return;

    const pollForApprovals = () => {
      checkPendingUpdates(user);
    };

    // Initial check
    pollForApprovals();

    // Set up polling every 10 seconds for real-time updates
    const interval = setInterval(pollForApprovals, 10000);

    // Also check when window gains focus
    const handleFocus = () => {
      pollForApprovals();
    };

    // Listen for approval/rejection events from admin
    const handlePersonalInfoUpdated = (event) => {
      console.log('Personal info update event received:', event.detail);
      const { residentId, updatedData, action } = event.detail;
      
      if (residentId === user.uniqueId || residentId === user.residentId) {
        if (action === 'approved') {
          console.log('Updating personal info with approved changes');
          // Update the user data with approved changes
          const updatedUser = { ...user, ...updatedData };
          setUser(updatedUser);
          setEditData(updatedData);
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Clear pending update status
          setHasPendingUpdate(false);
          
          // Show success message
          alert('Your information update has been approved and applied!');
        } else if (action === 'rejected') {
          console.log('Personal info update was rejected');
          // Clear pending update status
          setHasPendingUpdate(false);
          
          // Show rejection message
          alert('Your information update request has been rejected. Please contact the admin for more details.');
        }
      }
    };

    const handleResidentDataUpdated = (event) => {
      console.log('Resident data update event received:', event.detail);
      const { residentId, updatedData, action } = event.detail;
      
      if (residentId === user.uniqueId || residentId === user.residentId) {
        if (action === 'approved') {
          console.log('Updating resident data with approved changes');
          // Update the user data with approved changes
          const updatedUser = { ...user, ...updatedData };
          setUser(updatedUser);
          setEditData(updatedData);
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Clear pending update status
          setHasPendingUpdate(false);
          
          // Show success message
          alert('Your information update has been approved and applied!');
        } else if (action === 'rejected') {
          console.log('Resident data update was rejected');
          // Clear pending update status
          setHasPendingUpdate(false);
          
          // Show rejection message
          alert('Your information update request has been rejected. Please contact the admin for more details.');
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('personalInfoUpdated', handlePersonalInfoUpdated);
    window.addEventListener('residentDataUpdated', handleResidentDataUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('personalInfoUpdated', handlePersonalInfoUpdated);
      window.removeEventListener('residentDataUpdated', handleResidentDataUpdated);
    };
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('programsBenefits.')) {
      const key = name.split('.')[1];
      setEditData(prev => ({
        ...prev,
        programsBenefits: {
          ...prev.programsBenefits,
          [key]: checked
        }
      }));
    } else if (name === 'isTUPAD' || name === 'is4Ps' || name === 'isPWD' || name === 'isSoloParent') {
      setEditData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Instead of immediately updating user data, create a pending update request
      const updateRequestId = `update_${Date.now()}_${user.uniqueId || user.residentId}`;
      const fullName = `${editData.firstName} ${editData.lastName}`.trim();
      
      // Store the pending update request in localStorage (in real app, this would go to database)
      const pendingUpdate = {
        id: updateRequestId,
        residentId: user.uniqueId || user.residentId,
        originalData: user,
        requestedChanges: editData,
        uploadedFiles: uploadedFiles, // Include uploaded files information
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
          message: `Information update request from ${user.uniqueId || user.residentId}. Please review and approve the changes.`,
          requestId: updateRequestId,
          targetRole: 'admin',
          senderUserId: user.uniqueId || user.residentId,
          relatedDocType: 'residents',
          actionRequired: true,
          priority: 'medium',
          redirectTarget: 'modal',
          status: 'pending',
          data: { // Embed the actual update data
            id: updateRequestId,
            residentId: user.uniqueId || user.residentId,
            requestedBy: fullName,
            requestedAt: new Date().toISOString(),
            status: 'pending',
            originalData: {
              firstName: user.firstName || '',
              middleName: user.middleName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              contactNumber: user.contactNumber || '',
              birthdate: user.birthdate || '',
              address: user.address || '',
              birthplace: user.birthplace || '',
              gender: user.gender || '',
              citizenship: user.citizenship || '',
              voterStatus: user.voterStatus || '',
              maritalStatus: user.maritalStatus || '',
              employmentStatus: user.employmentStatus || '',
              occupation: user.occupation || '',
              educationalAttainment: user.educationalAttainment || '',
              isTUPAD: user.isTUPAD || false,
              is4Ps: user.is4Ps || false,
              isPWD: user.isPWD || false,
              isSoloParent: user.isSoloParent || false
            },
            requestedChanges: {
              firstName: editData.firstName,
              middleName: editData.middleName,
              lastName: editData.lastName,
              email: editData.email,
              contactNumber: editData.contactNumber,
              birthdate: editData.birthdate,
              address: editData.address,
              birthplace: editData.birthplace,
              gender: editData.gender,
              citizenship: editData.citizenship,
              voterStatus: editData.voterStatus,
              maritalStatus: editData.maritalStatus,
              employmentStatus: editData.employmentStatus,
              occupation: editData.occupation,
              educationalAttainment: editData.educationalAttainment,
              isTUPAD: editData.isTUPAD,
              is4Ps: editData.is4Ps,
              isPWD: editData.isPWD,
              isSoloParent: editData.isSoloParent
            },
            uploadedFiles: uploadedFiles // Include uploaded files in notification
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

  const handleQuickSubmit = async () => {
    setSaving(true);
    try {
      // Create a quick update request with higher priority
      const updateRequestId = `quick_update_${Date.now()}_${user.uniqueId || user.residentId}`;
      const fullName = `${editData.firstName} ${editData.lastName}`.trim();
      
      // Store the pending update request in localStorage
      const pendingUpdate = {
        id: updateRequestId,
        residentId: user.uniqueId || user.residentId,
        originalData: user,
        requestedChanges: editData,
        uploadedFiles: uploadedFiles, // Include uploaded files information
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestedBy: fullName,
        priority: 'high', // Higher priority for quick submit
        type: 'quick_submit'
      };
      
      // Store pending updates in localStorage
      const existingPendingUpdates = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
      existingPendingUpdates.push(pendingUpdate);
      localStorage.setItem('pendingUpdates', JSON.stringify(existingPendingUpdates));
      
      // Create notification for admin with higher priority
      try {
        console.log('=== QUICK SUBMIT NOTIFICATION CREATION ===');
        console.log('User data:', user);
        console.log('Quick update request ID:', updateRequestId);
        console.log('Full name:', fullName);
        
        const notificationPayload = {
          type: 'info_update_request',
          title: `🚀 ${fullName} submitted a quick update request`,
          message: `Quick information update request from ${user.uniqueId || user.residentId}. This request has been marked as high priority for faster processing.`,
          requestId: updateRequestId,
          targetRole: 'admin',
          senderUserId: user.uniqueId || user.residentId,
          relatedDocType: 'residents',
          actionRequired: true,
          priority: 'high', // Higher priority
          redirectTarget: 'modal',
          status: 'pending',
          data: { // Embed the actual update data
            id: updateRequestId,
            residentId: user.uniqueId || user.residentId,
            requestedBy: fullName,
            requestedAt: new Date().toISOString(),
            status: 'pending',
            priority: 'high',
            type: 'quick_submit',
            originalData: {
              firstName: user.firstName || '',
              middleName: user.middleName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              contactNumber: user.contactNumber || '',
              birthdate: user.birthdate || '',
              address: user.address || '',
              birthplace: user.birthplace || '',
              gender: user.gender || '',
              citizenship: user.citizenship || '',
              voterStatus: user.voterStatus || '',
              maritalStatus: user.maritalStatus || '',
              employmentStatus: user.employmentStatus || '',
              occupation: user.occupation || '',
              educationalAttainment: user.educationalAttainment || '',
              isTUPAD: user.isTUPAD || false,
              is4Ps: user.is4Ps || false,
              isPWD: user.isPWD || false,
              isSoloParent: user.isSoloParent || false
            },
            requestedChanges: {
              firstName: editData.firstName,
              middleName: editData.middleName,
              lastName: editData.lastName,
              email: editData.email,
              contactNumber: editData.contactNumber,
              birthdate: editData.birthdate,
              address: editData.address,
              birthplace: editData.birthplace,
              gender: editData.gender,
              citizenship: editData.citizenship,
              voterStatus: editData.voterStatus,
              maritalStatus: editData.maritalStatus,
              employmentStatus: editData.employmentStatus,
              occupation: editData.occupation,
              educationalAttainment: editData.educationalAttainment,
              isTUPAD: editData.isTUPAD,
              is4Ps: editData.is4Ps,
              isPWD: editData.isPWD,
              isSoloParent: editData.isSoloParent
            }
          }
        };
        
        console.log('Quick submit notification payload:', notificationPayload);
        
        const notificationResponse = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notificationPayload)
        });
        
        console.log('Quick submit notification response status:', notificationResponse.status);
        console.log('Quick submit notification response ok:', notificationResponse.ok);
        
        if (notificationResponse.ok) {
          const notificationResult = await notificationResponse.json();
          console.log('Quick submit notification created successfully:', notificationResult);
        } else {
          const errorText = await notificationResponse.text();
          console.error('Failed to create quick submit notification:', errorText);
          console.error('Response status:', notificationResponse.status);
          console.error('Response headers:', notificationResponse.headers);
          throw new Error(`Quick submit notification creation failed: ${errorText}`);
        }
      } catch (notificationError) {
        console.error('Failed to create quick submit notification:', notificationError);
        console.error('Error details:', {
          message: notificationError.message,
          stack: notificationError.stack
        });
        
        // Still proceed with the local update process even if notification fails
        setIsEditing(false);
        setHasPendingUpdate(true);
        
        // Show warning but don't completely fail
        alert('Quick update request saved locally, but failed to notify admin. Please contact admin directly about your request.');
      }
      
      // Reset editing state without updating user data
      setIsEditing(false);
      setHasPendingUpdate(true); // Show pending status
      
      // Show success message for quick submit
      alert('🚀 Quick update request submitted successfully! This request has been marked as high priority and will be processed faster. You will be notified once your changes are reviewed.');
    } catch (error) {
      console.error('Error submitting quick update request:', error);
      alert('Failed to submit quick update request. Please try again.');
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
      suffix: user.suffix || '',
      birthdate: user.birthdate || '',
      birthplace: user.birthplace || '',
      gender: user.gender || '',
      citizenship: user.citizenship || '',
      address: user.address || '',
      contactNumber: user.contactNumber || '',
      email: user.email || '',
      voterStatus: user.voterStatus || '',
      maritalStatus: user.maritalStatus || '',
      employmentStatus: user.employmentStatus || '',
      occupation: user.occupation || '',
      educationalAttainment: user.educationalAttainment || '',
      isTUPAD: user.isTUPAD || false,
      is4Ps: user.is4Ps || false,
      isPWD: user.isPWD || false,
      isSoloParent: user.isSoloParent || false
    });
    
    // Clear any uploaded files that haven't been submitted
    clearAll();
    
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
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm font-semibold shadow-md border border-blue-500/30 hover:from-blue-500 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold shadow-md border border-blue-700/30 hover:from-blue-600 hover:to-blue-800 hover:shadow-lg active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" /> Submit
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
              {user ? `${user.firstName?.toUpperCase()}${user.middleName ? ' ' + user.middleName.charAt(0).toUpperCase() + '. ' : ' '}${user.lastName?.toUpperCase()}` : 'Resident'}
            </h2>
            <p className="text-blue-100 mb-2">Verified Barangay Resident</p>
            {user?.uniqueId && (
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <span className="text-sm font-mono font-bold">
                  ID: {user.uniqueId}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-blue-100 text-sm">Account Status</div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                user?.accountStatus === 'approved' ? 'bg-green-400' :
                user?.accountStatus === 'pending' ? 'bg-yellow-400' :
                user?.accountStatus === 'rejected' ? 'bg-red-400' :
                'bg-gray-400'
              }`}></div>
              <span className={`font-medium ${
                user?.accountStatus === 'approved' ? 'text-green-300' :
                user?.accountStatus === 'pending' ? 'text-yellow-300' :
                user?.accountStatus === 'rejected' ? 'text-red-300' :
                'text-gray-300'
              }`}>
                {user?.accountStatus ? user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1) : 'Unknown'}
              </span>
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
          {isEditing ? (
            <>
              {/* Personal Information */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-1">First Name <span className="text-red-500">*</span></label>
                    <input type="text" name="firstName" value={editData.firstName} onChange={handleInputChange} placeholder="Enter first name" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Middle Name</label>
                    <input type="text" name="middleName" value={editData.middleName} onChange={handleInputChange} placeholder="Enter middle name" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
                    <input type="text" name="lastName" value={editData.lastName} onChange={handleInputChange} placeholder="Enter last name" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Suffix</label>
                    <input type="text" name="suffix" value={editData.suffix} onChange={handleInputChange} placeholder="Jr., Sr., III, etc." className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                </div>
              </div>
              {/* Basic Details */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Basic Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Birthdate <span className="text-red-500">*</span></label>
                    <input type="date" name="birthdate" value={editData.birthdate} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Birthplace</label>
                    <input type="text" name="birthplace" value={editData.birthplace} onChange={handleInputChange} placeholder="Enter birthplace" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Gender <span className="text-red-500">*</span></label>
                    <select name="gender" value={editData.gender} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" style={{ textTransform: 'uppercase' }}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Citizenship</label>
                    <input type="text" name="citizenship" value={editData.citizenship} onChange={handleInputChange} placeholder="Enter citizenship" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                </div>
              </div>
              {/* Address & Contact Information */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Address & Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-1">Address</label>
                    <input type="text" name="address" value={editData.address} onChange={handleInputChange} placeholder="Enter complete address" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Contact Number</label>
                    <input type="text" name="contactNumber" value={editData.contactNumber} onChange={handleInputChange} placeholder="0921 234 5678" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Email Address</label>
                    <input type="email" name="email" value={editData.email} onChange={handleInputChange} placeholder="example@domain.com" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
                  </div>
                </div>
              </div>
              {/* Status & Classification */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Status & Classification</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Voter Status <span className="text-red-500">*</span></label>
                    <select name="voterStatus" value={editData.voterStatus} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" style={{ textTransform: 'uppercase' }}>
                      <option value="">Select Voter Status</option>
                      <option value="Registered">Registered</option>
                      <option value="Not Registered">Not Registered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Marital Status <span className="text-red-500">*</span></label>
                    <select name="maritalStatus" value={editData.maritalStatus} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" style={{ textTransform: 'uppercase' }}>
                      <option value="">Select Marital Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Professional Information */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Professional Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium mb-1">Employment Status</label>
                    <select name="employmentStatus" value={editData.employmentStatus} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" style={{ textTransform: 'uppercase' }}>
                      <option value="">Select Employment Status</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Occupation</label>
                    <input type="text" name="occupation" value={editData.occupation} onChange={handleInputChange} placeholder="Enter occupation" className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-medium mb-1">Educational Attainment</label>
                    <select name="educationalAttainment" value={editData.educationalAttainment} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" style={{ textTransform: 'uppercase' }}>
                      <option value="">Select Education Level</option>
                      <option value="Elementary">Elementary</option>
                      <option value="High School">High School</option>
                      <option value="College">College</option>
                      <option value="Vocational">Vocational</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Programs & Benefits */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Check className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Programs & Benefits <span className="text-sm font-normal text-gray-500">(Check all that apply)</span></h2>
                </div>
                {isEditing && (
                  <div className="flex flex-wrap gap-4 justify-center items-center">
                    {/* TUPAD */}
                    <label className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 min-w-[140px] hover:border-blue-400">
                      <input type="checkbox" name="isTUPAD" checked={editData.isTUPAD || false} onChange={handleInputChange} className="sr-only" />
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${editData.isTUPAD ? 'border-blue-500' : 'border-blue-400'}`}>
                        {editData.isTUPAD && <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>}
                      </span>
                      <span className={`text-sm font-semibold ${editData.isTUPAD ? 'text-blue-700' : 'text-blue-500'}`}>TUPAD</span>
                    </label>
                    {/* 4Ps */}
                    <label className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 min-w-[140px] hover:border-green-400">
                      <input type="checkbox" name="is4Ps" checked={editData.is4Ps || false} onChange={handleInputChange} className="sr-only" />
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${editData.is4Ps ? 'border-green-500' : 'border-green-400'}`}>
                        {editData.is4Ps && <span className="w-3 h-3 rounded-full bg-green-500 block"></span>}
                      </span>
                      <span className={`text-sm font-semibold ${editData.is4Ps ? 'text-green-700' : 'text-green-500'}`}>4Ps</span>
                    </label>
                    {/* PWD */}
                    <label className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 min-w-[140px] hover:border-purple-400">
                      <input type="checkbox" name="isPWD" checked={editData.isPWD || false} onChange={handleInputChange} className="sr-only" />
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${editData.isPWD ? 'border-purple-500' : 'border-purple-400'}`}>
                        {editData.isPWD && <span className="w-3 h-3 rounded-full bg-purple-500 block"></span>}
                      </span>
                      <span className={`text-sm font-semibold ${editData.isPWD ? 'text-purple-700' : 'text-purple-500'}`}>PWD</span>
                    </label>
                    {/* Solo Parent */}
                    <label className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 min-w-[140px] hover:border-orange-400">
                      <input type="checkbox" name="isSoloParent" checked={editData.isSoloParent || false} onChange={handleInputChange} className="sr-only" />
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${editData.isSoloParent ? 'border-orange-500' : 'border-orange-400'}`}>
                        {editData.isSoloParent && <span className="w-3 h-3 rounded-full bg-orange-500 block"></span>}
                      </span>
                      <span className={`text-sm font-semibold ${editData.isSoloParent ? 'text-orange-700' : 'text-orange-500'}`}>Solo Parent</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Document Upload Section */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Upload className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Documents & Files</h2>
                </div>
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                      isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const droppedFiles = Array.from(e.dataTransfer.files);
                      handleFileSelect(droppedFiles);
                    }}
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                          <p className="text-blue-600">Uploading files...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400" />
                          <div className="text-center">
                            <p className="text-gray-600">Drag and drop your files here, or</p>
                            <label className="mt-2 cursor-pointer">
                              <span className="text-blue-500 hover:text-blue-600">Browse files</span>
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                          <p className="text-sm text-gray-500">
                            Supported formats: PDF, JPEG, PNG (max 5MB per file)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Selected Files (Before Upload) */}
                  {files.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Selected Files:</h4>
                      <div className="space-y-2">
                        {files.map((file) => (
                          <div
                            key={file.name}
                            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <FileCheck className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(file.name)}
                              className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                              disabled={isUploading}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleFileUpload}
                        disabled={isUploading}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Files'}
                      </button>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {Object.keys(uploadProgress).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Upload Progress:</h4>
                      {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">{fileName}</span>
                            <span className="text-sm text-gray-500">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-700">Uploaded Documents:</h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.fileName}
                            className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-green-500" />
                              <div>
                                <span className="text-sm font-medium text-gray-700">{file.originalName}</span>
                                <p className="text-xs text-gray-500">
                                  Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/* Preview button for images */}
                              {(file.fileType?.startsWith('image/') || file.originalName?.match(/\.(jpg|jpeg|png|gif)$/i)) && (
                                <button
                                  onClick={() => setPreviewFile(file)}
                                  className="text-green-500 hover:text-green-600 p-1 rounded-full hover:bg-green-50"
                                  title="Preview file"
                                >
                                  <FileText className="h-4 w-4" />
                                </button>
                              )}
                              <a
                                href={file.downloadURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => deleteFile(file.fileName)}
                                className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                title="Delete file"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadSuccess && (
                    <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4" />
                      <span>Files uploaded successfully!</span>
                    </div>
                  )}

                  {/* Error Messages */}
                  {Object.entries(uploadErrors).length > 0 && (
                    <div className="space-y-2">
                      {Object.entries(uploadErrors).map(([fileName, error]) => (
                        <div
                          key={fileName}
                          className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>{fileName}: {error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bottom Action Buttons */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Submit Your Changes</h3>
                    <p className="text-sm text-gray-600">Review your changes and submit for admin approval</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold shadow-md border border-gray-200 hover:bg-gray-200 hover:shadow-lg active:scale-95 transition-all"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold shadow-md border border-blue-700/30 hover:from-blue-600 hover:to-blue-800 hover:shadow-lg active:scale-95 transition-all"
                    >
                      <Save className="w-4 h-4" /> Submit
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Non-edit mode fields
            <>
              {/* Personal Information */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.firstName?.toUpperCase() || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Middle Name</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.middleName?.toUpperCase() || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.lastName?.toUpperCase() || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Suffix</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.suffix || 'Not provided'}</div>
                  </div>
                </div>
              </div>
              {/* Basic Details */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Calendar className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Basic Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Birthdate</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Birthplace</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.birthplace || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.gender || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Citizenship</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.citizenship || 'Not provided'}</div>
                  </div>
                </div>
              </div>
              {/* Address & Contact Information */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Address & Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.address || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.contactNumber || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.email || 'Not provided'}</div>
                  </div>
                </div>
              </div>
              {/* Status & Classification */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Status & Classification</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Voter Status</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.voterStatus || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Marital Status</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.maritalStatus || 'Not provided'}</div>
                  </div>
                </div>
              </div>
              {/* Professional Information */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Professional Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Employment Status</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.employmentStatus || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Occupation</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.occupation || 'Not provided'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Educational Attainment</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">{user?.educationalAttainment || 'Not provided'}</div>
                  </div>
                </div>
              </div>
              {/* Programs & Benefits */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <Check className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Programs & Benefits <span className="text-sm font-normal text-gray-500">(Check all that apply)</span></h2>
                </div>
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[160px]">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${user?.isTUPAD ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}>{user?.isTUPAD && <span className="w-3 h-3 rounded-full bg-white block"></span>}</span>
                    <span className="text-base font-medium text-gray-700">TUPAD</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[160px]">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${user?.is4Ps ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`}>{user?.is4Ps && <span className="w-3 h-3 rounded-full bg-white block"></span>}</span>
                    <span className="text-base font-medium text-gray-700">4Ps</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[160px]">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${user?.isPWD ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'}`}>{user?.isPWD && <span className="w-3 h-3 rounded-full bg-white block"></span>}</span>
                    <span className="text-base font-medium text-gray-700">PWD</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm min-w-[160px]">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${user?.isSoloParent ? 'border-orange-400 bg-orange-400' : 'border-gray-300 bg-white'}`}>{user?.isSoloParent && <span className="w-3 h-3 rounded-full bg-white block"></span>}</span>
                    <span className="text-base font-medium text-gray-700">Solo Parent</span>
                  </div>
                </div>
              </div>

              {/* Documents Section (Read-only) */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Documents & Files</h2>
                </div>
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.fileName}
                        className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-green-500" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">{file.originalName}</span>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Preview button for images */}
                          {(file.fileType?.startsWith('image/') || file.originalName?.match(/\.(jpg|jpeg|png|gif)$/i)) && (
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="text-green-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                              title="Preview file"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          <a
                            href={file.downloadURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No documents uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Edit Information" to upload documents</p>
                  </div>
                )}
              </div>
              {/* Account Information */}
              <div className="rounded-xl bg-blue-50 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-500 mr-2" />
                  <h2 className="font-semibold text-lg text-blue-900">Account Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Account Status</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user?.accountStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        user?.accountStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        user?.accountStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user?.accountStatus ? user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1) : 'Not provided'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Not provided'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date Created</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      {user?.createdAt ? 
                        (user.createdAt.seconds ? 
                          new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 
                          new Date(user.createdAt).toLocaleDateString()
                        ) : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Last Updated</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      {user?.updatedAt ? 
                        (user.updatedAt.seconds ? 
                          new Date(user.updatedAt.seconds * 1000).toLocaleDateString() : 
                          new Date(user.updatedAt).toLocaleDateString()
                        ) : 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{previewFile.originalName}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              {previewFile.fileType?.startsWith('image/') || previewFile.originalName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={previewFile.downloadURL}
                  alt={previewFile.originalName}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Preview not available for this file type</p>
                  <a
                    href={previewFile.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Download to view
                  </a>
                </div>
              )}
              <div className="text-sm text-gray-500">
                <p>File size: {(previewFile.fileSize / 1024).toFixed(1)} KB</p>
                <p>Uploaded: {new Date(previewFile.uploadedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 