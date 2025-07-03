"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Search, X, ChevronDown, Download, Filter, Plus, 
  Eye, Edit, Trash2, Calendar, Clock, CheckCircle, 
  AlertCircle, XCircle, FileText, Users, TrendingUp,
  Grid3x3, List, MoreVertical, RefreshCw, Settings,
  ArrowUpDown, ArrowUp, ArrowDown, Bell, Star
} from "lucide-react";
import DocumentApplicationModal from "@/components/DocumentApplicationModal";
import BrgyClearanceFormModal from "@/components/BrgyClearanceFormModal";
import BrgyCertificateFormModal from "@/components/BrgyCertificateFormModal";
import BrgyIndigencyFormModal from "@/components/BrgyIndigencyFormModal";
import BrgyIdFormModal from "@/components/BrgyIdFormModal";
import BrgyBusinessPermitFormModal from "@/components/BrgyBusinessPermitFormModal";
import Pagination from '@/components/ui/Pagination';
import DashboardPageContainer from '@/components/DashboardPageContainer';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("cards"); // 'cards', 'table', 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortBy, setSortBy] = useState("dateFiled");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Simple and direct sidebar detection based on text visibility
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false);

  useEffect(() => {
    const checkSidebarState = () => {
      if (window.innerWidth >= 768) {
        // Look for specific text that appears in the expanded sidebar
        const dashboardText = document.querySelector('aside span:contains("Dashboard")') || 
                             Array.from(document.querySelectorAll('aside span')).find(el => el.textContent.includes('Dashboard'));
        const officialsText = document.querySelector('aside span:contains("Officials")') ||
                             Array.from(document.querySelectorAll('aside span')).find(el => el.textContent.includes('Officials'));
        const brgyText = document.querySelector('aside h3') ||
                        document.querySelector('aside .text-sm');
        
        // Check if the "Barangay San Francisco" text is visible
        const brgyNameElement = Array.from(document.querySelectorAll('aside *')).find(el => 
          el.textContent && el.textContent.includes('Barangay San Francisco')
        );
        
        // If we can find navigation text or barangay name, sidebar is expanded
        const isExpanded = !!(dashboardText || officialsText || brgyText || brgyNameElement);
        
        // Detection successful
        
        setIsDesktopSidebarExpanded(isExpanded);
      } else {
        setIsDesktopSidebarExpanded(false);
      }
    };

    // Check initially
    setTimeout(checkSidebarState, 500);

    // Listen for clicks that might toggle sidebar
    const handleClick = () => {
      setTimeout(checkSidebarState, 300);
    };
    
    document.addEventListener('click', handleClick);
    window.addEventListener('resize', checkSidebarState);
    
    // Check periodically
    const interval = setInterval(checkSidebarState, 1000);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('resize', checkSidebarState);
      clearInterval(interval);
    };
  }, []);

  // Modal states
  const [isDocumentApplicationModalOpen, setIsDocumentApplicationModalOpen] = useState(false);
  const [isBrgyClearanceFormModalOpen, setIsBrgyClearanceFormModalOpen] = useState(false);
  const [isBrgyCertificateFormModalOpen, setIsBrgyCertificateFormModalOpen] = useState(false);
  const [isBrgyIndigencyFormModalOpen, setIsBrgyIndigencyFormModalOpen] = useState(false);
  const [isBrgyIdFormModalOpen, setIsBrgyIdFormModalOpen] = useState(false);
  const [isBrgyBusinessPermitFormModalOpen, setIsBrgyBusinessPermitFormModalOpen] = useState(false);

  // Enhanced dummy data with more realistic information
  const servicesData = [
    {
      id: 1,
      transactionNo: "INDG-000012",
      dateFiled: "2024-12-16",
      nameOfApplicant: "Maria Santos",
      purpose: "MEDICAL ASSISTANCE",
      type: "Indigency",
      status: "Printed",
      dateIssued: "2024-12-16",
      priority: "high",
      estimatedCompletion: "2024-12-17",
      applicantContact: "+63 912 345 6789",
      processingTime: "1 day",
      fee: "₱0.00"
    },
    {
      id: 2,
      transactionNo: "CERT-000001",
      dateFiled: "2024-12-15",
      nameOfApplicant: "Jane Doe",
      purpose: "EMPLOYMENT REQUIREMENT",
      type: "Certificate",
      status: "Processing",
      dateIssued: null,
      priority: "medium",
      estimatedCompletion: "2024-12-18",
      applicantContact: "+63 923 456 7890",
      processingTime: "3 days",
      fee: "₱50.00"
    },
    {
      id: 3,
      transactionNo: "CLR-000002",
      dateFiled: "2024-12-14",
      nameOfApplicant: "John Smith",
      purpose: "BUSINESS PERMIT",
      type: "Clearance",
      status: "Pending",
      dateIssued: null,
      priority: "low",
      estimatedCompletion: "2024-12-20",
      applicantContact: "+63 934 567 8901",
      processingTime: "5 days",
      fee: "₱100.00"
    },
    {
      id: 4,
      transactionNo: "ID-000003",
      dateFiled: "2024-12-13",
      nameOfApplicant: "Alice Johnson",
      purpose: "IDENTIFICATION",
      type: "Barangay ID",
      status: "Ready for Pickup",
      dateIssued: "2024-12-16",
      priority: "medium",
      estimatedCompletion: "2024-12-16",
      applicantContact: "+63 945 678 9012",
      processingTime: "3 days",
      fee: "₱30.00"
    },
    {
      id: 5,
      transactionNo: "BP-000004",
      dateFiled: "2024-12-12",
      nameOfApplicant: "Bob Williams",
      purpose: "BUSINESS OPERATION",
      type: "Business Permit",
      status: "Approved",
      dateIssued: "2024-12-15",
      priority: "high",
      estimatedCompletion: "2024-12-15",
      applicantContact: "+63 956 789 0123",
      processingTime: "3 days",
      fee: "₱200.00"
    },
    {
      id: 6,
      transactionNo: "DOC-000005",
      dateFiled: "2024-12-11",
      nameOfApplicant: "Eve Brown",
      purpose: "SCHOOL ENROLLMENT",
      type: "Document Request",
      status: "Rejected",
      dateIssued: null,
      priority: "medium",
      estimatedCompletion: null,
      applicantContact: "+63 967 890 1234",
      processingTime: "2 days",
      fee: "₱25.00"
    }
  ];

  // Status configuration
  const statusConfig = {
    "Pending": { color: "bg-yellow-100 text-yellow-800", icon: Clock, dot: "bg-yellow-400" },
    "Processing": { color: "bg-blue-100 text-blue-800", icon: RefreshCw, dot: "bg-blue-400" },
    "Approved": { color: "bg-green-100 text-green-800", icon: CheckCircle, dot: "bg-green-400" },
    "Printed": { color: "bg-purple-100 text-purple-800", icon: FileText, dot: "bg-purple-400" },
    "Ready for Pickup": { color: "bg-indigo-100 text-indigo-800", icon: Bell, dot: "bg-indigo-400" },
    "Rejected": { color: "bg-red-100 text-red-800", icon: XCircle, dot: "bg-red-400" }
  };

  // Priority configuration
  const priorityConfig = {
    "high": { color: "text-red-600", label: "High Priority" },
    "medium": { color: "text-yellow-600", label: "Medium Priority" },
    "low": { color: "text-green-600", label: "Low Priority" }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = servicesData.filter((service) => {
      const matchesSearch = Object.values(service).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === "all" || service.status === statusFilter;
      const matchesType = typeFilter === "all" || service.type === typeFilter;
      
      let matchesDate = true;
      if (dateRange !== "all") {
        const serviceDate = new Date(service.dateFiled);
        const now = new Date();
        const daysDiff = Math.floor((now - serviceDate) / (1000 * 60 * 60 * 24));
        
        switch (dateRange) {
          case "today":
            matchesDate = daysDiff === 0;
            break;
          case "week":
            matchesDate = daysDiff <= 7;
            break;
          case "month":
            matchesDate = daysDiff <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "dateFiled" || sortBy === "dateIssued") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [servicesData, searchTerm, statusFilter, typeFilter, dateRange, sortBy, sortOrder]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = servicesData.length;
    const pending = servicesData.filter(s => s.status === "Pending").length;
    const processing = servicesData.filter(s => s.status === "Processing").length;
    const completed = servicesData.filter(s => ["Approved", "Printed", "Ready for Pickup"].includes(s.status)).length;
    const rejected = servicesData.filter(s => s.status === "Rejected").length;
    
    return { total, pending, processing, completed, rejected };
  }, [servicesData]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handlers
  const handleOpenDocumentApplicationModal = () => {
    setIsDocumentApplicationModalOpen(true);
  };

  const handleCloseDocumentApplicationModal = () => {
    setIsDocumentApplicationModalOpen(false);
  };

  const handleSelectDocumentType = (docType) => {
    setIsDocumentApplicationModalOpen(false);

    switch (docType) {
      case "Barangay Certificate":
        setIsBrgyCertificateFormModalOpen(true);
        break;
      case "Barangay Clearance":
        setIsBrgyClearanceFormModalOpen(true);
        break;
      case "Barangay Indigency":
        setIsBrgyIndigencyFormModalOpen(true);
        break;
      case "Barangay ID":
        setIsBrgyIdFormModalOpen(true);
        break;
      case "Barangay Business Permit":
        setIsBrgyBusinessPermitFormModalOpen(true);
        break;
      default:
        alert(`Applying for: ${docType}`);
        setIsDocumentApplicationModalOpen(false);
        break;
    }
  };

  const handleCloseAllModalsAndReopenDocumentApplication = () => {
    setIsBrgyClearanceFormModalOpen(false);
    setIsBrgyCertificateFormModalOpen(false);
    setIsBrgyIndigencyFormModalOpen(false);
    setIsBrgyIdFormModalOpen(false);
    setIsBrgyBusinessPermitFormModalOpen(false);
    setIsDocumentApplicationModalOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleSelectAll = () => {
    if (selectedServices.length === paginatedData.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(paginatedData.map(service => service.id));
    }
  };

  const handleSelectService = (id) => {
    setSelectedServices(prev => 
      prev.includes(id) 
        ? prev.filter(serviceId => serviceId !== id)
        : [...prev, id]
    );
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs sm:text-sm">Total</p>
            <p className="text-lg sm:text-2xl font-bold">{statistics.total}</p>
          </div>
          <FileText className="h-5 w-5 sm:h-8 sm:w-8 text-blue-200" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100 text-xs sm:text-sm">Pending</p>
            <p className="text-lg sm:text-2xl font-bold">{statistics.pending}</p>
          </div>
          <Clock className="h-5 w-5 sm:h-8 sm:w-8 text-yellow-200" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-xs sm:text-sm">Processing</p>
            <p className="text-lg sm:text-2xl font-bold">{statistics.processing}</p>
          </div>
          <RefreshCw className="h-5 w-5 sm:h-8 sm:w-8 text-blue-200" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white col-span-1 sm:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-xs sm:text-sm">Completed</p>
            <p className="text-lg sm:text-2xl font-bold">{statistics.completed}</p>
          </div>
          <CheckCircle className="h-5 w-5 sm:h-8 sm:w-8 text-green-200" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl p-2 sm:p-4 text-white col-span-1 sm:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-xs sm:text-sm">Rejected</p>
            <p className="text-lg sm:text-2xl font-bold">{statistics.rejected}</p>
          </div>
          <XCircle className="h-5 w-5 sm:h-8 sm:w-8 text-red-200" />
        </div>
      </div>
    </div>
  );

  // Service Card Component
  const ServiceCard = ({ service }) => {
    const StatusIcon = statusConfig[service.status]?.icon || AlertCircle;
    
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group min-h-[280px] sm:min-h-[320px] flex flex-col">
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={() => handleSelectService(service.id)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight break-words">{service.transactionNo}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              {service.priority === "high" && (
                <Star className="h-4 w-4 text-red-500 fill-current" />
              )}
              <div className="relative group">
                <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
                <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <div>
              <h4 className="font-medium text-gray-900 text-base leading-tight">{service.nameOfApplicant}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.purpose}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[service.status]?.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig[service.status]?.dot}`}></div>
                <span>{service.status}</span>
              </div>
              <span className={`text-xs font-medium ${priorityConfig[service.priority]?.color}`}>
                {priorityConfig[service.priority]?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Filed</p>
                <p className="font-medium text-sm">{new Date(service.dateFiled).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Processing Time</p>
                <p className="font-medium text-sm">{service.processingTime}</p>
              </div>
            </div>

            {service.estimatedCompletion && (
              <div className="bg-gray-50 rounded-lg p-3 mt-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Est. Completion</span>
                  <span className="font-medium text-gray-900">
                    {new Date(service.estimatedCompletion).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">Fee: {service.fee}</span>
            <button 
              className={`${isDesktopSidebarExpanded ? 'p-1.5' : 'px-3 py-1.5'} bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'}`}
              title="Download"
            >
              <Download className="h-4 w-4" />
              {!isDesktopSidebarExpanded && (
                <span>Download</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Blurred Background Overlay for Modals */}
      {(isDocumentApplicationModalOpen || isBrgyClearanceFormModalOpen || 
        isBrgyCertificateFormModalOpen || isBrgyIndigencyFormModalOpen || 
        isBrgyIdFormModalOpen || isBrgyBusinessPermitFormModalOpen) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      )}

      <DashboardPageContainer 
        heading="Services Management"
        subtitle="Process document requests and manage barangay services efficiently"
      >
        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Action Bar */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                className="pl-9 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              {/* Left Controls */}
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${isDesktopSidebarExpanded ? 'p-2' : 'px-3 py-2'} rounded-lg border transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'} text-sm ${
                    showFilters 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Filters"
                >
                  <Filter className="h-4 w-4" />
                  {!isDesktopSidebarExpanded && (
                    <>
                      <span className="hidden sm:inline">Filters</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </>
                  )}
                  {isDesktopSidebarExpanded && (
                    <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''} ml-1`} />
                  )}
                </button>
              </div>

              {/* Center Controls */}
              <div className="flex items-center space-x-2">
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("cards")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "cards" 
                        ? "bg-white text-green-600 shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Card View"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "table" 
                        ? "bg-white text-green-600 shadow-sm" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    title="Table View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Export Button */}
                <button 
                  className={`${isDesktopSidebarExpanded ? 'p-2' : 'px-3 py-2'} text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'} text-sm`}
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                  {!isDesktopSidebarExpanded && (
                    <span className="hidden sm:inline">Export</span>
                  )}
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center justify-end">
                {/* Apply Button */}
                <button 
                  className={`${isDesktopSidebarExpanded ? 'p-2' : 'px-3 py-2'} bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'} text-sm font-medium`}
                  onClick={handleOpenDocumentApplicationModal}
                  title="Apply"
                >
                  <Plus className="h-4 w-4" />
                  {!isDesktopSidebarExpanded && (
                    <span>Apply</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Approved">Approved</option>
                    <option value="Printed">Printed</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Indigency">Indigency</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Clearance">Clearance</option>
                    <option value="Barangay ID">Barangay ID</option>
                    <option value="Business Permit">Business Permit</option>
                    <option value="Document Request">Document Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="dateFiled">Date Filed</option>
                    <option value="nameOfApplicant">Applicant Name</option>
                    <option value="type">Type</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedServices.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-xs sm:text-sm font-medium text-green-800">
                  {selectedServices.length} item{selectedServices.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1.5 sm:px-3 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-xs sm:text-sm">
                  <span className="hidden sm:inline">Export Selected</span>
                  <span className="sm:hidden">Export</span>
                </button>
                <button className="px-2 py-1.5 sm:px-3 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-xs sm:text-sm">
                  <span className="hidden sm:inline">Update Status</span>
                  <span className="sm:hidden">Update</span>
                </button>
                <button 
                  onClick={() => setSelectedServices([])}
                  className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {paginatedData.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedServices.length === paginatedData.length && paginatedData.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('transactionNo')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span className="hidden sm:inline">Transaction No</span>
                        <span className="sm:hidden">Trans. No</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('dateFiled')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span className="hidden sm:inline">Date Filed</span>
                        <span className="sm:hidden">Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('nameOfApplicant')}
                        className="flex items-center space-x-1 hover:text-gray-700"
                      >
                        <span>Applicant</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((service) => {
                    const StatusIcon = statusConfig[service.status]?.icon || AlertCircle;
                    
                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleSelectService(service.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{service.transactionNo}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">{new Date(service.dateFiled).toLocaleDateString()}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{service.nameOfApplicant}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{service.type}</div>
                          <div className="text-xs text-gray-500 truncate sm:block hidden">{service.purpose}</div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{service.type}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[service.status]?.color}`}>
                            <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-1 sm:mr-1.5 ${statusConfig[service.status]?.dot}`}></div>
                            <span className="text-xs">{service.status}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {service.priority === "high" && (
                              <Star className="h-4 w-4 text-red-500 fill-current mr-1" />
                            )}
                            <span className={`text-xs font-medium ${priorityConfig[service.priority]?.color}`}>
                              {priorityConfig[service.priority]?.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50" title="View">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50" title="Edit">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50" title="Download">
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {paginatedData.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-6 sm:p-12 text-center">
            <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first service request"}
            </p>
            <button 
              className="px-3 py-2 sm:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              onClick={handleOpenDocumentApplicationModal}
            >
              Create New Application
            </button>
          </div>
        )}

        {/* Pagination */}
        {paginatedData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[12, 24, 48]}
            totalEntries={filteredAndSortedData.length}
            startEntry={(currentPage - 1) * rowsPerPage + 1}
            endEntry={Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(v) => { setRowsPerPage(v); setCurrentPage(1); }}
            className="mt-6"
          />
        )}

        {/* Modals with Blurred Background */}
        <DocumentApplicationModal
          isOpen={isDocumentApplicationModalOpen}
          onClose={handleCloseDocumentApplicationModal}
          onSelectDocumentType={handleSelectDocumentType}
        />

        <BrgyClearanceFormModal
          isOpen={isBrgyClearanceFormModalOpen}
          onClose={handleCloseAllModalsAndReopenDocumentApplication}
        />

        <BrgyCertificateFormModal
          isOpen={isBrgyCertificateFormModalOpen}
          onClose={handleCloseAllModalsAndReopenDocumentApplication}
        />

        <BrgyIndigencyFormModal
          isOpen={isBrgyIndigencyFormModalOpen}
          onClose={handleCloseAllModalsAndReopenDocumentApplication}
        />

        <BrgyIdFormModal
          isOpen={isBrgyIdFormModalOpen}
          onClose={handleCloseAllModalsAndReopenDocumentApplication}
        />

        <BrgyBusinessPermitFormModal
          isOpen={isBrgyBusinessPermitFormModalOpen}
          onClose={handleCloseAllModalsAndReopenDocumentApplication}
        />
      </DashboardPageContainer>
    </>
  );
}