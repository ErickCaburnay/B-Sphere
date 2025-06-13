'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ComplaintReports() {
  // Mock data - replace with actual data from your backend
  const complaintSummary = {
    totalFiled: 520,
    resolved: 450,
    pending: 60,
    underMediation: 10,
    averageResolutionTime: '3.5 days',
  };

  const complaintTypesData = [
    { name: 'Domestic', value: 180 },
    { name: 'Property', value: 120 },
    { name: 'Noise', value: 90 },
    { name: 'Environmental', value: 70 },
    { name: 'Others', value: 60 },
  ];

  const complaintStatusData = [
    { name: 'Resolved', value: complaintSummary.resolved },
    { name: 'Pending', value: complaintSummary.pending },
    { name: 'Under Mediation', value: complaintSummary.underMediation },
  ];

  const monthlyComplaints = [
    { month: 'Jan', filed: 80, resolved: 70 },
    { month: 'Feb', filed: 90, resolved: 80 },
    { month: 'Mar', filed: 110, resolved: 100 },
    { month: 'Apr', filed: 100, resolved: 90 },
    { month: 'May', filed: 140, resolved: 110 },
  ];

  const recentComplaints = [
    { id: 'COMP001', type: 'Domestic', complainant: 'Resident A', date: '2025-05-22', status: 'Resolved' },
    { id: 'COMP002', type: 'Noise', complainant: 'Resident B', date: '2025-05-21', status: 'Pending' },
    { id: 'COMP003', type: 'Property', complainant: 'Resident C', date: '2025-05-20', status: 'Under Mediation' },
    { id: 'COMP004', type: 'Environmental', complainant: 'Resident D', date: '2025-05-19', status: 'Resolved' },
    { id: 'COMP005', type: 'Domestic', complainant: 'Resident E', date: '2025-05-18', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Complaints Filed"
          value={complaintSummary.totalFiled}
          icon={MessageSquare}
          trend={-1.2}
        />
        <ReportCard
          title="Resolved Complaints"
          value={complaintSummary.resolved}
          icon={CheckCircle}
          trend={3.0}
        />
        <ReportCard
          title="Pending Complaints"
          value={complaintSummary.pending}
          icon={Clock}
          trend={2.5}
        />
        <ReportCard
          title="Avg. Resolution Time"
          value={complaintSummary.averageResolutionTime}
          icon={XCircle}
          description="This month"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Complaint Types"
          type="pie"
          data={complaintTypesData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Complaint Resolution Status"
          type="pie"
          data={complaintStatusData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Monthly Complaint Trends"
          type="line"
          data={monthlyComplaints}
          xAxisKey="month"
          series={[
            { key: 'filed', name: 'Filed Complaints' },
            { key: 'resolved', name: 'Resolved Complaints' },
          ]}
        />
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Complaints</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Complainant</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentComplaints.map((comp) => (
              <TableRow key={comp.id}>
                <TableCell>{comp.id}</TableCell>
                <TableCell>{comp.type}</TableCell>
                <TableCell>{comp.complainant}</TableCell>
                <TableCell>{comp.date}</TableCell>
                <TableCell>{comp.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 