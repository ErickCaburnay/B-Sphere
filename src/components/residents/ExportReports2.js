"use client";

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

export function ExportReports({ residents }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ residents }),
      });
      if (!response.ok) throw new Error('PDF export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `residents_report_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF.');
    } finally {
      setIsOpen(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ residents }),
      });
      if (!response.ok) throw new Error('Excel export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `residents_report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('Failed to export Excel.');
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
              r.contactNumber ? r.contactNumber.replace(/\s/g, '') : '',
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
    </button>

    {isOpen && (
      <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-md z-50">
        <button
          onClick={() => handleExportExcel('excel')}
          className="w-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-gray-100 text-gray-800"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export to Excel
        </button>
        <button
          onClick={() => handleExportPDF('pdf')}
          className="w-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-gray-100 text-gray-800"
        >
          <FileText className="w-4 h-4" /> Export to PDF
        </button>
        <button
          onClick={() => CSV('csv')}
          className="w-full px-4 py-2 flex items-center gap-2 text-sm hover:bg-gray-100 text-gray-800"
        >
          <FileText className="w-4 h-4" /> Export to CSV
        </button>
      </div>
    )}
  </div>
);
}