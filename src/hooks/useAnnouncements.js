import { useState, useEffect, useCallback } from 'react';

export const useAnnouncements = (options = {}) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    status = null,
    limit = null,
    category = null,
    autoFetch = true
  } = options;

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);
    if (category) params.append('category', category);
    return params.toString();
  }, [status, limit, category]);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryParams();
      const url = `/api/announcements${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setAnnouncements(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch announcements');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  // Create announcement
  const createAnnouncement = useCallback(async (announcementData) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        await fetchAnnouncements();
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Failed to create announcement');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating announcement:', err);
      return { success: false, error: err.message };
    }
  }, [fetchAnnouncements]);

  // Update announcement
  const updateAnnouncement = useCallback(async (id, announcementData) => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        await fetchAnnouncements();
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to update announcement');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating announcement:', err);
      return { success: false, error: err.message };
    }
  }, [fetchAnnouncements]);

  // Delete announcement
  const deleteAnnouncement = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the list
        await fetchAnnouncements();
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to delete announcement');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting announcement:', err);
      return { success: false, error: err.message };
    }
  }, [fetchAnnouncements]);

  // Get single announcement
  const getAnnouncement = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/announcements/${id}`);
      const result = await response.json();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Failed to fetch announcement');
      }
    } catch (err) {
      console.error('Error fetching announcement:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchAnnouncements();
    }
  }, [fetchAnnouncements, autoFetch]);

  return {
    announcements,
    loading,
    error,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncement,
    refetch: fetchAnnouncements
  };
}; 