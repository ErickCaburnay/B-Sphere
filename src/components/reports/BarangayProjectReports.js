'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { Building, CheckCircle, Clock, Wallet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function BarangayProjectReports() {
  // Mock data - replace with actual data from your backend
  const projectSummary = {
    totalProjects: 15,
    completed: 8,
    ongoing: 5,
    planned: 2,
    totalBudgetAllocated: 5000000,
    totalBudgetUsed: 3500000,
  };

  const projectStatusData = [
    { name: 'Completed', value: projectSummary.completed },
    { name: 'Ongoing', value: projectSummary.ongoing },
    { name: 'Planned', value: projectSummary.planned },
  ];

  const monthlyBudgetUsage = [
    { month: 'Jan', usage: 300000 },
    { month: 'Feb', usage: 400000 },
    { month: 'Mar', usage: 500000 },
    { month: 'Apr', usage: 600000 },
    { month: 'May', usage: 700000 },
  ];

  const recentProjects = [
    { id: 'PROJ001', name: 'Road Repair Phase 2', status: 'Ongoing', budget: '₱ 800,000', timeline: 'June 2025 - Dec 2025' },
    { id: 'PROJ002', name: 'Community Garden Initiative', status: 'Completed', budget: '₱ 150,000', timeline: 'Mar 2025 - May 2025' },
    { id: 'PROJ003', name: 'Drainage System Upgrade', status: 'Planned', budget: '₱ 1,200,000', timeline: 'Jan 2026 - June 2026' },
    { id: 'PROJ004', name: 'Barangay Hall Renovation', status: 'Ongoing', budget: '₱ 2,000,000', timeline: 'Apr 2025 - Feb 2026' },
    { id: 'PROJ005', name: 'Skills Training Program', status: 'Completed', budget: '₱ 200,000', timeline: 'Feb 2025 - Apr 2025' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Projects"
          value={projectSummary.totalProjects}
          icon={Building}
          trend={1.0}
        />
        <ReportCard
          title="Completed Projects"
          value={projectSummary.completed}
          icon={CheckCircle}
          trend={2.0}
        />
        <ReportCard
          title="Ongoing Projects"
          value={projectSummary.ongoing}
          icon={Clock}
          trend={-0.5}
        />
        <ReportCard
          title="Total Budget Used"
          value={`₱ ${projectSummary.totalBudgetUsed.toLocaleString()}`}
          icon={Wallet}
          description={`Of ₱ ${projectSummary.totalBudgetAllocated.toLocaleString()} allocated`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Project Status Distribution"
          type="pie"
          data={projectStatusData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Monthly Budget Usage"
          type="line"
          data={monthlyBudgetUsage}
          xAxisKey="month"
          series={[{ key: 'usage', name: 'Budget Used (₱)' }]}
        />
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Projects</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Timeline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentProjects.map((proj) => (
              <TableRow key={proj.id}>
                <TableCell>{proj.id}</TableCell>
                <TableCell>{proj.name}</TableCell>
                <TableCell>{proj.status}</TableCell>
                <TableCell>{proj.budget}</TableCell>
                <TableCell>{proj.timeline}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 