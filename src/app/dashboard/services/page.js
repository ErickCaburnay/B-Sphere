"use client";

import { useState } from "react";
import { Search, X, ChevronDown, Download, ChevronLeft, ChevronRight } from "lucide-react";
import DocumentApplicationModal from "@/components/DocumentApplicationModal";
import BrgyClearanceFormModal from "@/components/BrgyClearanceFormModal";
import BrgyCertificateFormModal from "@/components/BrgyCertificateFormModal";
import BrgyIndigencyFormModal from "@/components/BrgyIndigencyFormModal";
import BrgyIdFormModal from "@/components/BrgyIdFormModal";
import BrgyBusinessPermitFormModal from "@/components/BrgyBusinessPermitFormModal";

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
      nameOfApplicant: "USER TESTER",
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Services Management</h1>

      {/* Controls above the table */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition"
            onClick={handleOpenDocumentApplicationModal}
          >
            Apply
          </button>
          <div className="relative flex items-center">
            <Search size={20} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm("")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <select
            className="appearance-none px-4 py-2 border border-gray-300 rounded-md bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-green-700 text-white text-left">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider">
                TRANSACTION NO
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider">
                DATE FILED
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider">
                NAME OF APPLICANT
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider">
                PURPOSE
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider">
                TYPE
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider">
                STATUS
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider">
                DATE ISSUED
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-sm font-semibold tracking-wider text-center">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((service, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {service.transactionNo}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {service.dateFiled}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {service.nameOfApplicant}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {service.purpose}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {service.type}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {service.status}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {service.dateIssued}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
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

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Rows per page:</span>
          <select
            className="appearance-none px-3 py-1 border border-gray-300 rounded-md bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when rows per page changes
            }}
          >
            <option value={10}>10</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none md:static md:translate-y-0" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

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
    </div>
  );
}