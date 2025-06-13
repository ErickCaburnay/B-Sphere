'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { ResidentReports } from '@/components/reports/ResidentReports';

// Report Categories
const reportCategories = [
  {
    id: 'residents',
    title: 'Resident Reports',
    description: 'Population demographics and statistics',
    component: ResidentReports
  },
  {
    id: 'documents',
    title: 'Document Issuance',
    description: 'Summary of issued documents and certificates'
  },
  {
    id: 'complaints',
    title: 'Complaint Reports',
    description: 'Complaint statistics and resolution tracking'
  },
  {
    id: 'incidents',
    title: 'Incident Reports',
    description: 'Recorded incidents and their analysis'
  },
  {
    id: 'assistance',
    title: 'Assistance & Aid',
    description: 'Distribution of aid and assistance programs'
  },
  {
    id: 'services',
    title: 'Service Requests',
    description: 'Service request tracking and analysis'
  },
  {
    id: 'projects',
    title: 'Barangay Projects',
    description: 'Project status and budget tracking'
  },
  {
    id: 'activity',
    title: 'User Activity',
    description: 'Admin and staff activity logs'
  }
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report...');
  };

  const handlePrint = () => {
    // Implement print functionality
    window.print();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports Module</h1>
        <div className="flex gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="residents" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-4">
          {reportCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex flex-col items-start p-4"
            >
              <span className="font-semibold">{category.title}</span>
              <span className="text-sm text-muted-foreground">
                {category.description}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {reportCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {category.component ? (
                  <category.component />
                ) : (
                  <div className="text-center text-muted-foreground">
                    Report component coming soon...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 