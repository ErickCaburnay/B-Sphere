'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { analyticsData } from '@/lib/mockData';

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const AnalyticsCharts = () => {
  const [isClient, setIsClient] = useState(false);
  const [documentTimeFilter, setDocumentTimeFilter] = useState('allTime');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [complaintTimeFilter, setComplaintTimeFilter] = useState('allTime');
  const [complaintTypeFilter, setComplaintTypeFilter] = useState('all');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get document data based on filters
  const getDocumentData = () => {
    const baseData = analyticsData.documents.timeData[documentTimeFilter] || analyticsData.documents.timeData.allTime;
    
    if (documentTypeFilter === 'all') {
      return {
        total: baseData.total,
        labels: ['Clearance', 'Certificate', 'Indigency', 'Business Permit', 'ID', 'Others'],
        data: [
          baseData.barangayClearance,
          baseData.certificate,
          baseData.indigency,
          baseData.businessPermit,
          baseData.id,
          baseData.others
        ]
      };
    } else {
      const value = baseData[documentTypeFilter] || 0;
      return {
        total: value,
        labels: [documentTypeFilter],
        data: [value]
      };
    }
  };

  // Get complaint data based on filters
  const getComplaintData = () => {
    const baseData = analyticsData.complaints.timeData[complaintTimeFilter] || analyticsData.complaints.timeData.allTime;
    
    if (complaintTypeFilter === 'all') {
      return {
        total: baseData.total,
        labels: ['Public Safety', 'Health & Sanitation', 'Noise Disturbance', 'Community & Social', 'Others'],
        data: [
          baseData.publicSafety,
          baseData.healthSanitation,
          baseData.noiseDisturbance,
          baseData.communitySocial,
          baseData.others
        ]
      };
    } else {
      const value = baseData[complaintTypeFilter] || 0;
      return {
        total: value,
        labels: [complaintTypeFilter],
        data: [value]
      };
    }
  };

  const documentData = getDocumentData();
  const complaintData = getComplaintData();

  if (!isClient) {
    return <div className="animate-pulse">Loading charts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Control Hub */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md border border-purple-100 p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800">📊 Analytics Section</h3>
        </div>
      </div>

      {/* Charts Grid - Updated according to image specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Document Overview - Bar Chart (Image 2 - top center or lower line chart) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Document Overview</h3>
                  <p className="text-sm text-gray-600">Bar Chart - counts per document type</p>
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="flex gap-2">
                <select
                  value={documentTimeFilter}
                  onChange={(e) => setDocumentTimeFilter(e.target.value)}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="allTime">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                </select>
                <select
                  value={documentTypeFilter}
                  onChange={(e) => setDocumentTypeFilter(e.target.value)}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="barangayClearance">Clearance</option>
                  <option value="certificate">Certificate</option>
                  <option value="indigency">Indigency</option>
                  <option value="businessPermit">Business Permit</option>
                  <option value="id">ID</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {documentData.total.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-gray-600">Total Documents</div>
            </div>
            
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  height: 300,
                  animations: { enabled: true, easing: 'easeinout', speed: 800 },
                  fontFamily: 'Inter, sans-serif',
                  toolbar: { show: false }
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '70%',
                    borderRadius: 4
                  }
                },
                dataLabels: {
                  enabled: true,
                  style: { fontSize: '10px', fontWeight: 'bold' },
                  formatter: function (val) { return val.toLocaleString(); }
                },
                colors: ['#3B82F6'],
                xaxis: {
                  categories: documentData.labels,
                  labels: { style: { fontSize: '10px' }, rotate: -45 }
                },
                yaxis: {
                  labels: { 
                    style: { fontSize: '10px' },
                    formatter: function (val) { return val.toLocaleString(); }
                  }
                },
                tooltip: {
                  y: { formatter: function (val) { return val.toLocaleString() + " documents"; } }
                }
              }}
              series={[{ name: 'Documents', data: documentData.data }]}
              type="bar"
              height={300}
            />
          </div>
        </div>

        {/* Complaints Overview - Line Chart (Image 1 - top middle or middle-right bars) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 14c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Complaints Overview</h3>
                  <p className="text-sm text-gray-600">Line Chart - trend over time</p>
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="flex gap-2">
                <select
                  value={complaintTimeFilter}
                  onChange={(e) => setComplaintTimeFilter(e.target.value)}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="allTime">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                </select>
                <select
                  value={complaintTypeFilter}
                  onChange={(e) => setComplaintTypeFilter(e.target.value)}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Types</option>
                  <option value="publicSafety">Public Safety</option>
                  <option value="healthSanitation">Health & Sanitation</option>
                  <option value="noiseDisturbance">Noise</option>
                  <option value="communitySocial">Community</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {complaintData.total.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-gray-600">Total Complaints</div>
            </div>
            
            <Chart
              options={{
                chart: {
                  type: 'line',
                  height: 300,
                  animations: { enabled: true, easing: 'easeinout', speed: 800 },
                  fontFamily: 'Inter, sans-serif',
                  toolbar: { show: false }
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3 },
                colors: ['#EF4444'],
                xaxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  labels: { style: { fontSize: '10px' } }
                },
                yaxis: {
                  labels: { 
                    style: { fontSize: '10px' },
                    formatter: function (val) { return val.toFixed(0); }
                  }
                },
                tooltip: {
                  y: { formatter: function (val) { return val + " complaints"; } }
                }
              }}
              series={[{ name: 'Complaints', data: [15, 22, 18, 28, 35, Math.floor(complaintData.total/6)] }]}
              type="line"
              height={300}
            />
          </div>
        </div>

        {/* User Activity - Area Chart (Image 1 - waveform or calendar heatmap style) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">User Activity</h3>
                <p className="text-sm text-gray-600">Area Chart - logins over time or Heatmap</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                1,247
              </div>
              <div className="text-sm font-medium text-gray-600">Active Users</div>
            </div>
            
            <Chart
              options={{
                chart: {
                  type: 'area',
                  height: 300,
                  animations: { enabled: true, easing: 'easeinout', speed: 800 },
                  fontFamily: 'Inter, sans-serif',
                  toolbar: { show: false }
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                fill: {
                  type: 'gradient',
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100]
                  }
                },
                colors: ['#10B981'],
                xaxis: {
                  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  labels: { style: { fontSize: '10px' } }
                },
                yaxis: {
                  labels: { 
                    style: { fontSize: '10px' },
                    formatter: function (val) { return val.toFixed(0); }
                  }
                },
                tooltip: {
                  y: { formatter: function (val) { return val + " users"; } }
                }
              }}
              series={[{ name: 'Active Users', data: [120, 145, 167, 189, 203, 178, 156] }]}
              type="area"
              height={300}
            />
          </div>
        </div>

      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Export Analytics Report</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsCharts;
