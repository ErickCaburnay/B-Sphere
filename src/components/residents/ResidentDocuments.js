"use client";

import { useState } from 'react';
import { Upload, X, FileText, Image } from 'lucide-react';

export function ResidentDocuments({ resident, onClose }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState('photo');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('residentId', resident.id);
      formData.append('type', uploadType);

      const response = await fetch('/api/residents/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      // Reset form
      setSelectedFile(null);
      setUploadType('photo');
      
      // Refresh resident data
      window.location.reload();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/residents/documents?id=${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Refresh resident data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Photo Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Photo</h3>
        <div className="flex items-center gap-4">
          {resident.photo ? (
            <div className="relative">
              <img
                src={resident.photo}
                alt={`${resident.fullName}&apos;s photo`}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleDelete(resident.documents.find(d => d.type === 'photo')?.id)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Upload Photo
            </label>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resident.documents
            ?.filter(doc => doc.type === 'document')
            .map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-gray-500" />
                  <span className="text-sm">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="document-upload"
          />
          <label
            htmlFor="document-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </label>
        </div>
      </div>

      {/* Upload Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload {uploadType === 'photo' ? 'Photo' : 'Document'}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">File:</span>
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 