"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  User, 
  Pencil, 
  Ban,
  RefreshCw,
  CheckCircle,
  XCircle 
} from 'lucide-react';

export default function UserManagement() {
  const [filter, setFilter] = useState('all');
  
  const users = [
    {
      id: 1,
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      status: 'Active',
      verified: true,
      registeredDate: '2024-02-15',
      lastLogin: '2024-03-15T10:30:00'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com',
      status: 'Pending',
      verified: false,
      registeredDate: '2024-03-10',
      lastLogin: null
    }
    // Add more sample users
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-gray-500">Manage resident user accounts and access</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-full">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        user.status === 'Active' ? 'bg-green-500' : 
                        user.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      {user.status}
                    </span>
                    <span className="flex items-center gap-1">
                      {user.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      {user.verified ? 'Verified' : 'Unverified'}
                    </span>
                    <span>Registered: {new Date(user.registeredDate).toLocaleDateString()}</span>
                    {user.lastLogin && (
                      <span>Last login: {new Date(user.lastLogin).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                {user.status === 'Active' ? (
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                    <Ban className="h-4 w-4" />
                    Suspend
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex items-center gap-1 text-green-600 hover:text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 