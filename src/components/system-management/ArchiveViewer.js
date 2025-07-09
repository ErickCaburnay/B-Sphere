"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  Folder, 
  FileText, 
  RefreshCw,
  Eye 
} from 'lucide-react';

export default function ArchiveViewer() {
  const [archiveType, setArchiveType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  
  const archives = [
    {
      id: 1,
      title: 'Resident Records 2023',
      type: 'Residents',
      date: '2023-12-31',
      size: '2.5 MB',
      items: 150
    },
    {
      id: 2,
      title: 'Official Documents 2023',
      type: 'Documents',
      date: '2023-12-31',
      size: '1.8 MB',
      items: 45
    },
    // Add more sample archives
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Archive Viewer</h2>
        <p className="text-gray-500">Access and manage archived system data</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={archiveType}
            onChange={(e) => setArchiveType(e.target.value)}
            className="w-full"
          >
            <option value="all">All Types</option>
            <option value="residents">Residents</option>
            <option value="documents">Documents</option>
            <option value="complaints">Complaints</option>
          </Select>

          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full"
          >
            <option value="all">All Time</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {archives.map((archive) => (
          <Card key={archive.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {archive.type === 'Residents' ? (
                    <Folder className="h-6 w-6 text-blue-600" />
                  ) : (
                    <FileText className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{archive.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{archive.type}</span>
                    <span>{archive.items} items</span>
                    <span>{archive.size}</span>
                    <span>Archived: {new Date(archive.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 