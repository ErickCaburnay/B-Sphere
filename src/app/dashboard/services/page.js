"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Search, X, ChevronDown, Download, Filter, Plus, 
  Eye, Edit, Trash2, Calendar, Clock, CheckCircle, 
  AlertCircle, XCircle, FileText, Users, TrendingUp,
  Grid3x3, List, MoreVertical, RefreshCw, Settings,
  ArrowUpDown, ArrowUp, ArrowDown, Bell, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentViewModal } from "@/components/DocumentViewModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ensureTokenCookie } from "@/lib/auth-utils";

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
  const [editingDocument, setEditingDocument] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false);

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
    if (globalIsInitialized && globalServicesData.length > 0) {
      console.log('Services page - Using existing global data');
      setServicesData(globalServicesData);
      setLoading(false);
      return;
    }

    // If initialization is already in progress, wait for it
    if (initializationPromiseRef.current) {
      console.log('Services page - Waiting for existing initialization');
      initializationPromiseRef.current.then(() => {
        if (!isUnmountingRef.current) {
          setServicesData(globalServicesData);
          setLoading(globalIsLoading);
        }
      });
      return;
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
            const baseDocument = {
              id: doc.id,
              transactionNo: doc.id,
              dateFiled: doc.createdAt ? new Date(doc.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              nameOfApplicant: doc.fullName || '',
              purpose: doc.purpose || '',
              type: doc.documentType || '',
              status: doc.status || 'PENDING',
              dateIssued: doc.issuedAt ? new Date(doc.issuedAt.seconds * 1000).toISOString().split('T')[0] : null,
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
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
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
              {filteredAndSortedServices.map((service) => (
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
                      service.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      service.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      service.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      service.status === 'READY' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
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
              ))}
            </tbody>
          </table>
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
    </div>
  );
}

export default ServicesPage;