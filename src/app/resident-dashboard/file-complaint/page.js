"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function FileComplaint() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintData, setComplaintData] = useState({
    category: '',
    subject: '',
    description: '',
    location: '',
    priority: 'medium'
  });
  const [complaints, setComplaints] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadComplaints();
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const loadComplaints = () => {
    // Mock data for demonstration
    const mockComplaints = [
      {
        id: 1,
        category: 'Noise Complaint',
        subject: 'Loud music from neighbor',
        description: 'Neighbor has been playing loud music every night past 10 PM, disturbing the peace in our area.',
        location: 'Block 5, Lot 12',
        priority: 'medium',
        status: 'under_investigation',
        dateSubmitted: '2024-01-15',
        lastUpdate: '2024-01-16',
        assignedTo: 'Brgy. Official Juan Dela Cruz'
      },
      {
        id: 2,
        category: 'Infrastructure',
        subject: 'Broken streetlight',
        description: 'The streetlight on Main Street has been broken for two weeks, making the area unsafe at night.',
        location: 'Main Street corner Oak Ave',
        priority: 'high',
        status: 'resolved',
        dateSubmitted: '2024-01-10',
        lastUpdate: '2024-01-14',
        resolution: 'Streetlight has been repaired and is now functioning properly.'
      },
      {
        id: 3,
        category: 'Public Safety',
        subject: 'Stray dogs in the area',
        description: 'There are several stray dogs roaming around the playground area, which could be dangerous for children.',
        location: 'Community Playground',
        priority: 'high',
        status: 'pending',
        dateSubmitted: '2024-01-12',
        lastUpdate: '2024-01-12'
      }
    ];
    setComplaints(mockComplaints);
  };

  const complaintCategories = [
    'Noise Complaint',
    'Infrastructure',
    'Public Safety',
    'Environmental',
    'Traffic & Transportation',
    'Public Services',
    'Community Issues',
    'Other'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-700 bg-green-50 border-green-200' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    { value: 'high', label: 'High', color: 'text-red-700 bg-red-50 border-red-200' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'text-gray-700 bg-gray-50 border-gray-200', icon: Clock },
    { value: 'under_investigation', label: 'Under Investigation', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: AlertCircle },
    { value: 'resolved', label: 'Resolved', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComplaintData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitComplaint = () => {
    if (!complaintData.category || !complaintData.subject.trim() || !complaintData.description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const newComplaint = {
      id: Date.now(),
      ...complaintData,
      status: 'pending',
      dateSubmitted: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setShowComplaintModal(false);
    setComplaintData({
      category: '',
      subject: '',
      description: '',
      location: '',
      priority: 'medium'
    });
    
    alert('Complaint submitted successfully! You will receive updates on its progress.');
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const getPriorityInfo = (priority) => {
    return priorityLevels.find(level => level.value === priority) || priorityLevels[1];
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
            <h1 className="text-3xl font-bold mb-2">File a Complaint</h1>
            <p className="text-blue-100 text-lg">Report issues and concerns to the barangay office</p>
          </div>
          <button
            onClick={() => setShowComplaintModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 border border-white/20 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Complaint
          </button>
        </div>
      </div>

      {/* Complaint Guidelines */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 text-lg mb-3">Filing Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Provide clear and detailed descriptions of the issue
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Include specific location information when applicable
                </li>
              </ul>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Select appropriate priority level based on urgency
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  You will receive updates on your complaint's progress
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Complaint Overview</h2>
          <p className="text-gray-600 mt-1">Track the status of your submitted complaints</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statusOptions.map((status) => {
              const count = complaints.filter(c => c.status === status.value).length;
              const StatusIcon = status.icon;
              return (
                <div key={status.value} className={`${status.color} border rounded-xl p-6 transition-all hover:shadow-md`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium mb-1">{status.label}</p>
                      <p className="text-3xl font-bold">{count}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${status.color.replace('border-', 'bg-').replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      <StatusIcon className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Complaints</h2>
          <p className="text-gray-600 mt-1">View and track all your submitted complaints</p>
        </div>
        
        <div className="p-6">
          {complaints.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints filed yet</h3>
              <p className="text-gray-600 mb-6">Report any issues or concerns to help improve our community</p>
              <button
                onClick={() => setShowComplaintModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                File Your First Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {complaints.map((complaint) => {
                const statusInfo = getStatusInfo(complaint.status);
                const priorityInfo = getPriorityInfo(complaint.priority);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={complaint.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-50 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{complaint.subject}</h3>
                            <p className="text-sm text-gray-600">{complaint.category}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">{complaint.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Filed: {new Date(complaint.dateSubmitted).toLocaleDateString()}</span>
                          </div>
                          {complaint.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>Location: {complaint.location}</span>
                            </div>
                          )}
                          {complaint.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>Assigned to: {complaint.assignedTo}</span>
                            </div>
                          )}
                        </div>

                        {complaint.resolution && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-green-800">Resolution</span>
                            </div>
                            <p className="text-sm text-green-700">{complaint.resolution}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6 text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusInfo.label}</span>
                        </div>
                        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${priorityInfo.color}`}>
                          <AlertCircle className="w-4 h-4" />
                          <span>{priorityInfo.label} Priority</span>
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

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">File New Complaint</h3>
              <p className="text-orange-100 text-sm">Help us improve our community by reporting issues</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={complaintData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    >
                      <option value="">Select a category</option>
                      {complaintCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={complaintData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    >
                      {priorityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={complaintData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={complaintData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Specific location where the issue occurred"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={complaintData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Provide detailed information about the issue, including when it occurred and any relevant details..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowComplaintModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitComplaint}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg"
                >
                  Submit Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 