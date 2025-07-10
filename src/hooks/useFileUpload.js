"use client";

import { useState, useCallback, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Allowed file types and max size (5MB)
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export function useFileUpload(folderPath, uniqueId) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PDF and images (JPEG, PNG) are allowed.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit.';
    }
    return null;
  };

  const handleFileSelect = useCallback((eventOrFiles) => {
    // Handle both event objects and direct FileList/Array objects
    const selectedFiles = Array.from(
      eventOrFiles.target?.files || eventOrFiles
    );
    
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
  }, []);

  const removeFile = useCallback((fileName) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    setErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[fileName];
      return newErrors;
    });
    setUploadProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      delete newProgress[fileName];
      return newProgress;
    });
  }, []);

  const deleteFile = useCallback(async (fileName) => {
    if (!uniqueId || !folderPath) {
      throw new Error('Missing required parameters for file deletion');
    }

    if (!user) {
      throw new Error('User must be authenticated to delete files');
    }

    try {
      // Delete from Storage
      const storageRef = ref(storage, `${folderPath}/${uniqueId}/${fileName}`);
      await deleteObject(storageRef);

      // Update state
      setUploadedFiles(prevFiles => prevFiles.filter(file => file.fileName !== fileName));
      
      // Clear any related errors
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[fileName];
        return newErrors;
      });

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      setErrors(prev => ({
        ...prev,
        [fileName]: 'Failed to delete file. Please try again.'
      }));
      throw error;
    }
  }, [folderPath, uniqueId, user]);

  const clearAll = useCallback(async () => {
    try {
      // Delete all uploaded files from storage
      for (const file of uploadedFiles) {
        try {
          await deleteFile(file.fileName);
        } catch (error) {
          console.error(`Error deleting file ${file.fileName}:`, error);
        }
      }
      
      // Reset all states
      setFiles([]);
      setUploadProgress({});
      setErrors({});
      setUploadedFiles([]);
      
      // Reset file input if it exists
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error clearing files:', error);
      throw error;
    }
  }, [uploadedFiles, deleteFile]);

  const uploadFile = useCallback(async (file) => {
    if (!uniqueId || !folderPath) {
      throw new Error('Missing required parameters for file upload');
    }

    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    // Get a fresh ID token before upload
    const idToken = await user.getIdToken(true);

    const storageRef = ref(storage, `${folderPath}/${uniqueId}/${file.name}`);
    const metadata = {
      customMetadata: {
        uploadedBy: user.uid,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

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
          setErrors(prev => ({
            ...prev,
            [file.name]: 'Failed to upload file. Please try again.'
          }));
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const fileMetadata = {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              downloadURL,
              uploadedAt: new Date().toISOString(),
              uploadedBy: user.uid
            };

            setUploadedFiles(prev => [...prev, fileMetadata]);
            resolve(fileMetadata);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  }, [folderPath, uniqueId, user]);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    setIsUploading(true);
    const uploadPromises = files.map(file => uploadFile(file));

    try {
      await Promise.all(uploadPromises);
      setFiles([]); // Clear selected files after successful upload
      setUploadProgress({}); // Reset progress
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to upload some files. Please try again.'
      }));
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadFile, user]);

  return {
    files,
    uploadProgress,
    errors,
    isUploading,
    uploadedFiles,
    handleFileSelect,
    removeFile,
    deleteFile,
    handleUpload,
    clearAll
  };
} 