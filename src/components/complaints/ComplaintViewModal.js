import React from 'react';

export default function ComplaintViewModal({ isOpen, onClose, complaint }) {
  if (!isOpen || !complaint) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl font-bold mb-4">Complaint Details</h2>
        <div className="space-y-2">
          <div><span className="font-medium">Complaint ID:</span> {complaint.id}</div>
          <div><span className="font-medium">Type:</span> {complaint.type}</div>
          <div><span className="font-medium">Respondent:</span> {complaint.respondent}</div>
          <div><span className="font-medium">Complainant:</span> {complaint.complainant}</div>
          <div><span className="font-medium">Date Filed:</span> {complaint.dateFiled}</div>
          <div><span className="font-medium">Assigned Officer:</span> {complaint.officer}</div>
          <div><span className="font-medium">Status:</span> {complaint.status}</div>
          <div><span className="font-medium">Resolution Date:</span> {complaint.resolutionDate}</div>
        </div>
      </div>
    </div>
  );
} 