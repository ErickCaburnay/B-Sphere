'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { FileText, CheckCircle, Clock, XCircle, ListTodo } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ServiceRequestReports() {
  // Mock data - replace with actual data from your backend
  const requestSummary = {
    totalRequests: 850,
    approved: 700,
    pending: 100,
    denied: 50,
  };

  const requestTypesData = [
    { name: 'ID Replacement', value: 300 },
    { name: 'Personal Info Update', value: 250 },
    { name: 'Document Correction', value: 150 },
    { name: 'Others', value: 150 },
  ];

  const requestStatusData = [
    { name: 'Approved', value: requestSummary.approved },
    { name: 'Pending', value: requestSummary.pending },
    { name: 'Denied', value: requestSummary.denied },
  ];

  const monthlyRequests = [
    { month: 'Jan', requests: 150 },
    { month: 'Feb', requests: 180 },
    { month: 'Mar', requests: 200 },
    { month: 'Apr', requests: 170 },
    { month: 'May', requests: 150 },
  ];

  const recentRequests = [
    { id: 'REQ001', type: 'ID Replacement', resident: 'Juan Dela Cruz', date: '2025-05-29', status: 'Approved' },
    { id: 'REQ002', type: 'Personal Info Update', resident: 'Maria Clara', date: '2025-05-28', status: 'Pending' },
    { id: 'REQ003', type: 'Document Correction', resident: 'Crisostomo Ibarra', date: '2025-05-27', status: 'Approved' },
    { id: 'REQ004', type: 'ID Replacement', resident: 'Sisa Torres', date: '2025-05-26', status: 'Denied' },
    { id: 'REQ005', type: 'Personal Info Update', resident: 'Basilio Santos', date: '2025-05-25', status: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Service Requests"
          value={requestSummary.totalRequests}
          icon={ListTodo}
          trend={3.5}
        />
        <ReportCard
          title="Approved Requests"
          value={requestSummary.approved}
          icon={CheckCircle}
          trend={4.0}
        />
        <ReportCard
          title="Pending Requests"
          value={requestSummary.pending}
          icon={Clock}
          trend={-1.0}
        />
        <ReportCard
          title="Denied Requests"
          value={requestSummary.denied}
          icon={XCircle}
          trend={0.5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Service Request Types"
          type="pie"
          data={requestTypesData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Service Request Status"
          type="pie"
          data={requestStatusData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Monthly Service Requests"
          type="line"
          data={monthlyRequests}
          xAxisKey="month"
          series={[{ key: 'requests', name: 'Requests' }]}
        />
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Service Requests</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell>{req.type}</TableCell>
                <TableCell>{req.resident}</TableCell>
                <TableCell>{req.date}</TableCell>
                <TableCell>{req.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 