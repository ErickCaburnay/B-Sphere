'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { Users, UserPlus, UserMinus, Home } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ResidentReports() {
  // Mock data - replace with actual data from your backend
  const populationData = {
    total: 2376,
    male: 1180,
    female: 1196,
    households: 589,
    pwd: 45,
    senior: 187,
  };

  const ageGroupData = [
    { name: '0-17', value: 450 },
    { name: '18-59', value: 1739 },
    { name: '60+', value: 187 },
  ];

  const maritalStatusData = [
    { name: 'Single', value: 1200 },
    { name: 'Married', value: 950 },
    { name: 'Widowed', value: 150 },
    { name: 'Separated', value: 76 },
  ];

  const voterData = [
    { name: 'Registered', value: 1800 },
    { name: 'Not Registered', value: 576 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Population"
          value={populationData.total}
          icon={Users}
          trend={2.5}
        />
        <ReportCard
          title="Total Households"
          value={populationData.households}
          icon={Home}
          trend={1.8}
        />
        <ReportCard
          title="Senior Citizens"
          value={populationData.senior}
          icon={UserPlus}
          trend={-0.5}
        />
        <ReportCard
          title="PWD Residents"
          value={populationData.pwd}
          icon={UserMinus}
          trend={0.2}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Population by Age Group"
          type="pie"
          data={ageGroupData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Marital Status Distribution"
          type="pie"
          data={maritalStatusData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Voter Registration Status"
          type="pie"
          data={voterData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Gender Distribution"
          type="bar"
          data={[
            { name: 'Male', value: populationData.male },
            { name: 'Female', value: populationData.female },
          ]}
          xAxisKey="name"
          yAxisKey="value"
          series={[{ key: 'value', name: 'Population' }]}
        />
      </div>
    </div>
  );
} 