"use client";

import { useState, useEffect } from 'react';
import { X, Calendar, Eye, Tag, Search, Filter } from 'lucide-react';
import AnnouncementDetailModal from './AnnouncementDetailModal';

export default function ViewAllAnnouncementsModal({ isOpen, onClose }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Helper function to safely convert Firestore Timestamps to readable dates
  const formatDate = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      // Handle Firestore Timestamp objects
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        return dateValue.toDate();
      }
      // Handle regular Date objects or date strings
      if (dateValue instanceof Date) {
        return dateValue;
      }
      // Handle timestamp numbers
      if (typeof dateValue === 'number') {
        return new Date(dateValue);
      }
      // Handle date strings
      if (typeof dateValue === 'string') {
        return new Date(dateValue);
      }
      return null;
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllAnnouncements();
    }
  }, [isOpen]);

  const fetchAllAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/announcements');
      const result = await response.json();
      
      if (result.success) {
        setAnnouncements(result.data);
        if (result.data.length > 0) {
          setSelectedAnnouncement(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyling = (category) => {
    const categoryMap = {
      'Community': { bg: 'bg-green-100', text: 'text-green-800', color: 'green' },
      'Health': { bg: 'bg-yellow-100', text: 'text-yellow-800', color: 'yellow' },
      'Governance': { bg: 'bg-blue-100', text: 'text-blue-800', color: 'blue' },
      'Education': { bg: 'bg-purple-100', text: 'text-purple-800', color: 'purple' },
      'Safety': { bg: 'bg-red-100', text: 'text-red-800', color: 'red' },
      'Events': { bg: 'bg-pink-100', text: 'text-pink-800', color: 'pink' }
    };
    return categoryMap[category] || categoryMap['Community'];
  };

  const getCategoryIcon = (category, color) => {
    const iconMap = {
      'Community': (
        <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      'Health': (
        <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      ),
      'Governance': (
        <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      ),
      'Education': (
        <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
      'Safety': (
        <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      'Events': (
        <svg className={`w-4 h-4 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
        </svg>
      )
    };
    return iconMap[category] || iconMap['Community'];
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || announcement.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-7xl max-h-[90vh] transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">All Announcements</h2>
                <p className="text-green-100 text-sm">Browse and view all community announcements</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Side - Announcements List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
            </div>

            {/* Announcements List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : filteredAnnouncements.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No announcements found</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredAnnouncements.map((announcement) => {
                    const styling = getCategoryStyling(announcement.category);
                    const icon = getCategoryIcon(announcement.category, styling.color);
                    const isSelected = selectedAnnouncement?.id === announcement.id;

                    return (
                      <div
                        key={announcement.id}
                        onClick={() => setSelectedAnnouncement(announcement)}
                        className={`p-4 cursor-pointer transition-colors ${
                          isSelected ? 'bg-green-50 border-r-4 border-green-500' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full ${styling.bg} flex items-center justify-center flex-shrink-0`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm mb-1 ${
                              isSelected ? 'text-green-900' : 'text-gray-900'
                            }`}>
                              {announcement.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                              {announcement.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{(() => {
                       const date = formatDate(announcement.createdAt);
                       return date ? date.toLocaleDateString() : 'Date not available';
                     })()}</span>
                              <span>•</span>
                              <span className={`${styling.bg} ${styling.text} px-2 py-0.5 rounded-full`}>
                                {announcement.category}
                              </span>
                              <span>•</span>
                              <span className={`px-2 py-0.5 rounded-full ${
                                announcement.status === 'published' ? 'bg-green-100 text-green-800' :
                                announcement.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {announcement.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Announcement Details */}
          <div className="w-2/3 flex flex-col">
            {selectedAnnouncement ? (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Image */}
                  {selectedAnnouncement.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={selectedAnnouncement.imageUrl}
                        alt={selectedAnnouncement.title}
                        className="w-full h-48 object-cover rounded-xl shadow-lg"
                      />
                    </div>
                  )}

                  {/* Title and Meta */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedAnnouncement.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedAnnouncement.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{selectedAnnouncement.views || 0} views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${getCategoryStyling(selectedAnnouncement.category).bg} ${getCategoryStyling(selectedAnnouncement.category).text} py-1 px-3 rounded-full font-medium`}>
                        {selectedAnnouncement.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedAnnouncement.description}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Status</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedAnnouncement.status === 'published' ? 'bg-green-100 text-green-800' :
                        selectedAnnouncement.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAnnouncement.status.charAt(0).toUpperCase() + selectedAnnouncement.status.slice(1)}
                      </span>
                    </div>

                    {selectedAnnouncement.autoPublishDate && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Auto Publish Date</h4>
                                        <p className="text-purple-700 text-sm">
                  {(() => {
                    const date = formatDate(selectedAnnouncement.autoPublishDate);
                    return date ? date.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Date not set';
                  })()}
                </p>
                      </div>
                    )}

                    {selectedAnnouncement.autoArchiveDate && (
                      <div className="bg-orange-50 rounded-xl p-4">
                        <h4 className="font-semibold text-orange-900 mb-2">Auto Archive Date</h4>
                                        <p className="text-orange-700 text-sm">
                  {(() => {
                    const date = formatDate(selectedAnnouncement.autoArchiveDate);
                    return date ? date.toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Date not set';
                  })()}
                </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Last updated: {(() => {
                  const date = formatDate(selectedAnnouncement.updatedAt);
                  return date ? date.toLocaleDateString() : 'Not available';
                })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select an announcement to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 