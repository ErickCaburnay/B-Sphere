"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Tag,
  Users,
  TrendingUp
} from 'lucide-react';
import AnnouncementForm from './AnnouncementForm';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import Notification from '@/components/ui/notification';

export default function AnnouncementsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  const {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  } = useAnnouncements();

  // Create new announcement
  const handleCreate = async (formData) => {
    const result = await createAnnouncement(formData);
    if (result.success) {
      setShowForm(false);
      setNotification({
        type: 'success',
        message: 'Announcement created successfully!'
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Failed to create announcement: ' + result.error
      });
    }
  };

  // Update announcement
  const handleUpdate = async (formData) => {
    const result = await updateAnnouncement(editingAnnouncement.id, formData);
    if (result.success) {
      setShowForm(false);
      setEditingAnnouncement(null);
      setNotification({
        type: 'success',
        message: 'Announcement updated successfully!'
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Failed to update announcement: ' + result.error
      });
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    const result = await deleteAnnouncement(id);
    if (result.success) {
      setNotification({
        type: 'success',
        message: 'Announcement deleted successfully!'
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Failed to delete announcement: ' + result.error
      });
    }
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Statistics
  const stats = {
    total: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    draft: announcements.filter(a => a.status === 'draft').length,
    archived: announcements.filter(a => a.status === 'archived').length
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const handleSave = (formData) => {
    if (editingAnnouncement) {
      return handleUpdate(formData);
    } else {
      return handleCreate(formData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Announcements & News</h2>
          <p className="text-gray-500">Manage community announcements and news updates</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-5 w-5" />
          Create New
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Tag className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Archived</p>
              <p className="text-2xl font-bold text-gray-900">{stats.archived}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="Community">Community</option>
              <option value="Health">Health</option>
              <option value="Governance">Governance</option>
              <option value="Education">Education</option>
              <option value="Safety">Safety</option>
              <option value="Events">Events</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Announcements List */}
      <div className="grid gap-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No announcements found</p>
              <p className="text-sm">Create your first announcement to get started</p>
            </div>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      announcement.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : announcement.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {announcement.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs bg-${announcement.color}-100 text-${announcement.color}-800`}>
                      {announcement.category}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{announcement.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.updatedAt && (
                      <span>Updated: {new Date(announcement.updatedAt).toLocaleDateString()}</span>
                    )}
                    <span>Views: {announcement.views || 0}</span>
                  </div>
                  {(announcement.autoPublishDate || announcement.autoArchiveDate) && (
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {announcement.autoPublishDate && (
                        <span>Auto-publish: {new Date(announcement.autoPublishDate).toLocaleString()}</span>
                      )}
                      {announcement.autoArchiveDate && (
                        <span>Auto-archive: {new Date(announcement.autoArchiveDate).toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Announcement Form Modal */}
      <AnnouncementForm
        announcement={editingAnnouncement}
        onSave={handleSave}
        onCancel={handleFormCancel}
        isOpen={showForm}
      />

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
} 