"use client";

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

export function ExportReports({ data, type = 'residents' }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format) => {
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [type]: data })  // dynamic key: { residents } or { complaints }
      });
  
      if (!response.ok) throw new Error(`${format.toUpperCase()} export failed`);
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${format.toUpperCase()}:`, error);
      alert(`Failed to export ${format.toUpperCase()}.`);
    } finally {
      setIsOpen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Full Name", "Age", "Marital Status", "Gender", "Voter Status", "Birthdate", "Birthplace", "Citizenship", "Address", "Contact Number", "Email", "Occupation", "Employment Status", "Educational Attainment", "PWD", "Senior", "TUPAD", "4Ps", "Solo Parent"];
    const rows = residents.map(r => [
      r.uniqueId,
      r.fullName,
      r.age,
      r.maritalStatus,
      r.gender,
      r.isVoter ? 'Registered' : 'Not Registered',
      new Date(r.birthdate).toLocaleDateString(),
      r.birthplace || '',
      r.citizenship,
      r.address,
      r.contactNumber || '',
      r.email || '',
      r.occupation || '',
      r.employmentStatus || '',
      r.educationalAttainment || '',
      r.isPWD ? 'Yes' : 'No',
      r.isSenior ? 'Yes' : 'No',
      r.isTUPAD ? 'Yes' : 'No',
      r.is4Ps ? 'Yes' : 'No',
      r.isSoloParent ? 'Yes' : 'No',
    ]);

    let csvContent = headers.join(',') + '\n'
      + rows.map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `residents_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-200 rounded-full transition"
        title="Export"
      >
        <Download className="w-5 h-5 text-gray-700" />
        {/* Export Reports */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <button
            onClick={() => handleExport('pdf')}
            className="w-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-gray-100 text-gray-800"
            >
            <FileText className="w-4 h-4" /> Export as PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export as Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <FileText className="w-4 h-4" /> Export as CSV
          </button>
        </div>
      )}
    </div>
  );
} 