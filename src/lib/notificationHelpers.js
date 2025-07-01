// Helper functions to create notifications for different events

export const createNotification = async (notificationData) => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to create notification');
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Notification helper functions for creating different types of notifications

/**
 * Create a notification for information update requests
 * @param {string} residentId - The ID of the resident requesting the update
 * @param {string} dataId - The ID of the update request
 * @param {Object} updateData - The data being updated
 * @returns {Object} Notification data
 */
export const createInfoUpdateNotification = (residentId, dataId, updateData = {}) => {
  return {
    type: 'info_update_request',
    title: `${updateData.fullName || 'Resident'} requested to update their profile`,
    message: `Information update request from ${residentId}. Please review and approve the changes.`,
    residentId,
    dataId,
    priority: 'medium',
    redirectTarget: 'modal', // Use modal for quick review
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a notification for barangay ID requests
 * @param {string} residentId - The ID of the resident requesting the ID
 * @param {string} dataId - The ID of the ID request
 * @param {Object} residentData - Basic resident information
 * @returns {Object} Notification data
 */
export const createBrgyIdRequestNotification = (residentId, dataId, residentData = {}) => {
  return {
    type: 'brgy_id_request',
    title: `${residentData.fullName || 'Resident'} requested a Barangay ID`,
    message: `New Barangay ID request from ${residentId}. Ready for processing and printing.`,
    residentId,
    dataId,
    priority: 'high',
    redirectTarget: 'page', // Use page for complex actions like printing
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a notification for document clearance requests
 * @param {string} residentId - The ID of the resident requesting the clearance
 * @param {string} dataId - The ID of the clearance request
 * @param {Object} requestData - Request details
 * @returns {Object} Notification data
 */
export const createDocumentClearanceNotification = (residentId, dataId, requestData = {}) => {
  return {
    type: 'document_clearance',
    title: `${requestData.fullName || 'Resident'} requested a Barangay Clearance`,
    message: `New clearance request for ${requestData.purpose || 'general purpose'}. Requires review and approval.`,
    residentId,
    dataId,
    priority: 'medium',
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a notification for certificate requests
 * @param {string} residentId - The ID of the resident requesting the certificate
 * @param {string} dataId - The ID of the certificate request
 * @param {Object} requestData - Request details
 * @returns {Object} Notification data
 */
export const createDocumentCertificateNotification = (residentId, dataId, requestData = {}) => {
  return {
    type: 'document_certificate',
    title: `${requestData.fullName || 'Resident'} requested a Certificate`,
    message: `New certificate request for ${requestData.certificateType || 'general certificate'}. Ready for processing.`,
    residentId,
    dataId,
    priority: 'medium',
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a notification for permit requests
 * @param {string} residentId - The ID of the resident requesting the permit
 * @param {string} dataId - The ID of the permit request
 * @param {Object} requestData - Request details
 * @returns {Object} Notification data
 */
export const createDocumentPermitNotification = (residentId, dataId, requestData = {}) => {
  return {
    type: 'document_permit',
    title: `${requestData.fullName || 'Resident'} requested a Permit`,
    message: `New permit request for ${requestData.permitType || 'business permit'}. Requires review and approval.`,
    residentId,
    dataId,
    priority: 'medium',
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a notification for new user registrations
 * @param {string} residentId - The ID of the newly registered resident
 * @param {Object} userData - User registration data
 * @returns {Object} Notification data
 */
export const createNewRegistrationNotification = (residentId, userData = {}) => {
  return {
    type: 'new_registration',
    title: `${userData.fullName || 'New resident'} has registered`,
    message: `New resident registration from ${userData.fullName || residentId}. Please review and verify the information.`,
    residentId,
    dataId: residentId, // For new registrations, dataId is the same as residentId
    priority: 'high',
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a notification for complaints
 * @param {string} residentId - The ID of the resident filing the complaint
 * @param {string} dataId - The ID of the complaint
 * @param {Object} complaintData - Complaint details
 * @returns {Object} Notification data
 */
export const createComplaintNotification = (residentId, dataId, complaintData = {}) => {
  return {
    type: 'complaint',
    title: `New complaint filed by ${complaintData.fullName || 'Resident'}`,
    message: `Complaint regarding: ${complaintData.subject || 'General complaint'}. Requires immediate attention.`,
    residentId,
    dataId,
    priority: 'urgent',
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a general document request notification (fallback)
 * @param {string} residentId - The ID of the resident making the request
 * @param {string} dataId - The ID of the request
 * @param {Object} requestData - Request details
 * @returns {Object} Notification data
 */
export const createDocumentRequestNotification = (residentId, dataId, requestData = {}) => {
  return {
    type: 'document_request',
    title: `${requestData.fullName || 'Resident'} requested a document`,
    message: `New document request from ${residentId}. Type: ${requestData.documentType || 'General document'}.`,
    residentId,
    dataId,
    priority: 'medium',
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create an urgent system notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} dataId - Related data ID (optional)
 * @returns {Object} Notification data
 */
export const createUrgentNotification = (title, message, dataId = null) => {
  return {
    type: 'urgent',
    title,
    message,
    residentId: null,
    dataId,
    priority: 'urgent',
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Create a system notification
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} priority - Notification priority (low, medium, high, urgent)
 * @returns {Object} Notification data
 */
export const createSystemNotification = (title, message, priority = 'medium') => {
  return {
    type: 'system',
    title,
    message,
    residentId: null,
    dataId: null,
    priority,
    redirectTarget: 'page',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Helper function to send notification to the API
 * @param {Object} notificationData - The notification data to send
 * @returns {Promise} API response
 */
export const sendNotification = async (notificationData) => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Utility function to determine if a notification should use modal or page redirect
 * @param {string} notificationType - The type of notification
 * @returns {string} 'modal' or 'page'
 */
export const getRedirectTarget = (notificationType) => {
  const modalTypes = ['info_update_request'];
  const pageTypes = [
    'brgy_id_request',
    'document_clearance', 
    'document_certificate',
    'document_permit',
    'new_registration',
    'complaint',
    'document_request'
  ];

  if (modalTypes.includes(notificationType)) {
    return 'modal';
  } else if (pageTypes.includes(notificationType)) {
    return 'page';
  }

  return 'page'; // Default to page
};

/**
 * Get notification type display name
 * @param {string} type - Notification type
 * @returns {string} Display name
 */
export const getNotificationTypeName = (type) => {
  const typeNames = {
    'info_update_request': 'Info Update',
    'brgy_id_request': 'ID Request',
    'document_clearance': 'Clearance',
    'document_certificate': 'Certificate',
    'document_permit': 'Permit',
    'new_registration': 'New Registration',
    'complaint': 'Complaint',
    'document_request': 'Document Request',
    'urgent': 'Urgent',
    'system': 'System'
  };

  return typeNames[type] || type.replace('_', ' ');
};

/**
 * Get notification priority color
 * @param {string} priority - Notification priority
 * @returns {string} CSS color classes
 */
export const getPriorityColor = (priority) => {
  const colors = {
    'low': 'bg-gray-100 text-gray-700',
    'medium': 'bg-blue-100 text-blue-700',
    'high': 'bg-orange-100 text-orange-700',
    'urgent': 'bg-red-100 text-red-700'
  };

  return colors[priority] || colors['medium'];
}; 