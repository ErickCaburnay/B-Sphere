"use client";

import { useState, useMemo, useRef, useContext, useEffect, useCallback, lazy, Suspense } from 'react';
import { 
  Users, Search, Filter, Download, 
  Plus, ChevronDown, ChevronUp, 
  Eye, Edit, Trash2, FileText,
  BarChart2, PieChart, LineChart,
  Calendar, Bell, Settings, Grid,
  Table, Moon, Sun, CheckSquare,
  X, FileSpreadsheet, FileText as FileTextIcon,
  Upload, RefreshCw, Grid3x3, List
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { ThemeContext } from '../ui/ThemeContext';
import { cachedFetch, invalidateCache } from '../ui/ClientCache';
import Pagination from '../ui/Pagination';

// Lazy load heavy components
const AddResidentModal = lazy(() => import('./AddResidentModal').then(module => ({ default: module.AddResidentModal })));
const ViewResidentModal = lazy(() => import('./ViewResidentModal').then(module => ({ default: module.ViewResidentModal })));
const EditResidentModal = lazy(() => import('./EditResidentModal').then(module => ({ default: module.EditResidentModal })));
const DeleteResidentModal = lazy(() => import('./DeleteResidentModal').then(module => ({ default: module.DeleteResidentModal })));
const BatchUploadModal = lazy(() => import('./BatchUploadModal').then(module => ({ default: module.BatchUploadModal })));

export function EnhancedResidentsView({ initialResidents, total, initialPage, initialPageSize }) {
  const router = useRouter();
  // State management
  const [residents, setResidents] = useState(initialResidents);
  const [totalCount, setTotalCount] = useState(total);
  const [pagination, setPagination] = useState({
    page: initialPage || 1,
    pageSize: initialPageSize || 10
  });
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  // Destructure for easier access
  const { page, pageSize } = pagination;
  
  // Debug state changes (remove in production)
  // useEffect(() => {
  //   console.log('Pagination state changed to:', pagination);
  // }, [pagination]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBatchUploadModal, setShowBatchUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: '',
    voterStatus: '',
    programs: [],
    gender: '',
    maritalStatus: ''
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      // Reset to first page when searching
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
  }, []);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Build query parameters for API call
  const buildQueryParams = useCallback((pageNum, pageSizeNum, searchQuery, filters) => {
    const params = new URLSearchParams();
    params.set('page', pageNum.toString());
    params.set('pageSize', pageSizeNum.toString());
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    if (filters.ageRange) {
      params.set('ageRange', filters.ageRange);
    }
    
    if (filters.gender) {
      params.set('gender', filters.gender);
    }
    
    if (filters.voterStatus) {
      params.set('voterStatus', filters.voterStatus);
    }
    
    if (filters.maritalStatus) {
      params.set('maritalStatus', filters.maritalStatus);
    }
    
    if (filters.programs.length > 0) {
      params.set('programs', filters.programs.join(','));
    }
    
    return params.toString();
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      ageRange: '',
      voterStatus: '',
      programs: [],
      gender: '',
      maritalStatus: ''
    });
    setSearchQuery('');
  }, []);

  // Optimized fetch function with client-side caching
  const fetchResidents = useCallback(async (pageNum, pageSizeNum) => {
    setLoading(true);
    try {
      console.log(`Fetching residents: page=${pageNum}, pageSize=${pageSizeNum}`);
      
      // Use direct fetch for pagination to avoid cache issues
      const response = await fetch(`/api/residents?page=${pageNum}&pageSize=${pageSizeNum}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch residents');
      }
      
      const data = await response.json();
      
      console.log('Fetched residents data:', { 
        count: data.data?.length, 
        total: data.total, 
        page: pageNum, 
        pageSize: pageSizeNum 
      });
      
      setResidents(data.data);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Error fetching residents:', err);
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch residents when pagination changes
  useEffect(() => {
    if (isFirstRender) {
      // Skip the first render since we already have initial data
      console.log('Skipping first render - using initial data');
      setIsFirstRender(false);
      return;
    }
    
    console.log('useEffect triggered - Fetching residents:', pagination);
    
    // Define fetch function inside useEffect to avoid stale closures
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = buildQueryParams(pagination.page, pagination.pageSize, searchQuery, filters);
        const url = `/api/residents?${queryParams}`;
        
        // console.log(`Fetching residents with filters:`, { 
        //   page: pagination.page, 
        //   pageSize: pagination.pageSize, 
        //   searchQuery, 
        //   filters,
        //   url 
        // });
        
        // Clear cache for the new query
        invalidateCache(url);
        
        // Use direct fetch for pagination to avoid cache issues
        const response = await fetch(url, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch residents');
        }
        
        const data = await response.json();
        
        // console.log('Fetched residents data:', { 
        //   count: data.data?.length, 
        //   total: data.total, 
        //   page: pagination.page, 
        //   pageSize: pagination.pageSize,
        //   filtered: searchQuery || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))
        // });
        
        setResidents(data.data);
        setTotalCount(data.total);
      } catch (err) {
        console.error('Error fetching residents:', err);
        toast.error('Failed to load residents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [pagination, searchQuery, filters, buildQueryParams]); // Depend on pagination, search, and filters

  // Reset to page 1 when filters change (but not on first render)
  useEffect(() => {
    if (!isFirstRender && pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [filters]); // Only depend on filters, not searchQuery (handled by debounced search)

  // Update URL when pagination changes
  useEffect(() => {
    const currentUrl = new URL(window.location);
    const searchParams = currentUrl.searchParams;
    
    if (pagination.page !== 1) {
      searchParams.set('page', pagination.page.toString());
    } else {
      searchParams.delete('page');
    }
    
    if (pagination.pageSize !== 10) {
      searchParams.set('pageSize', pagination.pageSize.toString());
    } else {
      searchParams.delete('pageSize');
    }
    
    const newUrl = `${currentUrl.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    if (newUrl !== window.location.pathname + window.location.search) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [pagination]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Listen for resident data updates from approval notifications
  useEffect(() => {
    const handleResidentDataUpdate = async (event) => {
      const { residentId, updatedData } = event.detail;
      console.log('EnhancedResidentsView: Received resident data update event:', { residentId, updatedData });
      
      try {
        // Refresh the residents list to get the latest data
        const queryParams = buildQueryParams(pagination.page, pagination.pageSize, searchQuery, filters);
        const response = await fetch(`/api/residents?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          setResidents(data.data || data);
          setTotalCount(data.total || 0);
          
          // If a modal is open showing the updated resident, refresh it too
          if (selectedResident && (selectedResident.id === residentId || selectedResident.uniqueId === residentId)) {
            const residentResponse = await fetch(`/api/residents/${residentId}`);
            if (residentResponse.ok) {
              const updatedResident = await residentResponse.json();
              setSelectedResident(updatedResident);
            }
          }
          
          console.log('EnhancedResidentsView: Residents list refreshed after approval');
        }
      } catch (error) {
        console.error('EnhancedResidentsView: Error refreshing residents after approval:', error);
      }
    };

    window.addEventListener('residentDataUpdated', handleResidentDataUpdate);

    return () => {
      window.removeEventListener('residentDataUpdated', handleResidentDataUpdate);
    };
  }, [pagination, selectedResident]);

  // Simple and direct sidebar detection based on text visibility
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(false);

  useEffect(() => {
    const checkSidebarState = () => {
      if (window.innerWidth >= 768) {
        // Look for specific text that appears in the expanded sidebar
        const dashboardText = Array.from(document.querySelectorAll('aside span'))
          .find(el => el.textContent.includes('Dashboard'));
        const officialsText = Array.from(document.querySelectorAll('aside span'))
          .find(el => el.textContent.includes('Officials'));
        const brgyText = document.querySelector('aside h3') ||
                        document.querySelector('aside .text-sm');
        
        // Check if the "Barangay San Francisco" text is visible
        const brgyNameElement = Array.from(document.querySelectorAll('aside *')).find(el => 
          el.textContent && el.textContent.includes('Barangay San Francisco')
        );
        
        // If we can find navigation text or barangay name, sidebar is expanded
        const isExpanded = !!(dashboardText || officialsText || brgyText || brgyNameElement);
        
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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const queryParams = buildQueryParams(pagination.page, pagination.pageSize, searchQuery, filters);
      const url = `/api/residents?${queryParams}`;
      
      // Clear cache before fetching fresh data
      invalidateCache(url);
      
      const response = await fetch(url, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setResidents(data.data);
        setTotalCount(data.total);
        toast.success('Residents list refreshed');
      } else {
        throw new Error('Failed to refresh residents');
      }
    } catch (error) {
      console.error('Error refreshing residents:', error);
      toast.error('Failed to refresh residents');
    } finally {
      setLoading(false);
    }
  };

  // Memoized age calculation function
  const calculateAge = useCallback((birthdate) => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, []);

  // Memoized table configuration
  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: info => (info.getValue() || '').toString().toUpperCase(),
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: info => (info.getValue() || '').toUpperCase(),
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: info => (info.getValue() || '').toUpperCase(),
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: info => calculateAge(info.row.original.birthdate),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: info => (info.getValue() || '').toString().toUpperCase(),
    },
    {
      accessorKey: 'voterStatus',
      header: 'Voter Status',
      cell: info => (info.getValue() || '').toString().toUpperCase(),
    },
    {
      accessorKey: 'maritalStatus',
      header: 'Marital Status',
      cell: info => (info.getValue() || '').toString().toUpperCase(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewResident(row.original)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleEditResident(row.original)}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteResident(row.original)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ], [calculateAge]);

  // Memoized table instance
  const table = useReactTable({
    data: residents,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // Remove client-side pagination since we're using server-side pagination
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true, // Tell the table we're handling pagination ourselves
    pageCount: Math.ceil(totalCount / pageSize), // Provide the total page count
  });

  // Optimized export functions
  const exportToExcel = useCallback(() => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(residents);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `residents-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  }, [residents]);

  const exportToPDF = useCallback(() => {
    toast.info('PDF export functionality coming soon');
  }, []);

  // Event handlers with useCallback
  const handleViewResident = useCallback((resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  }, []);

  const handleEditResident = useCallback((resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  }, []);

  const handleDeleteResident = useCallback((resident) => {
    setSelectedResident(resident);
    setShowDeleteModal(true);
  }, []);

  const handleUpdateResident = useCallback(async (id, data) => {
    try {
      const response = await fetch(`/api/residents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update resident');
      }

      const updatedResident = await response.json();
      setResidents(residents.map(r => r.id === id ? updatedResident : r));
      setShowEditModal(false);
      setSelectedResident(null);
      toast.success('Resident updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update resident');
    }
  }, [residents]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedResident) return;
    
    try {
      const response = await fetch(`/api/residents/${selectedResident.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resident');
      }

      setResidents(residents.filter(r => r.id !== selectedResident.id));
      setShowDeleteModal(false);
      setSelectedResident(null);
      toast.success('Resident deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resident');
    }
  }, [selectedResident, residents]);

  const handleAddResident = useCallback(async (data) => {
    try {
      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newResident = await response.json();
        setResidents([newResident, ...residents]);
        toast.success('Resident added successfully');
        // Refresh the data to get updated counts
        await handleRefresh();
      } else {
        const errorData = await response.json();
        
        if (response.status === 409 && errorData.details) {
          // Handle duplicate resident error
          const duplicateResident = errorData.details;
          toast.error(
            `Resident already exists: ${duplicateResident.firstName} ${duplicateResident.middleName ? duplicateResident.middleName + ' ' : ''}${duplicateResident.lastName} (Born: ${duplicateResident.birthdate})`,
            { duration: 6000 }
          );
          // Don't throw error for duplicates - just show the message and keep modal open
          return;
        } else {
          toast.error(errorData.error || 'Failed to add resident');
          throw new Error(errorData.error || 'Failed to add resident');
        }
      }
    } catch (error) {
      console.error('Add error:', error);
      // Only show generic error for network/other issues, not duplicates
      if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
        toast.error('Failed to add resident');
      }
      throw error;
    }
  }, [residents, handleRefresh]);

  const handleBatchUploadSuccess = useCallback(async () => {
    // Refresh the residents list after successful batch upload
    try {
      setLoading(true);
      const queryParams = buildQueryParams(pagination.page, pagination.pageSize, searchQuery, filters);
      const data = await cachedFetch(`/api/residents?${queryParams}`, {}, 0); // No cache for fresh data
      setResidents(data.data);
      setTotalCount(data.total);
      invalidateCache('/api/residents'); // Clear cache
    } catch (error) {
      console.error('Error refreshing residents:', error);
      toast.error('Failed to refresh residents list');
    } finally {
      setLoading(false);
    }
  }, [pagination, searchQuery, filters, buildQueryParams]);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );

  // Rest of your component JSX remains the same, but wrapped with Suspense for lazy components
  return (
    <>
      {/* Blurred Background Overlay for Modals */}
      {(showAddModal || showViewModal || showEditModal || showDeleteModal || showBatchUploadModal) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      )}

      <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Search Bar and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search residents..."
                className="pl-9 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`${isDesktopSidebarExpanded ? 'p-2' : 'px-3 py-2'} rounded-lg border transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'} text-sm flex-shrink-0 ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
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
              
              {/* Active filters indicator */}
              {(searchQuery || Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true))) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-center lg:space-y-0 lg:gap-4">
            {/* View Controls */}
            <div className="flex items-center justify-center space-x-2 flex-shrink-0">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" 
                      ? "bg-white text-blue-600 shadow-sm" 
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
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Export Button */}
              <Menu as="div" className="relative">
                <Menu.Button 
                  className={`${isDesktopSidebarExpanded ? 'p-2' : 'px-3 py-2'} text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'} text-sm`}
                  title="Export"
                >
                  <Download className="h-4 w-4" />
                  {!isDesktopSidebarExpanded && (
                    <span className="hidden sm:inline">Export</span>
                  )}
                </Menu.Button>
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 bg-white border border-gray-200">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={exportToExcel}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm w-full text-left`}
                        >
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Export to Excel
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={exportToPDF}
                          className={`${active ? 'bg-gray-100' : ''} flex items-center px-4 py-2 text-sm w-full text-left`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Export to PDF
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center space-x-2 flex-shrink-0">
              {/* Add Resident Button */}
              <button 
                className={`${isDesktopSidebarExpanded ? 'p-2' : 'px-3 py-2'} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'} text-sm font-medium flex-shrink-0`}
                onClick={() => setShowAddModal(true)}
                title="Add Resident"
              >
                <Plus className="h-4 w-4" />
                {!isDesktopSidebarExpanded && (
                  <span className="whitespace-nowrap">Add Resident</span>
                )}
              </button>

              {/* Batch Upload Button */}
              <button 
                className={`${isDesktopSidebarExpanded ? 'p-2' : 'px-3 py-2'} bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center ${isDesktopSidebarExpanded ? '' : 'space-x-1.5'} text-sm font-medium flex-shrink-0`}
                onClick={() => setShowBatchUploadModal(true)}
                title="Batch Upload"
              >
                <Upload className="h-4 w-4" />
                {!isDesktopSidebarExpanded && (
                  <span className="whitespace-nowrap hidden sm:inline">Batch Upload</span>
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
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Age Range</label>
                <select
                  value={filters.ageRange}
                  onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Ages</option>
                  <option value="0-17">Minors (0-17)</option>
                  <option value="18-59">Adults (18-59)</option>
                  <option value="60+">Seniors (60+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Voter Status</label>
                <select
                  value={filters.voterStatus}
                  onChange={(e) => setFilters({...filters, voterStatus: e.target.value})}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Voters</option>
                  <option value="Registered">Registered</option>
                  <option value="Not Registered">Not Registered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  value={filters.maritalStatus}
                  onChange={(e) => setFilters({...filters, maritalStatus: e.target.value})}
                  className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Special Programs</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.programs.includes('PWD')}
                      onChange={(e) => {
                        const newPrograms = e.target.checked 
                          ? [...filters.programs, 'PWD']
                          : filters.programs.filter(p => p !== 'PWD');
                        setFilters({...filters, programs: newPrograms});
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">PWD</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.programs.includes('4Ps')}
                      onChange={(e) => {
                        const newPrograms = e.target.checked 
                          ? [...filters.programs, '4Ps']
                          : filters.programs.filter(p => p !== '4Ps');
                        setFilters({...filters, programs: newPrograms});
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">4Ps</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.programs.includes('TUPAD')}
                      onChange={(e) => {
                        const newPrograms = e.target.checked 
                          ? [...filters.programs, 'TUPAD']
                          : filters.programs.filter(p => p !== 'TUPAD');
                        setFilters({...filters, programs: newPrograms});
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">TUPAD</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.programs.includes('Solo Parent')}
                      onChange={(e) => {
                        const newPrograms = e.target.checked 
                          ? [...filters.programs, 'Solo Parent']
                          : filters.programs.filter(p => p !== 'Solo Parent');
                        setFilters({...filters, programs: newPrograms});
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Solo Parent</span>
                  </label>
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Table or Grid View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[10, 30, 50]}
              totalEntries={totalCount}
              startEntry={Math.min((page - 1) * pageSize + 1, totalCount)}
              endEntry={Math.min(page * pageSize, totalCount)}
              onPageChange={(newPage) => {
                if (newPage !== page) {
                  setPagination(prev => ({ ...prev, page: newPage }));
                }
              }}
              onRowsPerPageChange={(newPageSize) => {
                if (newPageSize !== pageSize) {
                  setPagination({ page: 1, pageSize: newPageSize }); // Reset to first page when changing page size
                }
              }}
            />
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {residents.map((resident) => (
              <div key={resident.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {`${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-500">{resident.uniqueId || resident.id}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age:</span>
                    <span className="text-gray-900">{calculateAge(resident.birthdate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender:</span>
                    <span className="text-gray-900">{resident.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-gray-900">{resident.maritalStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Voter:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      resident.voterStatus === 'Registered' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {resident.voterStatus || 'Not Registered'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-1">
                    {resident.isPWD && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">PWD</span>
                    )}
                    {resident.is4Ps && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">4Ps</span>
                    )}
                    {resident.isTUPAD && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">TUPAD</span>
                    )}
                    {resident.isSoloParent && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Solo Parent</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewResident(resident)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditResident(resident)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteResident(resident)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination for Grid View */}
          <div className="bg-white rounded-lg shadow border border-gray-200 px-6 py-4">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalCount / pageSize)}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[10, 30, 50]}
              totalEntries={totalCount}
              startEntry={Math.min((page - 1) * pageSize + 1, totalCount)}
              endEntry={Math.min(page * pageSize, totalCount)}
              onPageChange={(newPage) => {
                if (newPage !== page) {
                  setPagination(prev => ({ ...prev, page: newPage }));
                }
              }}
              onRowsPerPageChange={(newPageSize) => {
                if (newPageSize !== pageSize) {
                  setPagination({ page: 1, pageSize: newPageSize }); // Reset to first page when changing page size
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Modals with Suspense */}
      <Suspense fallback={<LoadingSpinner />}>
        {showAddModal && (
          <AddResidentModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddResident}
          />
        )}

        {showViewModal && selectedResident && (
          <ViewResidentModal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            resident={selectedResident}
          />
        )}

        {showEditModal && selectedResident && (
          <EditResidentModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            resident={selectedResident}
            onSubmit={(data) => handleUpdateResident(selectedResident.id, data)}
          />
        )}

        {showDeleteModal && selectedResident && (
          <DeleteResidentModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            resident={selectedResident}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {showBatchUploadModal && (
          <BatchUploadModal
            isOpen={showBatchUploadModal}
            onClose={() => setShowBatchUploadModal(false)}
            onSuccess={handleBatchUploadSuccess}
          />
        )}
      </Suspense>
    </div>
    </>
  );
}