"use client";

import { useState, useRef } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function BatchUploadModal({ isOpen, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setValidationErrors([]);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/residents/template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'residents-template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setValidationErrors([]);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/residents/batch-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          setValidationErrors(result.details);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
        return;
      }

      setUploadResult(result);
      toast.success(`Successfully uploaded ${result.processed} residents`);
      
      // Call onSuccess callback to refresh the residents list
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setValidationErrors([]);
    setUploadResult(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Batch Upload Residents</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Download the Excel template below</li>
              <li>Fill in the resident data using dropdown options and proper formats</li>
              <li>Birthplace format: "MUNICIPALITY/CITY, PROVINCE" (e.g., DASMARINAS, CAVITE)</li>
              <li>Use dropdown menus for predefined fields</li>
              <li>Remove the sample row before uploading</li>
              <li>Upload the completed file</li>
            </ol>
          </div>

          {/* Download Template */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-medium">Excel Template with Data Validation</h3>
                <p className="text-sm text-gray-500">Pre-configured with dropdown menus and format validation</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            {selectedFile ? (
              <div className="space-y-3">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  disabled={isUploading}
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-600 font-medium">
                    Drag & drop your Excel file here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800"
                      disabled={isUploading}
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports .xlsx and .xls files (max 10MB)<br/>
                    Use the template above for proper data validation
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-900">Validation Errors</h3>
              </div>
              <div className="max-h-40 overflow-y-auto">
                <ul className="text-sm text-red-800 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">Upload Successful</h3>
              </div>
              <p className="text-sm text-green-800">
                Successfully processed {uploadResult.processed} out of {uploadResult.total} records.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isUploading}
            >
              {uploadResult ? 'Close' : 'Cancel'}
            </button>
            
            {!uploadResult && (
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload File
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 