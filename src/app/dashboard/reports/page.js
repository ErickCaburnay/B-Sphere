'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { ResidentReports } from '@/components/reports/ResidentReports';
import { DocumentIssuanceReports } from '@/components/reports/DocumentIssuanceReports';
import { ComplaintReports } from '@/components/reports/ComplaintReports';
import { IncidentReports } from '@/components/reports/IncidentReports';
import { AssistanceAidReports } from '@/components/reports/AssistanceAidReports';
import { ServiceRequestReports } from '@/components/reports/ServiceRequestReports';
import { BarangayProjectReports } from '@/components/reports/BarangayProjectReports';
import { UserActivityReports } from '@/components/reports/UserActivityReports';

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
    description: 'Summary of issued documents and certificates',
    component: DocumentIssuanceReports
  },
  {
    id: 'complaints',
    title: 'Complaint Reports',
    description: 'Complaint statistics and resolution tracking',
    component: ComplaintReports
  },
  {
    id: 'incidents',
    title: 'Incident Reports',
    description: 'Recorded incidents and their analysis',
    component: IncidentReports
  },
  {
    id: 'assistance',
    title: 'Assistance & Aid',
    description: 'Distribution of aid and assistance programs',
    component: AssistanceAidReports
  },
  {
    id: 'services',
    title: 'Service Request Reports',
    description: 'Requests for ID replacements, updates in personal info, etc.',
    component: ServiceRequestReports
  },
  {
    id: 'projects',
    title: 'Barangay Project Reports',
    description: 'Ongoing and completed projects, budget, and timeline.',
    component: BarangayProjectReports
  },
  {
    id: 'activity',
    title: 'User Activity Reports (Admin)',
    description: 'Login history, actions taken, and request handling logs.',
    component: UserActivityReports
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
        <TabsList className="flex flex-wrap justify-start gap-2 p-1 w-full">
          {reportCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex flex-col items-center p-3 text-center flex-grow min-w-[120px] max-w-[280px] h-auto whitespace-normal break-words"
            >
              <span className="font-semibold block w-full">{category.title}</span>
              <span className="text-sm text-muted-foreground block w-full">{category.description}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {reportCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto">
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