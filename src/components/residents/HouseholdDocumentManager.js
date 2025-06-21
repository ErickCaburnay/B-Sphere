"use client";

import { useState } from 'react';
import { Upload, FileText, X, Download, Eye, Plus, Trash2, FolderOpen, AlertTriangle } from 'lucide-react';

export function HouseholdDocumentManager({ householdId, onUpload, onDelete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [documents, setDocuments] = useState([
    // Mock data for demonstration
    {
      id: 'doc1',
      name: 'Household Proof of Address.pdf',
      type: 'pdf',
      size: '1.2MB',
      uploadDate: '2023-03-15',
      url: '/path/to/household_proof_of_address.pdf'
    },
    {
      id: 'doc2',
      name: 'Household Census Form.docx',
      type: 'docx',
      size: '0.5MB',
      uploadDate: '2023-04-01',
      url: '/path/to/household_census_form.docx'
    },
  ]);

  const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > FILE_SIZE_LIMIT) {
        setUploadError('File size exceeds 5MB limit.');
        setSelectedFile(null);
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUploadError('Unsupported file type. Please upload PDF, image, or document files.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const newDoc = {
        id: `doc${Date.now()}`,
        name: selectedFile.name,
        type: selectedFile.type.split('/')[1] || 'file',
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        url: URL.createObjectURL(selectedFile) // For client-side preview/download
      };

      setDocuments(prev => [...prev, newDoc]);
      setSelectedFile(null);
      // Call parent onUpload if provided
      if (onUpload) onUpload(newDoc);

    } catch (error) {
      setUploadError('Failed to upload document. Please try again.');
      console.error('Document upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        // Call parent onDelete if provided
        if (onDelete) onDelete(docId);
      } catch (error) {
        console.error('Document deletion error:', error);
      }
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'jpeg':
      case 'png':
        return <img src="/path/to/image-icon.png" alt="image icon" className="w-6 h-6" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Household Documents {householdId ? `for Household ID: ${householdId}` : ''}</h3>

      {/* Document Upload Section */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFileSelect({ target: { files: [file] } });
        }}
      >
        <input
          type="file"
          id="document-upload"
          className="hidden"
          onChange={handleFileSelect}
          accept={ALLOWED_FILE_TYPES.join(',')}
        />
        <label htmlFor="document-upload" className="cursor-pointer block">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">Drag & drop files here, or <span className="text-blue-600">browse</span></p>
          <p className="text-xs text-gray-500 mt-1">Max file size: 5MB (PDF, JPG, PNG, DOCX, XLSX)</p>
        </label>
        {selectedFile && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
            <FileText size={16} />
            <span>{selectedFile.name} - {(selectedFile.size / 1024).toFixed(2)} KB</span>
            <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700 ml-2">
              <X size={16} />
            </button>
          </div>
        )}
        {uploadError && (
          <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
            <AlertTriangle size={16} /> {uploadError}
          </p>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="mt-4 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900">Uploaded Documents</h4>
          {documents.length > 0 && (
            <button
              onClick={() => { /* Implement bulk download */ }}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download size={16} /> Bulk Download
            </button>
          )}
        </div>
        
        {documents.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {documents.map(doc => (
              <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.type)}
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.size} - Uploaded on {doc.uploadDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-800" title="View Document"
                  >
                    <Eye size={18} />
                  </a>
                  <a
                    href={doc.url}
                    download
                    className="p-2 text-gray-600 hover:text-gray-800" title="Download Document"
                  >
                    <Download size={18} />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-600 hover:text-red-800" title="Delete Document"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">No documents uploaded for this household yet.</p>
        )}
      </div>
    </div>
  );
}