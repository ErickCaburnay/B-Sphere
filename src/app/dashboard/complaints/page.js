"use client";

import { useRef, useState, useEffect } from "react";
import { Search, Plus, Download, Eye, Pencil, Trash2, Table, Grid, Moon, Sun } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import { ExportReports } from '@/components/residents/ExportReports';
import ComplaintFormModal from '@/components/complaints/ComplaintFormModal';
import ComplaintViewModal from '@/components/complaints/ComplaintViewModal';
import Pagination from '@/components/ui/Pagination';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([
    {
      id: "CMP-001",
      type: "Noise Disturbance",
      respondent: "John Doe",
      complainant: "Jane Smith",
      dateFiled: "2025-06-15",
      officer: "Officer Santos",
      status: "Pending",
      resolutionDate: "—",
    },
    {
        id: "CMP-002",
        type: "Property Dispute",
        respondent: "Alice Johnson",
        complainant: "Bob Williams",
        dateFiled: "2025-06-14",
        officer: "Officer Garcia",
        status: "Resolved",
        resolutionDate: "2025-06-20",
    },
    {
        id: "CMP-003",
        type: "Pet Nuisance",
        respondent: "Charlie Brown",
        complainant: "Lucy Van Pelt",
        dateFiled: "2025-06-13",
        officer: "Officer Lee",
        status: "In Progress",
        resolutionDate: "—",
    },
    {
        id: "CMP-004",
        type: "Illegal Parking",
        respondent: "David Miller",
        complainant: "Sophia Davis",
        dateFiled: "2025-06-12",
        officer: "Officer Kim",
        status: "Pending",
        resolutionDate: "—",
    },
    {
        id: "CMP-005",
        type: "Vandalism",
        respondent: "Olivia Wilson",
        complainant: "Ethan Moore",
        dateFiled: "2025-06-11",
        officer: "Officer Chen",
        status: "Resolved",
        resolutionDate: "2025-06-18",
    },
    {
        id: "CMP-006",
        type: "Garbage Disposal",
        respondent: "Liam Taylor",
        complainant: "Ava White",
        dateFiled: "2025-06-10",
        officer: "Officer Singh",
        status: "Pending",
        resolutionDate: "—",
    },
    {
        id: "CMP-007",
        type: "Construction Noise",
        respondent: "Noah Hall",
        complainant: "Isabella Clark",
        dateFiled: "2025-06-09",
        officer: "Officer Rodriguez",
        status: "In Progress",
        resolutionDate: "—",
    },
    {
        id: "CMP-008",
        type: "Street Light Outage",
        respondent: "Mia Lewis",
        complainant: "Jackson Young",
        dateFiled: "2025-06-08",
        officer: "Officer Davis",
        status: "Resolved",
        resolutionDate: "2025-06-15",
    },
    {
        id: "CMP-009",
        type: "Water Leak",
        respondent: "Charlotte King",
        complainant: "Lucas Scott",
        dateFiled: "2025-06-07",
        officer: "Officer Wilson",
        status: "Pending",
        resolutionDate: "—",
    },
    {
        id: "CMP-010",
        type: "Illegal Vending",
        respondent: "Amelia Green",
        complainant: "Benjamin Adams",
        dateFiled: "2025-06-06",
        officer: "Officer Miller",
        status: "In Progress",
        resolutionDate: "—",
    },
    {
        id: "CMP-011",
        type: "Road Damage",
        respondent: "Harper Baker",
        complainant: "Elijah Carter",
        dateFiled: "2025-06-05",
        officer: "Officer White",
        status: "Pending",
        resolutionDate: "—",
    },
    {
        id: "CMP-012",
        type: "Loitering",
        respondent: "Evelyn Nelson",
        complainant: "James Wright",
        dateFiled: "2025-06-04",
        officer: "Officer Johnson",
        status: "Resolved",
        resolutionDate: "2025-06-10",
    },
  ]);
  const [filteredComplaints, setFilteredComplaints] = useState(complaints);
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
  ];

  useEffect(() => {
    let currentFilteredComplaints = complaints;
    if (searchText) {
      const keyword = searchText.toLowerCase();
      currentFilteredComplaints = currentFilteredComplaints.filter(complaint =>
        complaint.id.toLowerCase().includes(keyword) ||
        complaint.type.toLowerCase().includes(keyword) ||
        complaint.respondent.toLowerCase().includes(keyword) ||
        complaint.complainant.toLowerCase().includes(keyword) ||
        complaint.officer.toLowerCase().includes(keyword) ||
        complaint.status.toLowerCase().includes(keyword)
      );
    }
    if (filter) {
      currentFilteredComplaints = currentFilteredComplaints.filter(complaint =>
        complaint.type.includes(filter) || complaint.status.includes(filter)
      );
    }
    setFilteredComplaints(currentFilteredComplaints);
    setCurrentPage(1);
  }, [complaints, searchText, filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex);

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
  const handleAddComplaint = (data) => {
    setComplaints([{ ...data, id: `CMP-${String(complaints.length + 1).padStart(3, '0')}` }, ...complaints]);
    setShowAddModal(false);
  };
  const handleUpdateComplaint = (data) => {
    setComplaints(complaints.map(c => c.id === data.id ? data : c));
    setShowEditModal(false);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Complaint Records</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${darkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
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
          <div className="flex items-center space-x-2">
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
            <CustomSelect
              options={filterOptions}
              value={filter}
              onChange={setFilter}
              placeholder="Filter By"
            />
            <button
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2
                ${darkMode ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-5 w-5" />
              <span>File a Complaint</span>
            </button>
          </div>
        </div>

        {/* Table/Grid View */}
        <div className={`rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-600">
                  <tr>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.id}</td>
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
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{complaint.resolutionDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleViewComplaint(complaint)}
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleEditComplaint(complaint)}
                            title="Edit Complaint"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteComplaint(complaint)}
                            title="Delete Complaint"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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
                  className={`rounded-lg shadow p-4 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{complaint.type}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewComplaint(complaint)}
                        className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditComplaint(complaint)}
                        className={`${darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
                        title="Edit Complaint"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteComplaint(complaint)}
                        className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                        title="Delete Complaint"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>ID: {complaint.id}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Respondent: {complaint.respondent}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Complainant: {complaint.complainant}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date Filed: {complaint.dateFiled}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Officer: {complaint.officer}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status: {complaint.status}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Resolution Date: {complaint.resolutionDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}