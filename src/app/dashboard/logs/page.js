"use client";

import { useState } from "react";
import { Search, RefreshCw, Download, Printer, Eye } from "lucide-react";
import Pagination from '@/components/ui/Pagination';

const mockLogs = [
  { id: 1, username: "admin", action: "Login", role: "Admin", timestamp: "2025-06-13 10:00 AM" },
  { id: 2, username: "staff1", action: "Edit", role: "Staff", timestamp: "2025-06-13 09:45 AM" },
  { id: 3, username: "admin", action: "Delete", role: "Admin", timestamp: "2025-06-13 09:30 AM" },
  { id: 4, username: "staff2", action: "View", role: "Staff", timestamp: "2025-06-13 09:15 AM" },
  { id: 5, username: "user1", action: "Login", role: "User", timestamp: "2025-06-13 09:00 AM" },
  // ...more mock data
];

const roles = ["All", "Admin", "Staff", "User"];
const actions = ["All", "Login", "Edit", "Delete", "View"];
const rowsPerPageOptions = [10, 20, 50];

export default function LogsPage() {
  const [role, setRole] = useState("All");
  const [action, setAction] = useState("All");
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  // Filtering logic (mock)
  const filteredLogs = mockLogs.filter(log => {
    const matchRole = role === "All" || log.role === role;
    const matchAction = action === "All" || log.action === action;
    const matchSearch =
      log.username.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchAction && matchSearch;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Checkbox logic
  const allChecked = paginatedLogs.length > 0 && paginatedLogs.every(log => selectedRows.includes(log.id));
  const handleCheckAll = () => {
    if (allChecked) {
      setSelectedRows(selectedRows.filter(id => !paginatedLogs.some(log => log.id === id)));
    } else {
      setSelectedRows([...new Set([...selectedRows, ...paginatedLogs.map(log => log.id)])]);
    }
  };
  const handleCheckRow = (id) => {
    setSelectedRows(selectedRows.includes(id)
      ? selectedRows.filter(rowId => rowId !== id)
      : [...selectedRows, id]);
  };

  // Toolbar actions
  const handleExport = () => alert("Exporting logs...");
  const handlePrint = () => window.print();
  const handleRefresh = () => alert("Refreshing logs...");

  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Logs & User Activities</h2>
        <div className="flex items-center gap-2">
          <button className={`p-2 rounded-full transition text-gray-600 hover:text-gray-900`} onClick={handleExport} title="Export">
            <Download size={20} />
          </button>
          <button className={`p-2 rounded-full transition text-gray-600 hover:text-gray-900`} onClick={handlePrint} title="Print">
            <Printer size={20} />
          </button>
        </div>
      </div>
      <div className="bg-green-600 h-1 w-full mb-6 rounded"></div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border pl-10 pr-10 py-2 rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 border-gray-300"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        {/* Role Filter */}
        <select
          value={role}
          onChange={e => { setRole(e.target.value); setCurrentPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 border-gray-300"
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {/* Action Filter */}
        <select
          value={action}
          onChange={e => { setAction(e.target.value); setCurrentPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 border-gray-300"
        >
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Logs Table */}
      <div className="w-full overflow-auto rounded-xl shadow border border-gray-200 bg-white">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">
                <input type="checkbox" checked={allChecked} onChange={handleCheckAll} />
              </th>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Username</th>
              <th className="p-4 text-left font-semibold">Action</th>
              <th className="p-4 text-left font-semibold">Role</th>
              <th className="p-4 text-left font-semibold">Timestamp</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No logs found.</td>
              </tr>
            ) : (
              paginatedLogs.map(log => (
                <tr key={log.id} className="hover:bg-green-50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(log.id)}
                      onChange={() => handleCheckRow(log.id)}
                    />
                  </td>
                  <td className="p-4">{log.id}</td>
                  <td className="p-4">{log.username}</td>
                  <td className="p-4">{log.action}</td>
                  <td className="p-4">{log.role}</td>
                  <td className="p-4">{log.timestamp}</td>
                  <td className="p-4">
                    <button
                      className="p-2 rounded-full transition hover:bg-gray-200 text-blue-600"
                      title="View Details"
                      // onClick={() => handleViewLog(log)}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        totalEntries={filteredLogs.length}
        startEntry={startIndex + 1}
        endEntry={Math.min(endIndex, filteredLogs.length)}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={v => { setRowsPerPage(v); setCurrentPage(1); }}
        className="mt-2"
      />
    </div>
  );
} 