"use client";

import { useState } from "react";
import { Search, X, ChevronDown, Download, ChevronLeft, ChevronRight, Filter } from "lucide-react";
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
  const [filterBy, setFilterBy] = useState("newest"); // 'newest' or 'oldest'
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDocumentApplicationModalOpen, setIsDocumentApplicationModalOpen] = useState(false);
  const [isBrgyClearanceFormModalOpen, setIsBrgyClearanceFormModalOpen] = useState(false);
  const [isBrgyCertificateFormModalOpen, setIsBrgyCertificateFormModalOpen] = useState(false);
  const [isBrgyIndigencyFormModalOpen, setIsBrgyIndigencyFormModalOpen] = useState(false);
  const [isBrgyIdFormModalOpen, setIsBrgyIdFormModalOpen] = useState(false);
  const [isBrgyBusinessPermitFormModalOpen, setIsBrgyBusinessPermitFormModalOpen] = useState(false);
  const [activeView, setActiveView] = useState("table"); // 'table' or 'grid'

  const handleOpenDocumentApplicationModal = () => {
    setIsDocumentApplicationModalOpen(true);
  };

  const handleCloseDocumentApplicationModal = () => {
    setIsDocumentApplicationModalOpen(false);
  };

  const handleSelectDocumentType = (docType) => {
    setIsDocumentApplicationModalOpen(false); // Close the document application modal first

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
    setIsDocumentApplicationModalOpen(true); // Re-open the document application modal
  };

  // Dummy data for the table
  const servicesData = [
    {
      transactionNo: "INDG-000012",
      dateFiled: "Dec 16, 2024",
      nameOfApplicant: "Maria Santos",
      purpose: "MEDICAL ASSISTANCE",
      type: "Indigency",
      status: "Printed",
      dateIssued: "Dec 16, 2024",
    },
    {
      transactionNo: "TRNS-000001",
      dateFiled: "Nov 20, 2024",
      nameOfApplicant: "Jane Doe",
      purpose: "FINANCIAL AID",
      type: "Financial",
      status: "Approved",
      dateIssued: "Nov 25, 2024",
    },
    {
      transactionNo: "TRNS-000002",
      dateFiled: "Dec 01, 2024",
      nameOfApplicant: "John Smith",
      purpose: "SCHOOL ENROLLMENT",
      type: "Enrollment",
      status: "Pending",
      dateIssued: "Dec 01, 2024",
    },
    {
      transactionNo: "TRNS-000003",
      dateFiled: "Oct 10, 2024",
      nameOfApplicant: "Alice Johnson",
      purpose: "HOUSING APPLICATION",
      type: "Housing",
      status: "Printed",
      dateIssued: "Oct 15, 2024",
    },
    {
      transactionNo: "TRNS-000004",
      dateFiled: "Sep 05, 2024",
      nameOfApplicant: "Bob Williams",
      purpose: "BUSINESS PERMIT",
      type: "Business",
      status: "Approved",
      dateIssued: "Sep 10, 2024",
    },
    {
      transactionNo: "TRNS-000005",
      dateFiled: "Jan 10, 2025",
      nameOfApplicant: "Eve Brown",
      purpose: "BIRTH CERTIFICATE",
      type: "Document Request",
      status: "Pending",
      dateIssued: "Jan 10, 2025",
    },
    {
      transactionNo: "TRNS-000006",
      dateFiled: "Feb 14, 2025",
      nameOfApplicant: "Charlie Davis",
      purpose: "DEATH CERTIFICATE",
      type: "Document Request",
      status: "Printed",
      dateIssued: "Feb 16, 2025",
    },
    {
      transactionNo: "TRNS-000007",
      dateFiled: "Mar 01, 2025",
      nameOfApplicant: "Grace Miller",
      purpose: "MARRIAGE CERTIFICATE",
      type: "Document Request",
      status: "Approved",
      dateIssued: "Mar 05, 2025",
    },
    {
      transactionNo: "TRNS-000008",
      dateFiled: "Apr 20, 2025",
      nameOfApplicant: "David Wilson",
      purpose: "MEDICAL ASSISTANCE",
      type: "Indigency",
      status: "Pending",
      dateIssued: "Apr 20, 2025",
    },
    {
      transactionNo: "TRNS-000009",
      dateFiled: "May 15, 2025",
      nameOfApplicant: "Olivia Moore",
      purpose: "SCHOLARSHIP APPLICATION",
      type: "Scholarship",
      status: "Printed",
      dateIssued: "May 20, 2025",
    },
    {
      transactionNo: "TRNS-000010",
      dateFiled: "Jun 01, 2025",
      nameOfApplicant: "Liam Taylor",
      purpose: "BUSINESS PERMIT",
      type: "Business",
      status: "Approved",
      dateIssued: "Jun 05, 2025",
    },
    {
      transactionNo: "TRNS-000011",
      dateFiled: "Jul 04, 2025",
      nameOfApplicant: "Sophia Anderson",
      purpose: "FINANCIAL AID",
      type: "Financial",
      status: "Pending",
      dateIssued: "Jul 04, 2025",
    },
    {
      transactionNo: "TRNS-000012",
      dateFiled: "Aug 12, 2025",
      nameOfApplicant: "Noah Thomas",
      purpose: "HOUSING APPLICATION",
      type: "Housing",
      status: "Printed",
      dateIssued: "Aug 15, 2025",
    },
    {
      transactionNo: "TRNS-000013",
      dateFiled: "Sep 22, 2025",
      nameOfApplicant: "Emma Jackson",
      purpose: "SCHOOL ENROLLMENT",
      type: "Enrollment",
      status: "Approved",
      dateIssued: "Sep 25, 2025",
    },
    {
      transactionNo: "TRNS-000014",
      dateFiled: "Oct 30, 2025",
      nameOfApplicant: "Ava White",
      purpose: "MEDICAL ASSISTANCE",
      type: "Indigency",
      status: "Pending",
      dateIssued: "Oct 30, 2025",
    },
    {
      transactionNo: "TRNS-000015",
      dateFiled: "Nov 01, 2025",
      nameOfApplicant: "Mason Harris",
      purpose: "BIRTH CERTIFICATE",
      type: "Document Request",
      status: "Printed",
      dateIssued: "Nov 05, 2025",
    },
  ];

  const filteredData = servicesData.filter((service) =>
    Object.values(service).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a, b) => {
    if (filterBy === "newest") {
      return new Date(b.dateFiled) - new Date(a.dateFiled);
    } else {
      return new Date(a.dateFiled) - new Date(b.dateFiled);
    }
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <DashboardPageContainer 
      heading="Services Management"
      subtitle="Process document requests and manage barangay services efficiently"
    >
      {/* Search and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="relative w-full md:w-auto">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            className="pl-10 pr-12 py-2 border border-gray-300 text-gray-900 rounded-md w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setSearchTerm("")}
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Icon */}
          <button
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title="Filter"
            // onClick={handleFilterToggle}
          >
            <Filter className="h-5 w-5" />
          </button>
          {/* Table View Icon */}
          <button
            onClick={() => setActiveView("table")}
            className={`p-2 rounded-lg transition-colors ${
              activeView === "table"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-100 "
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table">
              <path d="M12 3v18"></path>
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M3 15h18"></path>
            </svg>
          </button>
          {/* Grid View Icon */}
          <button
            onClick={() => setActiveView("grid")}
            className={`p-2 rounded-lg transition-colors ${
              activeView === "grid"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:bg-gray-100 "
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid">
              <rect width="7" height="7" x="3" y="3" rx="1"></rect>
              <rect width="7" height="7" x="14" y="3" rx="1"></rect>
              <rect width="7" height="7" x="14" y="14" rx="1"></rect>
              <rect width="7" height="7" x="3" y="14" rx="1"></rect>
            </svg>
          </button>
          {/* Download Icon */}
          <button
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
          </button>
          <button 
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition flex items-center gap-2"
            onClick={handleOpenDocumentApplicationModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
              <line x1="12" x2="12" y1="5" y2="19"></line>
              <line x1="5" x2="19" y1="12" y2="12"></line>
            </svg>
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`shadow-md rounded-lg overflow-hidden mb-6`}>
        <table className="min-w-full leading-normal">
          <thead className={`bg-green-600`}>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white">
                TRANSACTION NO
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white">
                DATE FILED
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white">
                NAME OF APPLICANT
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white">
                PURPOSE
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white">
                TYPE
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white">
                STATUS
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white">
                DATE ISSUED
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-xs font-bold uppercase tracking-wider text-white text-center">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((service, index) => (
              <tr key={index} className={`hover:bg-gray-50`}>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm`}>
                  {service.transactionNo}
                </td>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm`}>
                  {service.dateFiled}
                </td>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm`}>
                  {service.nameOfApplicant}
                </td>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm`}>
                  {service.purpose}
                </td>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm`}>
                  {service.type}
                </td>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm`}>
                  {service.status}
                </td>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm`}>
                  {service.dateIssued}
                </td>
                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-gray-900 text-sm text-center`}>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition flex items-center justify-center mx-auto gap-1">
                    <Download size={16} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        totalEntries={filteredData.length}
        startEntry={(currentPage - 1) * rowsPerPage + 1}
        endEntry={Math.min(currentPage * rowsPerPage, filteredData.length)}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={v => { setRowsPerPage(v); setCurrentPage(1); }}
        className="mt-2"
      />

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
  );
}