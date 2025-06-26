'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Download, Printer, Filter, RefreshCw, Settings } from 'lucide-react';
import { ResidentReports } from '@/components/reports/ResidentReports';
import { DocumentIssuanceReports } from '@/components/reports/DocumentIssuanceReports';
import { ComplaintReports } from '@/components/reports/ComplaintReports';
import { IncidentReports } from '@/components/reports/IncidentReports';
import { AssistanceAidReports } from '@/components/reports/AssistanceAidReports';
import { ServiceRequestReports } from '@/components/reports/ServiceRequestReports';
import { BarangayProjectReports } from '@/components/reports/BarangayProjectReports';
import { UserActivityReports } from '@/components/reports/UserActivityReports';
import DashboardPageContainer from '@/components/DashboardPageContainer';
import * as Tooltip from '@radix-ui/react-tooltip';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('residents');

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report...');
  };

  const handlePrint = () => {
    // Implement print functionality
    window.print();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <DashboardPageContainer 
      heading="Reports Module"
      subtitle="Generate comprehensive reports and analytics for data-driven decisions"
    >
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 text-gray-900 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <div className="w-auto">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              compact
            />
          </div>
        </div>
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Filter"
          // onClick={handleFilterToggle}
        >
          <Filter className="h-5 w-5" />
        </button>
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
          // onClick={handleSettings}
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Export"
          onClick={handleExport}
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Tooltip.Provider>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="flex flex-wrap justify-center gap-1 p-1 w-full">
              {reportCategories.map((category) => (
                <Tooltip.Root key={category.id} delayDuration={150}>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => setActiveTab(category.id)}
                      className={`font-medium px-6 py-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
                        activeTab === category.id
                          ? 'text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <span className="relative z-10">{category.title}</span>
                      {activeTab === category.id && (
                        <motion.div
                          layoutId="active-tab-bg"
                          transition={{ 
                            type: "spring", 
                            duration: 0.5,
                            bounce: 0.15,
                            stiffness: 400,
                            damping: 40
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-lg"
                        />
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
          {reportCategories.map((category) => (
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
                    {category.component ? (
                      <category.component />
                    ) : (
                      <div className="text-center py-12">
                        <motion.div 
                          className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            delay: 0.6,
                            type: "spring",
                            duration: 0.6,
                            bounce: 0.4
                          }}
                        >
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </motion.div>
                        <motion.h3 
                          className="text-lg font-semibold text-gray-800 mb-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.4 }}
                        >
                          Report Coming Soon
                        </motion.h3>
                        <motion.p 
                          className="text-gray-600 max-w-md mx-auto"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.4 }}
                        >
                          This report component is currently under development. Check back soon for detailed analytics and insights.
                        </motion.p>
                      </div>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
                         </motion.div>
           )
         ))}
        </AnimatePresence>
        </Tabs>
    </DashboardPageContainer>
  );
} 