"use client";

import { useState, useCallback } from 'react';
import { Upload, X, FileCheck, AlertCircle } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase'; // Import db from firebase.js instead of firebase-admin

// Allowed file types and max size (5MB)
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export default function FileUploadForm({ permitId, applicantId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PDF and images (JPEG, PNG) are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newErrors = {};
    const validFiles = selectedFiles.filter(file => {
      const error = validateFile(file);
      if (error) {
        newErrors[file.name] = error;
        return false;
      }
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setErrors(newErrors);
  };

  const removeFile = (fileName) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[fileName];
      return newErrors;
    });
  };

  const uploadFile = async (file) => {
    if (!permitId) {
      throw new Error('Permit ID is required for file upload');
    }

    const storageRef = ref(storage, `business_permits/${permitId}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.round(progress)
          }));
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const fileMetadata = {
              fileName: file.name,
              fileType: file.type,
              fileURL: downloadURL,
              uploadedAt: new Date().toISOString()
            };
            
            // Update Firestore with file metadata using client-side SDK
            const permitRef = doc(db, 'business_permits', permitId);
            await updateDoc(permitRef, {
              attachments: arrayUnion(fileMetadata)
            });

            resolve(fileMetadata);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = files.map(file => uploadFile(file));

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      onUploadComplete?.(uploadedFiles);
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to upload some files. Please try again.'
      }));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Input Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
        <div className="flex flex-col items-center justify-center space-y-3">
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
                accept={ALLOWED_FILE_TYPES.join(',')}
                disabled={isUploading}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">
            Supported formats: PDF, JPEG, PNG (max 5MB per file)
          </p>
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Selected Files:</h3>
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.name}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileCheck className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  {uploadProgress[file.name] !== undefined && (
                    <span className="text-sm text-gray-500">
                      {uploadProgress[file.name]}%
                    </span>
                  )}
                  <button
                    onClick={() => removeFile(file.name)}
                    className="text-red-500 hover:text-red-600"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {Object.entries(errors).length > 0 && (
        <div className="space-y-2">
          {Object.entries(errors).map(([fileName, error]) => (
            <div
              key={fileName}
              className="flex items-center space-x-2 text-red-500 text-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Files'}
        </button>
      )}
    </div>
  );
} 