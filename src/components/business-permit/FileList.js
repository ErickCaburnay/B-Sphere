"use client";

import { useState } from 'react';
import { FileText, Trash2, Download, AlertCircle } from 'lucide-react';
import { ref, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

export default function FileList({ files, permitId, isAdmin, onFileDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async (file) => {
    if (!permitId) {
      setError('Cannot delete file: Permit ID is missing');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // Delete from Storage
      const storageRef = ref(storage, `business_permits/${permitId}/${file.fileName}`);
      await deleteObject(storageRef);

      // Update Firestore
      const permitRef = doc(db, 'business_permits', permitId);
      await updateDoc(permitRef, {
        attachments: arrayRemove(file)
      });

      onFileDeleted?.(file);
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!files?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Uploaded Files:</h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.fileName}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700">{file.fileName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={file.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
              {(isAdmin || !isAdmin) && (
                <button
                  onClick={() => handleDelete(file)}
                  disabled={isDeleting}
                  className="p-1.5 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 