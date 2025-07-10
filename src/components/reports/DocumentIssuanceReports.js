'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { FileText, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function DocumentIssuanceReports() {
  // Mock data - replace with actual data from your backend
  const documentSummary = {
    totalIssued: 1500,
    barangayClearance: 700,
    indigency: 400,
    residency: 300,
  };

  const documentsByMonth = [
    { month: 'Jan', clearance: 100, indigency: 50, residency: 30 },
    { month: 'Feb', clearance: 120, indigency: 60, residency: 40 },
    { month: 'Mar', clearance: 150, indigency: 70, residency: 50 },
    { month: 'Apr', clearance: 130, indigency: 65, residency: 45 },
    { month: 'May', clearance: 200, indigency: 80, residency: 60 },
  ];

  const documentsByType = [
    { name: 'Barangay Clearance', value: documentSummary.barangayClearance },
    { name: 'Barangay Indigency', value: documentSummary.indigency },
    { name: 'Certificate of Residency', value: documentSummary.residency },
  ];

  const documentsByStatus = [
    { name: 'Issued', value: 1400 },
    { name: 'Pending', value: 80 },
    { name: 'Rejected', value: 20 },
  ];

  const recentDocuments = [
    { id: 'DOC001', type: 'Barangay Clearance', resident: 'Juan Dela Cruz', date: '2025-05-20', status: 'Issued' },
    { id: 'DOC002', type: 'Barangay Indigency', resident: 'Maria Clara', date: '2025-05-19', status: 'Pending' },
    { id: 'DOC003', type: 'Certificate of Residency', resident: 'Crisostomo Ibarra', date: '2025-05-18', status: 'Issued' },
    { id: 'DOC004', type: 'Barangay Clearance', resident: 'Sisa Torres', date: '2025-05-17', status: 'Rejected' },
    { id: 'DOC005', type: 'Certificate of Residency', resident: 'Basilio Santos', date: '2025-05-16', status: 'Issued' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Documents Issued"
          value={documentSummary.totalIssued}
          icon={FileText}
          trend={5.2}
        />
        <ReportCard
          title="Barangay Clearances"
          value={documentSummary.barangayClearance}
          icon={CheckCircle}
          trend={3.1}
        />
        <ReportCard
          title="Barangay Indigency"
          value={documentSummary.indigency}
          icon={ClipboardList}
          trend={6.5}
        />
        <ReportCard
          title="Certificates of Residency"
          value={documentSummary.residency}
          icon={FileText}
          trend={4.8}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Documents Issued by Type"
          type="pie"
          data={documentsByType}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Documents by Status"
          type="pie"
          data={documentsByStatus}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Monthly Document Issuance"
          type="line"
          data={documentsByMonth}
          xAxisKey="month"
          series={[
            { key: 'clearance', name: 'Barangay Clearance' },
            { key: 'indigency', name: 'Barangay Indigency' },
            { key: 'residency', name: 'Certificate of Residency' },
          ]}
        />
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Document Issuances</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.id}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.resident}</TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>{doc.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 