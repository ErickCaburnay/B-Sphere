"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  Calendar,
  User,
  AlertCircle,
  Banknote
} from 'lucide-react';

export default function DocumentRequest() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');
  const [purpose, setPurpose] = useState('');
  const [requests, setRequests] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // Load existing requests (in a real app, this would come from an API)
      loadRequests();
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const loadRequests = () => {
    // Mock data for demonstration
    const mockRequests = [
      {
        id: 1,
        documentType: 'Barangay Clearance',
        purpose: 'Employment Requirements',
        status: 'pending',
        requestDate: '2024-01-15',
        expectedDate: '2024-01-20'
      },
      {
        id: 2,
        documentType: 'Certificate of Residency',
        purpose: 'Bank Account Opening',
        status: 'completed',
        requestDate: '2024-01-10',
        completedDate: '2024-01-12'
      },
      {
        id: 3,
        documentType: 'Barangay Indigency',
        purpose: 'Scholarship Application',
        status: 'rejected',
        requestDate: '2024-01-08',
        rejectedDate: '2024-01-09',
        remarks: 'Incomplete requirements'
      }
    ];
    setRequests(mockRequests);
  };

  const documentTypes = [
    {
      name: 'Barangay Clearance',
      description: 'Required for employment, business permits, and other legal purposes',
      fee: '₱50.00',
      processingTime: '3-5 business days',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Certificate of Residency',
      description: 'Proves your residency in the barangay',
      fee: '₱30.00',
      processingTime: '2-3 business days',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Barangay Indigency',
      description: 'For scholarship applications and financial assistance',
      fee: 'Free',
      processingTime: '3-5 business days',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Business Permit',
      description: 'Required for small business operations within the barangay',
      fee: '₱100.00',
      processingTime: '5-7 business days',
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Barangay ID',
      description: 'Official identification issued by the barangay',
      fee: '₱100.00',
      processingTime: '7-10 business days',
      color: 'from-red-500 to-red-600'
    }
  ];

  const handleSubmitRequest = async () => {
    if (!selectedDocument || !purpose.trim()) {
      alert('Please select a document type and provide a purpose.');
      return;
    }

    const newRequest = {
      id: Date.now(),
      documentType: selectedDocument,
      purpose: purpose.trim(),
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setRequests(prev => [newRequest, ...prev]);
    setShowRequestModal(false);
    setSelectedDocument('');
    setPurpose('');
    
    // Create notification for admin about new document request
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (user) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'document_request',
            title: 'New Document Request',
            message: `${user.firstName} ${user.lastName} has requested a ${selectedDocument}`,
            relatedId: newRequest.id.toString(),
            priority: 'medium'
          })
        });
      }
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the request process if notification fails
    }
    
    alert('Document request submitted successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'completed':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Document Request</h1>
            <p className="text-blue-100 text-lg">Request barangay certificates and documents</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/20 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>
      </div>

      {/* Available Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Available Documents</h2>
          <p className="text-gray-600 mt-1">Choose from our available document services</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.map((doc) => (
              <div key={doc.name} className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${doc.color}`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <Banknote className="w-4 h-4 text-green-600" />
                      {doc.fee}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{doc.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Processing: {doc.processingTime}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedDocument(doc.name);
                    setShowRequestModal(true);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-blue-500/5 transition-opacity duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Request History</h2>
          <p className="text-gray-600 mt-1">Track your document requests and their status</p>
        </div>
        
        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600 mb-6">Start by requesting your first document</p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Make a Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                return (
                  <div key={request.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.documentType}</h3>
                            <p className="text-sm text-gray-600">{request.purpose}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
                          </div>
                          {request.expectedDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Expected: {new Date(request.expectedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {request.remarks && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">Remarks:</span>
                            </div>
                            <p className="text-sm text-red-700 mt-1">{request.remarks}</p>
                          </div>
                        )}
                      </div>
                      <div className="ml-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(request.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="capitalize">{request.status}</span>
                        </div>
                        {request.status === 'completed' && (
                          <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">New Document Request</h3>
              <p className="text-blue-100 text-sm">Fill out the form below to request a document</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={selectedDocument}
                    onChange={(e) => setSelectedDocument(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select a document type</option>
                    {documentTypes.map((doc) => (
                      <option key={doc.name} value={doc.name}>
                        {doc.name} - {doc.fee}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purpose
                  </label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows="3"
                    placeholder="Please specify the purpose for this document..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 