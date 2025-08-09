"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';
import DashboardPageContainer from '@/components/DashboardPageContainer';
import * as Tooltip from '@radix-ui/react-tooltip';
import OfficialsManagement from '@/components/system-management/OfficialsManagement';
import AnnouncementsManagement from '@/components/system-management/AnnouncementsManagement';
import ArchiveViewer from '@/components/system-management/ArchiveViewer';
import AdminManagement from '@/components/system-management/AdminManagement';
import UserManagement from '@/components/system-management/UserManagement';
import SystemConfig from '@/components/system-management/SystemConfig';

// System Management Categories
const systemCategories = [
  {
    id: 'officials',
    title: 'Officials',
    description: 'Manage barangay officials information and positions',
    component: OfficialsManagement
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Manage news, updates, and announcements',
    component: AnnouncementsManagement
  },
  {
    id: 'archive',
    title: 'Archive',
    description: 'Access and manage archived system data',
    component: ArchiveViewer
  },
  {
    id: 'admins',
    title: 'Admins',
    description: 'Manage administrator accounts and permissions',
    component: AdminManagement
  },
  {
    id: 'users',
    title: 'Users',
    description: 'Manage resident user accounts and access',
    component: UserManagement
  },
  {
    id: 'config',
    title: 'Settings',
    description: 'Configure system settings and preferences',
    component: SystemConfig
  }
];

export default function SystemManagementPage() {
  const [activeTab, setActiveTab] = useState('officials');

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <DashboardPageContainer 
      heading="System Management"
      subtitle="Manage system settings, content, and user access"
    >
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search settings..."
              className="pl-10 pr-4 py-2 border border-gray-300 text-gray-900 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Refresh"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <Tooltip.Provider>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <div className="flex flex-wrap justify-center gap-1 p-1 w-full">
            {systemCategories.map((category) => (
              <Tooltip.Root key={category.id} delayDuration={150}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setActiveTab(category.id)}
                    className={`font-medium px-6 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
                      activeTab === category.id
                        ? 'text-green-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <span className="relative z-10">{category.title}</span>
                    {activeTab === category.id && (
                      <>
                        <span className="absolute left-4 right-4 bottom-0 h-0.5 bg-gradient-to-r from-green-600 to-green-700 rounded-full" />
                      </>
                    )}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="bottom" className="z-50 max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-xl border border-gray-700">
                  <div className="font-medium mb-1">{category.title}</div>
                  <div className="text-gray-300 text-xs">{category.description}</div>
                </Tooltip.Content>
              </Tooltip.Root>
            ))}
          </div>
        </div>
      </Tooltip.Provider>

      <AnimatePresence mode="wait">
        {systemCategories.map((category) => (
          activeTab === category.id && (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                type: "spring",
                duration: 0.4,
                bounce: 0.1,
                stiffness: 300,
                damping: 30
              }}
              className="mt-6"
            >
              <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <CardTitle className="text-xl font-bold mb-2 text-center">{category.title}</CardTitle>
                      <p className="text-green-100 text-sm opacity-90">{category.description}</p>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto p-6">
                  <motion.div 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <category.component />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </DashboardPageContainer>
  );
} 