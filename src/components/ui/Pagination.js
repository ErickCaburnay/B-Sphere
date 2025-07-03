import React from "react";

export default function Pagination({
  currentPage,
  totalPages,
  rowsPerPage,
  rowsPerPageOptions = [10, 30, 50],
  totalEntries,
  startEntry,
  endEntry,
  onPageChange,
  onRowsPerPageChange,
  className = "",
}) {
  return (
    <div className={`flex items-center justify-between flex-wrap gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={e => onRowsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {rowsPerPageOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="text-sm">
          Showing {startEntry}-{endEntry} of {totalEntries} entries
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
            (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) ? (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`px-3 py-1 rounded-md border text-sm ${currentPage === pageNumber ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                {pageNumber}
              </button>
            ) : (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) ? (
              <span key={pageNumber} className="px-1">...</span>
            ) : null
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Last
        </button>
      </div>
    </div>
  );
} 