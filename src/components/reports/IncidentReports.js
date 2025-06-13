'use client';

import { useState } from 'react';
import { ReportCard } from './ReportCard';
import { ReportChart } from './ReportChart';
import { AlertTriangle, MapPin, Calendar, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function IncidentReports() {
  // Mock data - replace with actual data from your backend
  const incidentSummary = {
    totalRecorded: 180,
    fire: 30,
    theft: 70,
    disaster: 20,
    others: 60,
  };

  const incidentTypesData = [
    { name: 'Theft', value: incidentSummary.theft },
    { name: 'Fire', value: incidentSummary.fire },
    { name: 'Disaster', value: incidentSummary.disaster },
    { name: 'Others', value: incidentSummary.others },
  ];

  const monthlyIncidents = [
    { month: 'Jan', incidents: 25 },
    { month: 'Feb', incidents: 30 },
    { month: 'Mar', incidents: 40 },
    { month: 'Apr', incidents: 45 },
    { month: 'May', incidents: 50 },
  ];

  const recentIncidents = [
    { id: 'INC001', type: 'Theft', location: 'Zone 1, Main St.', date: '2025-05-25', time: '14:30' },
    { id: 'INC002', type: 'Fire', location: 'Zone 3, Near Market', date: '2025-05-24', time: '02:00' },
    { id: 'INC003', type: 'Disaster', location: 'Riverside Area', date: '2025-05-23', time: '08:00' },
    { id: 'INC004', type: 'Theft', location: 'Zone 2, Elm St.', date: '2025-05-22', time: '19:15' },
    { id: 'INC005', type: 'Others', location: 'Barangay Hall', date: '2025-05-21', time: '10:00' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Total Incidents Recorded"
          value={incidentSummary.totalRecorded}
          icon={AlertTriangle}
          trend={-0.8}
        />
        <ReportCard
          title="Fire Incidents"
          value={incidentSummary.fire}
          icon={AlertTriangle}
          trend={0.5}
        />
        <ReportCard
          title="Theft Incidents"
          value={incidentSummary.theft}
          icon={AlertTriangle}
          trend={-1.5}
        />
        <ReportCard
          title="Disaster Incidents"
          value={incidentSummary.disaster}
          icon={AlertTriangle}
          trend={0.0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart
          title="Incident Types Distribution"
          type="pie"
          data={incidentTypesData}
          xAxisKey="name"
          yAxisKey="value"
        />
        <ReportChart
          title="Monthly Incident Trends"
          type="line"
          data={monthlyIncidents}
          xAxisKey="month"
          series={[{ key: 'incidents', name: 'Incidents' }]}
        />
      </div>

      {/* Detailed Table */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Incidents</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Incident ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentIncidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.id}</TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell>{incident.location}</TableCell>
                <TableCell>{incident.date}</TableCell>
                <TableCell>{incident.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 