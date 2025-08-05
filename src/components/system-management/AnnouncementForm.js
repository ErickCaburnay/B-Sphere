"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Eye, EyeOff, Upload, Calendar, Clock, Archive } from 'lucide-react';

const CATEGORIES = [
  { value: 'Community', label: 'Community', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 'Health', label: 'Health', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { value: 'Governance', label: 'Governance', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { value: 'Education', label: 'Education', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  { value: 'Safety', label: 'Safety', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  { value: 'Events', label: 'Events', color: 'pink', bgColor: 'bg-pink-100', textColor: 'text-pink-800' }
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

// Allowed file types and max size (5MB)
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AnnouncementForm({ 
  announcement = null, 
  onSave, 
  onCancel, 
  isOpen = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Community',
    status: 'draft',
    color: 'green',
    imageUrl: '',
    autoPublishDate: '',
    autoArchiveDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        description: announcement.description || '',
        category: announcement.category || 'Community',
        status: announcement.status || 'draft',
        color: announcement.color || 'green',
        imageUrl: announcement.imageUrl || '',
        autoPublishDate: announcement.autoPublishDate || '',
        autoArchiveDate: announcement.autoArchiveDate || ''
      });
      if (announcement.imageUrl) {
        setImagePreview(announcement.imageUrl);
      }
    }
  }, [announcement]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update color based on category
    if (field === 'category') {
      const selectedCategory = CATEGORIES.find(cat => cat.value === value);
      if (selectedCategory) {
        setFormData(prev => ({ ...prev, color: selectedCategory.color }));
      }
    }
  };

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, JPG, and WebP images are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const uploadImage = async () => {
    if (!selectedImage) return formData.imageUrl;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('folderPath', 'announcements');
      formData.append('uniqueId', Date.now().toString());

      const response = await fetch('/api/announcements/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      setIsUploading(false);
      setUploadProgress(0);
      return result.url || result.downloadURL;
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload image if selected
      if (selectedImage) {
        finalImageUrl = await uploadImage();
      }

      const submitData = {
        ...formData,
        imageUrl: finalImageUrl
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return CATEGORIES.find(cat => cat.value === categoryValue) || CATEGORIES[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {announcement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <p className="text-green-100 text-sm">Manage community announcements and updates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreview(!preview)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 flex items-center gap-1"
              >
                {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {preview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={onCancel}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter announcement description"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4" /> Image (Optional)
                  </label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-sm font-medium text-green-600 hover:text-green-500">
                              Click to upload
                            </span>
                            <span className="text-sm text-gray-500"> or drag and drop</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, JPEG, WebP up to 5MB
                          </p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                    )}
                    {isUploading && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto Publish Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" /> Auto Publish Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.autoPublishDate}
                    onChange={(e) => handleInputChange('autoPublishDate', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to publish immediately or set a future date
                  </p>
                </div>

                {/* Auto Archive Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Archive className="w-4 h-4" /> Auto Archive Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.autoArchiveDate}
                    onChange={(e) => handleInputChange('autoArchiveDate', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to keep announcement active indefinitely
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading || isUploading}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || isUploading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {announcement ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {announcement ? 'Update' : 'Create'}
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <Eye className="h-5 w-5" /> Preview
                </h3>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
                  <div className={`h-3 bg-${formData.color}-500`}></div>
                  <div className="p-6">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Announcement"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-center mb-4">
                      <div className={`w-10 h-10 rounded-full bg-${formData.color}-100 flex items-center justify-center mr-3`}>
                        <svg
                          className={`w-5 h-5 text-${formData.color}-600`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {formData.title || 'Announcement Title'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {formData.description || 'Announcement description will appear here...'}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className={`text-xs ${getCategoryInfo(formData.category).bgColor} ${getCategoryInfo(formData.category).textColor} py-1 px-2 rounded-full`}>
                        {formData.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        formData.status === 'published' ? 'bg-green-100 text-green-800' :
                        formData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 