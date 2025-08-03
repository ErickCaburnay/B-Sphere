"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Plus, Download, Eye, Pencil, Trash2, Table, Grid, Moon, Sun, Filter, Trash } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { ExportReports } from '@/components/residents/ExportReports';
import ComplaintFormModal from '@/components/complaints/ComplaintFormModal';
import ComplaintViewModal from '@/components/complaints/ComplaintViewModal';
import Pagination from '@/components/ui/Pagination';
import DashboardPageContainer from '@/components/DashboardPageContainer';

export default function ComplaintsPage() {
  // Remove mock data - start with empty array
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [darkMode, setDarkMode] = useState(false);
  const debounceTimeout = useRef(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bulk selection states
  const [selectedComplaints, setSelectedComplaints] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const filterOptions = [
    { label: "Filter By", value: "" },
    { label: "Noise Disturbance", value: "Noise Disturbance" },
    { label: "Property Dispute", value: "Property Dispute" },
    { label: "Pet Nuisance", value: "Pet Nuisance" },
    { label: "Illegal Parking", value: "Illegal Parking" },
    { label: "Vandalism", value: "Vandalism" },
    { label: "Garbage Disposal", value: "Garbage Disposal" },
    { label: "Construction Noise", value: "Construction Noise" },
    { label: "Street Light Outage", value: "Street Light Outage" },
    { label: "Water Leak", value: "Water Leak" },
    { label: "Illegal Vending", value: "Illegal Vending" },
    { label: "Road Damage", value: "Road Damage" },
    { label: "Loitering", value: "Loitering" },
    { label: "Pending", value: "Pending" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  // Fetch complaints from Firebase
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/complaints');
      const data = await response.json();
      
      if (response.ok) {
        setComplaints(data.complaints || []);
      } else {
        setError(data.error || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  // Load complaints on component mount
  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    let currentFilteredComplaints = complaints;
    if (searchText) {
      const keyword = searchText.toLowerCase();
      currentFilteredComplaints = currentFilteredComplaints.filter(complaint =>
        (complaint.complaintId && complaint.complaintId.toLowerCase().includes(keyword)) ||
        (complaint.type && complaint.type.toLowerCase().includes(keyword)) ||
        (complaint.respondent && complaint.respondent.toLowerCase().includes(keyword)) ||
        (complaint.complainant && complaint.complainant.toLowerCase().includes(keyword)) ||
        (complaint.officer && complaint.officer.toLowerCase().includes(keyword)) ||
        (complaint.status && complaint.status.toLowerCase().includes(keyword))
      );
    }
    if (filter) {
      currentFilteredComplaints = currentFilteredComplaints.filter(complaint =>
        (complaint.type && complaint.type.includes(filter)) || 
        (complaint.status && complaint.status.includes(filter))
      );
    }
    setFilteredComplaints(currentFilteredComplaints);
    setCurrentPage(1);
    // Reset selections when filtering
    setSelectedComplaints(new Set());
    setSelectAll(false);
  }, [complaints, searchText, filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedComplaints(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(currentComplaints.map(complaint => complaint.id));
      setSelectedComplaints(allIds);
      setSelectAll(true);
    }
  };

  const handleSelectComplaint = (complaintId) => {
    const newSelected = new Set(selectedComplaints);
    if (newSelected.has(complaintId)) {
      newSelected.delete(complaintId);
    } else {
      newSelected.add(complaintId);
    }
    setSelectedComplaints(newSelected);
    setSelectAll(newSelected.size === currentComplaints.length);
  };

  const handleBulkDelete = () => {
    if (selectedComplaints.size === 0) return;
    setShowPasswordModal(true);
  };

  const verifyAdminPassword = async () => {
    setIsVerifyingPassword(true);
    setPasswordError("");

    try {
      // Here you would typically verify against your auth system
      // For now, I'll simulate a password check
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setShowBulkDeleteModal(true);
        setAdminPassword("");
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (error) {
      // Fallback password check (remove this in production)
      if (adminPassword === "admin123") {
        setShowPasswordModal(false);
        setShowBulkDeleteModal(true);
        setAdminPassword("");
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedComplaints).map(async (complaintId) => {
        const response = await fetch(`/api/complaints?id=${complaintId}`, {
          method: 'DELETE',
        });
        return response.ok;
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;

      if (successCount === selectedComplaints.size) {
        await fetchComplaints();
        setSelectedComplaints(new Set());
        setSelectAll(false);
        setShowBulkDeleteModal(false);
        alert(`Successfully deleted ${successCount} complaint(s)`);
      } else {
        alert(`Deleted ${successCount} out of ${selectedComplaints.size} complaints. Some deletions failed.`);
      }
    } catch (error) {
      console.error('Error bulk deleting complaints:', error);
      alert('Failed to delete complaints');
    }
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const handleSearchChange = (e) => setSearchText(e.target.value);
  const clearSearch = () => {
    setSearchText("");
    setCurrentPage(1);
  };
  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };
  const handleEditComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowEditModal(true);
  };
  const handleDeleteComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDeleteModal(true);
  };

  // Add complaint with Firebase API
  const handleAddComplaint = async (data) => {
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh complaints list
        await fetchComplaints();
    setShowAddModal(false);
        alert('Complaint submitted successfully!');
      } else {
        alert(result.error || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint');
    }
  };

  // Update complaint with Firebase API
  const handleUpdateComplaint = async (data) => {
    try {
      const response = await fetch('/api/complaints', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh complaints list
        await fetchComplaints();
    setShowEditModal(false);
        alert('Complaint updated successfully!');
      } else {
        alert(result.error || 'Failed to update complaint');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint');
    }
  };

  // Delete complaint with Firebase API
  const confirmDeleteComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      const response = await fetch(`/api/complaints?id=${selectedComplaint.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh complaints list
        await fetchComplaints();
        setShowDeleteModal(false);
        setSelectedComplaint(null);
        alert('Complaint deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete complaint');
      }
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint');
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardPageContainer 
        heading="Complaint Records"
        subtitle="Track and manage community complaints and resolutions"
      >
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </DashboardPageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardPageContainer 
        heading="Complaint Records"
        subtitle="Track and manage community complaints and resolutions"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Complaints</div>
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={fetchComplaints}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </DashboardPageContainer>
    );
  }

  return (
    <DashboardPageContainer 
      heading="Complaint Records"
      subtitle="Track and manage community complaints and resolutions"
    >
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchText}
              onChange={handleSearchChange}
              className="pl-10 pr-12 py-2 border border-gray-300 text-gray-900 rounded-md w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {searchText && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>
        {/* Filter Icon */}
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Filter"
          // onClick={handleFilterToggle} // Add filter panel logic if needed
        >
          <Filter className="h-5 w-5" />
        </button>
        {/* View Toggle, Export, Bulk Delete, Add */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg ${viewMode === 'table' 
              ? 'bg-blue-100 text-blue-600' 
              : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Table className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' 
              ? 'bg-blue-100 text-blue-600' 
              : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <ExportReports data={filteredComplaints} type="complaints" />
          {/* Bulk Delete Button - only show when items are selected */}
          {selectedComplaints.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
              title={`Delete ${selectedComplaints.size} selected complaint(s)`}
            >
              <Trash className="h-5 w-5" />
              <span>Delete ({selectedComplaints.size})</span>
            </button>
          )}
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2
              ${darkMode ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5" />
            <span>File a Complaint</span>
          </button>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedComplaints.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            {selectedComplaints.size} complaint(s) selected
            <button
              onClick={() => {
                setSelectedComplaints(new Set());
                setSelectAll(false);
              }}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Clear selection
            </button>
          </p>
        </div>
      )}

      {/* Empty state */}
      {complaints.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Complaints Found</h3>
          <p className="text-gray-600 mb-6">Start by filing your first complaint</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>File a Complaint</span>
          </button>
        </div>
      )}

      {/* Table/Grid View */}
      {complaints.length > 0 && (
      <div className={`rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-600">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-5 h-5 appearance-none bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 hover:border-gray-400 checked:bg-teal-500 checked:border-teal-500 cursor-pointer shadow-sm"
                        />
                        {selectAll && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Complaint ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Type of Complaint</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Respondent</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Complainant</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Date Filed</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Assigned Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Resolution Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>  
                {currentComplaints.map((complaint) => (
                  <tr key={complaint.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}> 
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedComplaints.has(complaint.id)}
                            onChange={() => handleSelectComplaint(complaint.id)}
                            className="w-5 h-5 appearance-none bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 hover:border-gray-400 checked:bg-teal-500 checked:border-teal-500 cursor-pointer shadow-sm"
                          />
                          {selectedComplaints.has(complaint.id) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.complaintId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.respondent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.complainant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.dateFiled}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.officer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.resolutionDate || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewComplaint(complaint)}
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                          {/* Hide edit button for resolved/cancelled complaints */}
                          {complaint.status !== 'Resolved' && complaint.status !== 'Cancelled' && (
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleEditComplaint(complaint)}
                          title="Edit Complaint"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {currentComplaints.map(complaint => (
              <div
                key={complaint.id}
                  className={`rounded-lg shadow p-4 ${darkMode ? 'bg-gray-700' : 'bg-white'} ${
                    selectedComplaints.has(complaint.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedComplaints.has(complaint.id)}
                          onChange={() => handleSelectComplaint(complaint.id)}
                          className="w-5 h-5 appearance-none bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all duration-200 hover:border-gray-400 checked:bg-teal-500 checked:border-teal-500 cursor-pointer shadow-sm"
                        />
                        {selectedComplaints.has(complaint.id) && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{complaint.type}</h3>
                    </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewComplaint(complaint)}
                      className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                      {/* Hide edit button for resolved/cancelled complaints */}
                      {complaint.status !== 'Resolved' && complaint.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleEditComplaint(complaint)}
                      className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
                      title="Edit Complaint"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                      )}
                  </div>
                </div>
                <div className="space-y-2">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>ID: {complaint.complaintId}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Respondent: {complaint.respondent}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Complainant: {complaint.complainant}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date Filed: {complaint.dateFiled}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Officer: {complaint.officer}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status: {complaint.status}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolution Date: {complaint.resolutionDate || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Pagination */}
      {complaints.length > 0 && (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        totalEntries={filteredComplaints.length}
        startEntry={startIndex + 1}
        endEntry={Math.min(endIndex, filteredComplaints.length)}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={v => { setRowsPerPage(v); setCurrentPage(1); }}
        className="mt-2"
      />
      )}

      {/* Modals */}
      {showAddModal && (
        <ComplaintFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddComplaint}
        />
      )}
      {showEditModal && (
        <ComplaintFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateComplaint}
          initialData={selectedComplaint}
          isEdit
        />
      )}
      {showViewModal && (
        <ComplaintViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          complaint={selectedComplaint}
        />
      )}

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Admin Verification Required</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Please enter your admin password to proceed with deleting {selectedComplaints.size} complaint(s).
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your password"
                onKeyPress={(e) => e.key === 'Enter' && verifyAdminPassword()}
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setAdminPassword("");
                  setPasswordError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isVerifyingPassword}
              >
                Cancel
              </button>
              <button
                onClick={verifyAdminPassword}
                disabled={!adminPassword || isVerifyingPassword}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingPassword ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Bulk Delete</h3>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                You are about to permanently delete <strong>{selectedComplaints.size}</strong> complaint(s).
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ This action cannot be undone. All complaint data, including associated records and history, will be permanently removed from the system.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete complaint {selectedComplaint?.complaintId}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComplaint}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardPageContainer>
  );
}