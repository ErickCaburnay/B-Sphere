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

// Lazy load heavy components
const AddResidentModal = lazy(() => import('./AddResidentModal').then(module => ({ default: module.AddResidentModal })));
const ViewResidentModal = lazy(() => import('./ViewResidentModal').then(module => ({ default: module.ViewResidentModal })));
const EditResidentModal = lazy(() => import('./EditResidentModal').then(module => ({ default: module.EditResidentModal })));
const DeleteResidentModal = lazy(() => import('./DeleteResidentModal').then(module => ({ default: module.DeleteResidentModal })));

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
  const [filters, setFilters] = useState({
    ageRange: '',
    voterStatus: '',
    programs: '',
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
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
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
      </div>

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
      </Suspense>
    </div>
  );
}