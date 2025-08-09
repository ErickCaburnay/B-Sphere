"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Key,
  Shield
} from 'lucide-react';
import AddAdminModal from './AddAdminModal';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/admins', { cache: 'no-store' });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to load admins');
      const normalized = (data.admins || []).map(a => ({
        id: a.id,
        name: `${a.firstName || ''} ${a.lastName || ''}`.trim(),
        email: a.email,
        role: a.role,
        status: 'Active',
        lastActive: a.updatedAt || a.createdAt || new Date().toISOString()
      }));
      setAdmins(normalized);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreated = (user) => {
    // After creating, refresh list to ensure server truth
    fetchAdmins();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Admin Management</h2>
          <p className="text-gray-500">Manage administrator accounts and permissions</p>
        </div>
        <Button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white shadow hover:from-green-700 hover:to-green-800" onClick={()=>setIsModalOpen(true)}>
          <Plus className="h-5 w-5" />
          Add Admin
        </Button>
      </div>

      <div className="grid gap-4">
        {loading && <div className="text-gray-500">Loading admins...</div>}
        {!loading && admins.length === 0 && (
          <div className="text-gray-500">No admins found.</div>
        )}
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

      <AddAdminModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onCreated={handleCreated} />
    </div>
  );
} 