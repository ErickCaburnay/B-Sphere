"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function OfficialsManagement() {
  const [officials, setOfficials] = useState([
    // Sample data - replace with actual data from your backend
    { id: 1, name: 'Juan Dela Cruz', position: 'Barangay Captain', term: '2022-2025', imageUrl: '/images/kap.png' },
    // Add more sample officials
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Barangay Officials</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Official
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {officials.map((official) => (
          <Card key={official.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden">
                <img 
                  src={official.imageUrl} 
                  alt={official.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{official.name}</h3>
                <p className="text-gray-600">{official.position}</p>
                <p className="text-sm text-gray-500">Term: {official.term}</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 