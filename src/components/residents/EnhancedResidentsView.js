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
  Upload
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
  const [page, setPage] = useState(initialPage || 1);
  const [pageSize, setPageSize] = useState(initialPageSize || 10);
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
      // Perform search logic here
      console.log('Searching for:', query);
    }, 300);
  }, []);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Optimized fetch function with client-side caching
  const fetchResidents = useCallback(async (pageNum, pageSizeNum) => {
    setLoading(true);
    try {
      const data = await cachedFetch(
        `/api/residents?page=${pageNum}&pageSize=${pageSizeNum}`,
        {},
        60000 // Cache for 1 minute
      );
      
      setResidents(data.data);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Error fetching residents:', err);
      toast.error('Failed to load residents');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch residents when page or pageSize changes
  useEffect(() => {
    // Only fetch if not initial load
    if (!(page === initialPage && pageSize === initialPageSize)) {
      fetchResidents(page, pageSize);
    }
  }, [page, pageSize, fetchResidents, initialPage, initialPageSize]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: info => calculateAge(info.row.original.birthdate),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'voterStatus',
      header: 'Voter Status',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'maritalStatus',
      header: 'Marital Status',
      cell: info => info.getValue(),
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      } else {
        throw new Error('Failed to add resident');
      }
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Failed to add resident');
      throw error;
    }
  }, [residents]);

  const handleBatchUploadSuccess = useCallback(async () => {
    // Refresh the residents list after successful batch upload
    try {
      setLoading(true);
      const data = await cachedFetch(`/api/residents?page=${page}&pageSize=${pageSize}`, {}, 0); // No cache for fresh data
      setResidents(data.data);
      setTotalCount(data.total);
      invalidateCache('/api/residents'); // Clear cache
    } catch (error) {
      console.error('Error refreshing residents:', error);
      toast.error('Failed to refresh residents list');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );

  // Rest of your component JSX remains the same, but wrapped with Suspense for lazy components
  return (
    <div className="space-y-6">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Residents Management</h2>
          {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Resident
          </button>
          
          <button
            onClick={() => setShowBatchUploadModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="h-5 w-5" />
            Batch Upload
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search residents..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600 border-blue-300' : 'hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Table View"
          >
            <Table className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Grid View"
          >
            <Grid className="h-5 w-5" />
          </button>
          
          {/* Export Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors" title="Export Options">
              <Download className="h-5 w-5" />
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
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Residents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
              <select
                value={filters.ageRange}
                onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Ages</option>
                <option value="0-17">Minors (0-17)</option>
                <option value="18-59">Adults (18-59)</option>
                <option value="60+">Seniors (60+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voter Status</label>
              <select
                value={filters.voterStatus}
                onChange={(e) => setFilters({...filters, voterStatus: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Voters</option>
                <option value="Registered">Registered</option>
                <option value="Not Registered">Not Registered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
              <select
                value={filters.maritalStatus}
                onChange={(e) => setFilters({...filters, maritalStatus: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Programs</label>
              <div className="space-y-2">
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
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setFilters({
                ageRange: '',
                voterStatus: '',
                programs: [],
                gender: '',
                maritalStatus: ''
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

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
              rowsPerPageOptions={[10, 25, 50, 100]}
              totalEntries={totalCount}
              startEntry={Math.min((page - 1) * pageSize + 1, totalCount)}
              endEntry={Math.min(page * pageSize, totalCount)}
              onPageChange={setPage}
              onRowsPerPageChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(1); // Reset to first page when changing page size
              }}
            />
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {residents.slice((page - 1) * pageSize, page * pageSize).map((resident) => (
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
              rowsPerPageOptions={[12, 24, 48, 96]}
              totalEntries={totalCount}
              startEntry={Math.min((page - 1) * pageSize + 1, totalCount)}
              endEntry={Math.min(page * pageSize, totalCount)}
              onPageChange={setPage}
              onRowsPerPageChange={(newPageSize) => {
                setPageSize(newPageSize);
                setPage(1); // Reset to first page when changing page size
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
  );
}