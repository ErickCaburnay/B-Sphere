"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Key,
  Shield
} from 'lucide-react';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Super Admin',
      status: 'Active',
      lastActive: '2024-03-15T10:30:00'
    },
    {
      id: 2,
      name: 'Sub Admin',
      email: 'subadmin@example.com',
      role: 'Content Manager',
      status: 'Active',
      lastActive: '2024-03-15T09:15:00'
    }
    // Add more sample admins
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Admin Management</h2>
          <p className="text-gray-500">Manage administrator accounts and permissions</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Admin
        </Button>
      </div>

      <div className="grid gap-4">
        {admins.map((admin) => (
          <Card key={admin.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{admin.name}</h3>
                  <p className="text-gray-600">{admin.email}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        admin.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      {admin.status}
                    </span>
                    <span>{admin.role}</span>
                    <span>Last active: {new Date(admin.lastActive).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Key className="h-4 w-4" />
                  Permissions
                </Button>
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
          </Card>
        ))}
      </div>
    </div>
  );
} 