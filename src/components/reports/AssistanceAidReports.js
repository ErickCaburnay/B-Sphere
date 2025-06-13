'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { Handshake, Users, Wallet, TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AssistanceAidReports() {
  // Mock data - replace with actual data from your backend
  const aidSummary = {
    totalAidDistributed: '₱ 1,500,000',
    totalBeneficiaries: 1200,
    reliefGoods: 800,
    cashAssistance: 400,
    budgetSpent: 1200000,
    budgetAllocated: 2000000,
  };

  const aidTypeData = [
    { name: 'Relief Goods', value: aidSummary.reliefGoods },
    { name: 'Cash Assistance', value: aidSummary.cashAssistance },
  ];

  const monthlyAidDistribution = [
    { month: 'Jan', amount: 200000 },
    { month: 'Feb', amount: 300000 },
    { month: 'Mar', amount: 250000 },
    { month: 'Apr', amount: 400000 },
    { month: 'May', amount: 350000 },
  ];

  const recentAidDistribution = [
    { id: 'AID001', type: 'Relief Goods', beneficiaries: 'Fam. Dela Cruz', date: '2025-05-28', amount: 'N/A' },
    { id: 'AID002', type: 'Cash Assistance', beneficiaries: 'Juan Santos', date: '2025-05-27', amount: '₱ 5,000' },
    { id: 'AID003', type: 'Relief Goods', beneficiaries: 'Fam. Reyes', date: '2025-05-26', amount: 'N/A' },
    { id: 'AID004', type: 'Cash Assistance', beneficiaries: 'Maria Lim', date: '2025-05-25', amount: '₱ 3,000' },
    { id: 'AID005', type: 'Relief Goods', beneficiaries: 'Fam. Garcia', date: '2025-05-24', amount: 'N/A' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Aid Distributed"
          value={aidSummary.totalAidDistributed}
          icon={Handshake}
          description="This period"
        />
        <ReportCard
          title="Total Beneficiaries"
          value={aidSummary.totalBeneficiaries}
          icon={Users}
          trend={1.5}
        />
        <ReportCard
          title="Budget Spent"
          value={`₱ ${aidSummary.budgetSpent.toLocaleString()}`}
          icon={Wallet}
          description={`Of ₱ ${aidSummary.budgetAllocated.toLocaleString()} allocated`}
        />
        <ReportCard
          title="Relief Goods Distributed"
          value={aidSummary.reliefGoods}
          icon={Handshake}
          trend={2.0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Aid Distribution by Type"
          type="pie"
          data={aidTypeData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Monthly Aid Distribution Amount"
          type="line"
          data={monthlyAidDistribution}
          xAxisKey="month"
          series={[{ key: 'amount', name: 'Amount (₱)' }]}
        />
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Aid Distributions</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aid ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Beneficiaries</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAidDistribution.map((aid) => (
              <TableRow key={aid.id}>
                <TableCell>{aid.id}</TableCell>
                <TableCell>{aid.type}</TableCell>
                <TableCell>{aid.beneficiaries}</TableCell>
                <TableCell>{aid.date}</TableCell>
                <TableCell>{aid.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 