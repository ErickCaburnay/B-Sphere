"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Cog6ToothIcon,
  BellIcon,
  CloudIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function SystemConfig() {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      lastBackup: '2024-03-15T00:00:00'
    },
    security: {
      twoFactorAuth: true,
      passwordExpiry: 90,
      sessionTimeout: 30
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      timezone: 'Asia/Manila'
    }
  });

  const configSections = [
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: BellIcon,
      description: 'Configure system notification preferences',
      items: [
        { label: 'Email Notifications', value: settings.notifications.emailNotifications },
        { label: 'SMS Notifications', value: settings.notifications.smsNotifications },
        { label: 'Push Notifications', value: settings.notifications.pushNotifications }
      ]
    },
    {
      id: 'backup',
      title: 'Backup & Recovery',
      icon: CloudIcon,
      description: 'Manage system backup settings',
      items: [
        { label: 'Auto Backup', value: settings.backup.autoBackup },
        { label: 'Backup Frequency', value: settings.backup.backupFrequency },
        { label: 'Last Backup', value: new Date(settings.backup.lastBackup).toLocaleString() }
      ]
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: ShieldCheckIcon,
      description: 'Configure system security options',
      items: [
        { label: 'Two-Factor Authentication', value: settings.security.twoFactorAuth },
        { label: 'Password Expiry (days)', value: settings.security.passwordExpiry },
        { label: 'Session Timeout (minutes)', value: settings.security.sessionTimeout }
      ]
    },
    {
      id: 'system',
      title: 'System Settings',
      icon: Cog6ToothIcon,
      description: 'Basic system configuration',
      items: [
        { label: 'Maintenance Mode', value: settings.system.maintenanceMode },
        { label: 'Debug Mode', value: settings.system.debugMode },
        { label: 'Timezone', value: settings.system.timezone }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">System Configuration</h2>
        <p className="text-gray-500">Manage core system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configSections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <section.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {section.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">
                      {typeof item.value === 'boolean' ? (
                        <span className={item.value ? 'text-green-600' : 'text-gray-500'}>
                          {item.value ? 'Enabled' : 'Disabled'}
                        </span>
                      ) : (
                        item.value
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4">
                Configure
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">System Status</h3>
              <p className="text-sm text-gray-500">Current system health and metrics</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <DocumentDuplicateIcon className="h-5 w-5" />
            View Logs
          </Button>
        </div>
      </Card>
    </div>
  );
} 