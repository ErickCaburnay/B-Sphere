"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye 
} from 'lucide-react';

export default function AnnouncementsManagement() {
  const [announcements, setAnnouncements] = useState([
    // Sample data - replace with actual data from your backend
    {
      id: 1,
      title: 'COVID-19 Vaccination Drive',
      content: 'Join us for the community vaccination drive...',
      date: '2024-03-15',
      status: 'Published',
      type: 'News'
    },
    // Add more sample announcements
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Announcements & News</h2>
          <p className="text-gray-500">Manage community announcements and news updates</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New
        </Button>
      </div>

      <div className="grid gap-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    announcement.status === 'Published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {announcement.status}
                  </span>
                </div>
                <p className="text-gray-600 line-clamp-2">{announcement.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{announcement.type}</span>
                  <span>Posted: {new Date(announcement.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 