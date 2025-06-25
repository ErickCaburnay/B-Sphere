"use client";

import { useState, useMemo, useRef, useContext, useEffect } from 'react';
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
import { AddResidentModal } from './AddResidentModal';
import { useRouter } from 'next/navigation';
import { ViewResidentModal } from './ViewResidentModal';
import { EditResidentModal } from './EditResidentModal';
import { DeleteResidentModal } from './DeleteResidentModal';
import { ThemeContext } from '../ui/ThemeContext';

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

  // Fetch residents when page or pageSize changes
  useEffect(() => {
    async function fetchResidents() {
      setLoading(true);
      try {
        const res = await fetch(`/api/residents?page=${page}&pageSize=${pageSize}`);
        const { data, total } = await res.json();
        setResidents(data);
        setTotalCount(total);
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    // Only fetch if not initial load
    if (!(page === initialPage && pageSize === initialPageSize)) {
      fetchResidents();
    }
  }, [page, pageSize]);

  // Table configuration
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
            className="text-blue-600 hover:text-blue-800"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleEditResident(row.original)}
            className="text-green-600 hover:text-green-800"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteResident(row.original)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ], []);

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

  // Helper functions
  const calculateAge = (birthdate) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Export functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(residents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'residents.xlsx');
    toast.success('Excel file downloaded successfully!');
  };

  const exportToPDF = () => {
    // PDF export implementation
    toast.success('PDF export feature coming soon!');
  };

  // Event handlers
  const handleViewResident = (resident) => {
    setSelectedResident(resident);
    setShowViewModal(true);
  };

  const handleEditResident = (resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  const handleDeleteResident = async (resident) => {
    setSelectedResident(resident);
    setShowDeleteModal(true);
  };

  const handleUpdateResident = async (id, data) => {
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
      toast.success('Resident updated successfully');
    } catch (error) {
      toast.error('Failed to update resident');
    }
  };

  const handleDeleteConfirm = async () => {
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
      toast.error('Failed to delete resident');
    }
  };

  const handleAddResident = async (data) => {
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
      toast.error('Failed to add resident');
      throw error;
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedResidents.length === 0) {
      toast.error('Please select residents first');
      return;
    }

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedResidents.length} residents?`)) {
        try {
          const deletePromises = selectedResidents.map(id =>
            fetch(`/api/residents/${id}`, { method: 'DELETE' })
          );
          await Promise.all(deletePromises);
          setResidents(residents.filter(r => !selectedResidents.includes(r.id)));
          setSelectedResidents([]);
          toast.success('Selected residents deleted successfully');
        } catch (error) {
          toast.error('Failed to delete some residents');
        }
      }
    } else if (action === 'export') {
      const selectedData = residents.filter(r => selectedResidents.includes(r.id));
      const worksheet = XLSX.utils.json_to_sheet(selectedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Residents");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, 'selected-residents.xlsx');
      toast.success('Selected residents exported successfully');
    }
  };

  // Filtering logic
  const getFilteredResidents = () => {
    let filtered = [...residents];
    // Age Range
    if (filters.ageRange) {
      filtered = filtered.filter(r => {
        const age = calculateAge(r.birthdate);
        if (filters.ageRange === '0-17') return age >= 0 && age <= 17;
        if (filters.ageRange === '18-30') return age >= 18 && age <= 30;
        if (filters.ageRange === '31-45') return age >= 31 && age <= 45;
        if (filters.ageRange === '46-60') return age >= 46 && age <= 60;
        if (filters.ageRange === '60+') return age >= 60;
        return true;
      });
    }
    // Voter Status
    if (filters.voterStatus) {
      filtered = filtered.filter(r => r.voterStatus === filters.voterStatus);
    }
    // Programs
    if (filters.programs) {
      if (filters.programs === 'TUPAD') filtered = filtered.filter(r => r.isTUPAD);
      if (filters.programs === '4Ps') filtered = filtered.filter(r => r.is4Ps);
      if (filters.programs === 'PWD') filtered = filtered.filter(r => r.isPWD);
      if (filters.programs === 'Solo Parent') filtered = filtered.filter(r => r.isSoloParent);
    }
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.firstName?.toLowerCase().includes(q) ||
        r.lastName?.toLowerCase().includes(q) ||
        r.id?.toString().toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q)
      );
    }
    return filtered;
  };
  const filteredResidents = getFilteredResidents();

  // Excel Import logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      // Map Excel columns to resident fields
      const newResidents = json.map(row => ({
        firstName: row.firstName || row['First Name'] || '',
        lastName: row.lastName || row['Last Name'] || '',
        birthdate: row.birthdate || row['Birthdate'] || '',
        gender: row.gender || row['Gender'] || '',
        voterStatus: row.voterStatus || row['Voter Status'] || '',
        maritalStatus: row.maritalStatus || row['Marital Status'] || '',
        address: row.address || row['Address'] || '',
        isTUPAD: row.isTUPAD || row['TUPAD'] || false,
        is4Ps: row.is4Ps || row['4Ps'] || false,
        isPWD: row.isPWD || row['PWD'] || false,
        isSoloParent: row.isSoloParent || row['Solo Parent'] || false,
      }));
      // Optionally, send to backend for batch insert
      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: newResidents })
      });
      if (response.ok) {
        const added = await response.json();
        setResidents(prev => [...added, ...prev]);
        toast.success('Residents imported successfully!');
      } else {
        throw new Error('Failed to import residents');
      }
    } catch (err) {
      toast.error('Invalid Excel file or format.');
    }
    e.target.value = '';
  };

  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="text-gray-900 dark:text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500`} />
              <input
                type="text"
                placeholder="Search residents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-12 py-2 border border-gray-300 text-gray-900 rounded-md w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg text-gray-600 hover:text-gray-900"
                title="Show filters"
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Table className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <Menu as="div" className="relative">
              <Menu.Button className={`p-2 rounded-lg text-gray-600 hover:text-gray-900`}>
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
                <Menu.Items className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 bg-white`}>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={exportToExcel}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm w-full`}
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
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center px-4 py-2 text-sm w-full`}
                      >
                        <FileTextIcon className="h-4 w-4 mr-2" />
                        Export to PDF
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
            {/* Import Excel Button */}
            <button
              onClick={handleImportClick}
              className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2`}
            >
              <Upload className="h-5 w-5" />
              <span>Import Excel</span>
            </button>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => setShowAddModal(true)}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2`}
            >
              <Plus className="h-5 w-5" />
              <span>Add Resident</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`mb-6 rounded-lg shadow p-4`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Age Range
                </label>
                <select
                  value={filters.ageRange}
                  onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
                  className={`mt-1 block w-full text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">All Ages</option>
                  <option value="0-17">0-17</option>
                  <option value="18-30">18-30</option>
                  <option value="31-45">31-45</option>
                  <option value="46-60">46-60</option>
                  <option value="60+">60+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Voter Status
                </label>
                <select
                  value={filters.voterStatus}
                  onChange={(e) => setFilters({ ...filters, voterStatus: e.target.value })}
                  className={`mt-1 block w-full text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">All</option>
                  <option value="Registered">Registered</option>
                  <option value="Not Registered">Not Registered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Programs
                </label>
                <select
                  value={filters.programs}
                  onChange={(e) => setFilters({ ...filters, programs: e.target.value })}
                  className={`mt-1 block w-full text-gray-900 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">All Programs</option>
                  <option value="TUPAD">TUPAD</option>
                  <option value="4Ps">4Ps</option>
                  <option value="PWD">PWD</option>
                  <option value="Solo Parent">Solo Parent</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedResidents.length > 0 && (
          <div className={`mb-6 rounded-lg shadow p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-900">
                  {selectedResidents.length} residents selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('export')}
                  className={`px-3 py-1 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700`}
                >
                  Export Selected
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className={`px-3 py-1 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700`}
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedResidents([])}
                  className={`p-1 rounded-md text-gray-600 hover:text-gray-900`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Content */}
        <div className={`rounded-lg shadow`}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <span className="text-lg text-gray-600">Loading residents...</span>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-600">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-white"
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
                    <tbody className={`divide-y divide-gray-200`}>
                      {filteredResidents.map((row, idx) => {
                        const tableRow = table.getRowModel().rows[idx];
                        return (
                          <tr
                            key={row.id}
                            className={`${'hover:bg-gray-50'}`}
                          >
                            {tableRow.getVisibleCells().map(cell => (
                              <td
                                key={cell.id}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredResidents.map(resident => (
                    <div
                      key={resident.id}
                      className={`rounded-lg shadow p-4`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-semibold`}>
                          {resident.firstName} {resident.lastName}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewResident(resident)}
                            className={`text-blue-600 hover:text-blue-800`}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditResident(resident)}
                            className={`text-green-600 hover:text-green-800`}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteResident(resident)}
                            className={`text-red-600 hover:text-red-800`}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className={`text-sm`}>
                          ID: {resident.id}
                        </p>
                        <p className={`text-sm`}>
                          Age: {calculateAge(resident.birthdate)}
                        </p>
                        <p className={`text-sm`}>
                          Address: {resident.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        <div className={`mt-6 flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-900">Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className={`rounded-md border text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500`}
            >
              {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              className={`rounded-md p-2 text-gray-900 hover:bg-gray-200`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-900">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              className={`rounded-md p-2 text-gray-900 hover:bg-gray-200`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}