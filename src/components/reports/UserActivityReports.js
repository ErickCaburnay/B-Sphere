'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { User, Activity, LogIn, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function UserActivityReports() {
  // Mock data - replace with actual data from your backend
  const activitySummary = {
    totalLogins: 2500,
    uniqueAdmins: 15,
    recordsEdited: 500,
    recordsDeleted: 50,
  };

  const dailyLogins = [
    { date: 'May 20', logins: 80 },
    { date: 'May 21', logins: 90 },
    { date: 'May 22', logins: 75 },
    { date: 'May 23', logins: 100 },
    { date: 'May 24', logins: 85 },
  ];

  const actionTypesData = [
    { name: 'Record Edited', value: 500 },
    { name: 'Record Created', value: 300 },
    { name: 'Document Issued', value: 150 },
    { name: 'Login', value: 2500 },
    { name: 'Record Deleted', value: 50 },
  ];

  const recentActivities = [
    { id: 'ACT001', user: 'Admin 1', action: 'Edited Resident Record', date: '2025-05-30', time: '10:30' },
    { id: 'ACT002', user: 'Sub-Admin 2', action: 'Issued Barangay Clearance', date: '2025-05-30', time: '09:45' },
    { id: 'ACT003', user: 'Admin 1', action: 'Logged In', date: '2025-05-30', time: '09:00' },
    { id: 'ACT004', user: 'Admin 3', action: 'Deleted Complaint Record', date: '2025-05-29', time: '16:00' },
    { id: 'ACT005', user: 'Sub-Admin 2', action: 'Updated Household Info', date: '2025-05-29', time: '14:15' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Logins"
          value={activitySummary.totalLogins}
          icon={LogIn}
          trend={-0.2}
        />
        <ReportCard
          title="Unique Admins Active"
          value={activitySummary.uniqueAdmins}
          icon={User}
          trend={0.1}
        />
        <ReportCard
          title="Records Edited"
          value={activitySummary.recordsEdited}
          icon={Edit}
          trend={2.0}
        />
        <ReportCard
          title="Records Deleted"
          value={activitySummary.recordsDeleted}
          icon={Trash2}
          trend={-0.5}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Daily Login Trends"
          type="line"
          data={dailyLogins}
          xAxisKey="date"
          series={[{ key: 'logins', name: 'Logins' }]}
        />
        <ReportChart
          title="User Action Types"
          type="pie"
          data={actionTypesData}
          xAxisKey="name"
          yAxisKey="value"
        />
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent User Activities</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivities.map((act) => (
              <TableRow key={act.id}>
                <TableCell>{act.id}</TableCell>
                <TableCell>{act.user}</TableCell>
                <TableCell>{act.action}</TableCell>
                <TableCell>{act.date}</TableCell>
                <TableCell>{act.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 