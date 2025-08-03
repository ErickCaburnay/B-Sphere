"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Search, X, ChevronDown, Download, Filter, Plus, 
  Eye, Edit, Trash2, Calendar, Clock, CheckCircle, 
  AlertCircle, XCircle, FileText, Users, TrendingUp,
  Grid3x3, List, MoreVertical, RefreshCw, Settings,
  ArrowUpDown, ArrowUp, ArrowDown, Bell, Star, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentViewModal } from "@/components/DocumentViewModal";
import DocumentApplicationModal from "@/components/DocumentApplicationModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/ui/Pagination";
import { ensureTokenCookie } from "@/lib/auth-utils";
import { debounce } from 'lodash';

// Simple stable state management
let globalServicesData = [];
let globalIsLoading = true;
let globalIsInitialized = false;

function ServicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortBy, setSortBy] = useState("dateFiled");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(globalIsLoading);
  const [refreshing, setRefreshing] = useState(false);
  const [servicesData, setServicesData] = useState(globalServicesData);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false);
  
  // Resident search states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Stable refs
  const mountCountRef = useRef(0);
  const initializationPromiseRef = useRef(null);
  const isUnmountingRef = useRef(false);

  // Simple sidebar detection
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarElement = document.querySelector('aside');
      if (sidebarElement) {
        const computedStyle = window.getComputedStyle(sidebarElement);
        const isExpanded = computedStyle.display !== 'none' && 
                          parseInt(computedStyle.width) > 100;
        setIsDesktopSidebarExpanded(isExpanded);
      }
    };

    checkSidebarState();
    window.addEventListener('resize', checkSidebarState);
    return () => window.removeEventListener('resize', checkSidebarState);
  }, []);

  // Stable initialization
  useEffect(() => {
    mountCountRef.current += 1;
    const currentMount = mountCountRef.current;
    
    console.log(`Services page - Mount #${currentMount}`);

    // If already initialized, use existing data
    if (globalIsInitialized && !globalIsLoading) {
      console.log('Services page - Using cached data');
      if (!isUnmountingRef.current) {
        setServicesData(globalServicesData);
        setLoading(false);
      }
      return () => {
        console.log(`Services page - Unmounting #${currentMount} (cached)`);
        isUnmountingRef.current = true;
      };
    }

    // Start new initialization
    initializationPromiseRef.current = initializeServices();

    async function initializeServices() {
      try {
        console.log('Services page - Starting initialization');
        
        // Auth check
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
          console.error('Services page - Missing authentication data');
          globalServicesData = [];
          globalIsLoading = false;
          globalIsInitialized = true;
          if (!isUnmountingRef.current) {
            setServicesData([]);
            setLoading(false);
          }
          return;
        }

        // Ensure token cookie
        try {
          ensureTokenCookie();
        } catch (error) {
          console.error('Services page - Cookie error:', error);
        }

        // Fetch data
        console.log('Services page - Fetching data from API');
        const response = await fetch('/api/document-requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error('Services page - Authentication failed');
            globalServicesData = [];
            globalIsLoading = false;
            globalIsInitialized = true;
            if (!isUnmountingRef.current) {
              setServicesData([]);
              setLoading(false);
            }
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const requests = data.data || data;

        // Process documents with error handling
        const documents = requests.map(doc => {
          try {
            // Helper function to safely parse dates
            const parseDate = (dateField) => {
              if (!dateField) return null;
              
              // Handle Firestore timestamp format
              if (dateField.seconds) {
                return new Date(dateField.seconds * 1000).toISOString().split('T')[0];
              }
              
              // Handle ISO string format
              if (typeof dateField === 'string') {
                return new Date(dateField).toISOString().split('T')[0];
              }
              
              // Handle Date object
              if (dateField instanceof Date) {
                return dateField.toISOString().split('T')[0];
              }
              
              return new Date().toISOString().split('T')[0];
            };

            const baseDocument = {
              id: doc.id,
              transactionNo: doc.id,
              dateFiled: parseDate(doc.createdAt),
              nameOfApplicant: doc.fullName || '',
              purpose: doc.purpose || '',
              type: doc.documentType || '',
              status: doc.status || 'PENDING',
              dateIssued: parseDate(doc.issuedAt),
              priority: doc.priority || 'medium',
              estimatedCompletion: doc.estimatedCompletion || null,
              applicantContact: doc.contactNumber || '',
              processingTime: '3 days',
              fee: doc.fee || '₱0.00'
            };

            return baseDocument;
          } catch (error) {
            console.error('Error processing document:', error);
            return null;
          }
        }).filter(doc => doc !== null);

        console.log(`Services page - Processed ${documents.length} documents`);

        // Update global state
        globalServicesData = documents;
        globalIsLoading = false;
        globalIsInitialized = true;

        // Update component state if still mounted
        if (!isUnmountingRef.current) {
          setServicesData(documents);
          setLoading(false);
        }

      } catch (error) {
        console.error('Services page - Initialization error:', error);
        globalServicesData = [];
        globalIsLoading = false;
        globalIsInitialized = true;
        if (!isUnmountingRef.current) {
          setServicesData([]);
          setLoading(false);
        }
      }
    }

    // Cleanup function
    return () => {
      console.log(`Services page - Unmounting #${currentMount}`);
      isUnmountingRef.current = true;
    };
  }, []); // Empty dependency array for stable initialization

  // Handle creating new request
  const handleCreateRequest = async () => {
    if (!editFormData.fullName || !editFormData.documentType || !editFormData.purpose) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const requestData = {
        fullName: editFormData.fullName.trim(),
        contactNumber: editFormData.contactNumber?.trim() || '',
        email: editFormData.email?.trim() || '',
        address: editFormData.address?.trim() || '',
        documentType: editFormData.documentType,
        purpose: editFormData.purpose.trim(),
        priority: editFormData.priority || 'medium',
        fee: getDocumentFee(editFormData.documentType),
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const response = await fetch('/api/document-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }

      const result = await response.json();
      
      // Create a local representation for immediate display
      const newDocument = {
        id: result.requestId,
        transactionNo: result.requestId,
        dateFiled: new Date().toISOString().split('T')[0],
        nameOfApplicant: editFormData.fullName,
        purpose: editFormData.purpose,
        type: editFormData.documentType,
        status: 'APPROVED',
        dateIssued: null,
        priority: editFormData.priority || 'medium',
        estimatedCompletion: requestData.estimatedCompletion,
        applicantContact: editFormData.contactNumber || '',
        processingTime: '3 days',
        fee: requestData.fee
      };

      // Update the services data
      setServicesData(prev => [newDocument, ...prev]);
      globalServicesData = [newDocument, ...globalServicesData];
      
      // Close modal and reset form
      setIsEditModalOpen(false);
      setEditFormData({});
      setUpdateSuccess(true);
      
      alert('Document request created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error creating request:', error);
      alert(`Failed to create request: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getDocumentFee = (documentType) => {
    const fees = {
      'Barangay Clearance': '₱50.00',
      'Barangay Certificate': '₱30.00',
      'Barangay Indigency': 'Free',
      'Business Permit': '₱100.00',
      'Barangay ID': '₱100.00'
    };
    return fees[documentType] || '₱0.00';
  };

  // Resident search functions
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const searchResidents = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/residents/search?q=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok) {
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        } else {
          console.error("Error searching residents:", data.error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error searching residents:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
  );

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchResidents(query);
  };

  const handleSelectResident = (resident) => {
    const fullName = `${resident.firstName || ''} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName || ''}`.trim();
    
    setEditFormData(prev => ({
      ...prev,
      fullName: fullName,
      contactNumber: resident.contactNumber || resident.phoneNumber || '',
      email: resident.email || '',
      address: resident.address || '',
      residentId: resident.id || resident.uniqueId
    }));
    
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle document selection from Apply modal
  const handleSelectDocumentType = (documentType) => {
    setIsApplyModalOpen(false);
    setEditFormData({ documentType });
    setIsEditModalOpen(true);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = servicesData.filter(service => {
      const matchesSearch = searchTerm === "" || 
        service.nameOfApplicant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.transactionNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || service.status === statusFilter;
      const matchesType = typeFilter === "all" || service.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'dateFiled' || sortBy === 'dateIssued') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [servicesData, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedServices.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentServices = filteredAndSortedServices.slice(startIndex, endIndex);

  // Reset to first page if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading services..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Services</h1>
          <p className="text-gray-600">Manage document requests and applications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, transaction number, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="REJECTED">Rejected</option>
              <option value="REJECT">Reject</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Barangay Clearance">Barangay Clearance</option>
              <option value="Certificate of Indigency">Certificate of Indigency</option>
              <option value="Barangay Certificate">Barangay Certificate</option>
              <option value="Business Permit">Business Permit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Filed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentServices.length > 0 ? (
                currentServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.transactionNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.nameOfApplicant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.dateFiled}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        service.status?.toUpperCase() === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        service.status?.toUpperCase() === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        service.status?.toUpperCase() === 'IN PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        service.status?.toUpperCase() === 'REJECTED' || service.status?.toUpperCase() === 'REJECT' ? 'bg-red-100 text-red-800' :
                        service.status?.toUpperCase() === 'CANCELLED' ? 'bg-violet-100 text-violet-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedDocument(service);
                          setIsViewModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="w-12 h-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No services found</p>
                      <p className="text-sm">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'No document requests have been created yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
            totalEntries={filteredAndSortedServices.length}
            startEntry={filteredAndSortedServices.length > 0 ? Math.min(startIndex + 1, filteredAndSortedServices.length) : 0}
            endEntry={Math.min(endIndex, filteredAndSortedServices.length)}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedDocument && (
        <DocumentViewModal
          document={selectedDocument}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Apply Modal */}
      <DocumentApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSelectDocumentType={handleSelectDocumentType}
      />

      {/* Add New Request Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add New Document Request</h2>
                    <p className="text-green-100 text-sm">Create a document request on behalf of a resident</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditFormData({});
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Form Content */}
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <div className="space-y-8">
                
                {/* Search Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="bg-green-100 rounded-full p-2">
                      <Search className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Resident Search</h3>
                    <span className="text-sm text-gray-500">(Optional)</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="mb-2 text-sm font-medium text-gray-700">Search by Name or ID</div>
                      <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200"
                          placeholder="Search by name or ID..."
                        />
                        <div className="absolute right-3 top-3 flex items-center space-x-1">
                          {searchQuery && (
                            <button
                              onClick={clearSearch}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                              <X className="h-4 w-4 text-gray-400" />
                            </button>
                          )}
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto mt-1">
                            {suggestions.map((resident) => (
                              <div
                                key={resident.id}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleSelectResident(resident)}
                              >
                                <div className="font-medium text-gray-900">
                                  {resident.firstName} {resident.middleName && resident.middleName + ' '}{resident.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {resident.uniqueId || resident.id}
                                </div>
                                {resident.address && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {resident.address}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applicant Information Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="bg-emerald-100 rounded-full p-2">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Applicant Information</h3>
                  </div>
                
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={editFormData.fullName || ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white"
                          placeholder="Enter applicant's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          value={editFormData.contactNumber || ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white"
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editFormData.email || ''}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white"
                          placeholder="Enter email address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Priority
                        </label>
                        <select
                          value={editFormData.priority || 'medium'}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Address
                      </label>
                      <input
                        type="text"
                        value={editFormData.address || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white"
                        placeholder="Enter complete address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Document Type *
                      </label>
                      <select
                        value={editFormData.documentType || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, documentType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white"
                      >
                        <option value="">Select a document type</option>
                        <option value="Barangay Clearance">Barangay Clearance</option>
                        <option value="Barangay Certificate">Barangay Certificate</option>
                        <option value="Barangay Indigency">Barangay Indigency</option>
                        <option value="Business Permit">Business Permit</option>
                        <option value="Barangay ID">Barangay ID</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Purpose *
                      </label>
                      <textarea
                        value={editFormData.purpose || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, purpose: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white resize-none"
                        rows="4"
                        placeholder="Please specify the purpose for this document..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditFormData({});
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRequest}
                  disabled={isUpdating || !editFormData.fullName || !editFormData.documentType || !editFormData.purpose}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Request
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServicesPage;