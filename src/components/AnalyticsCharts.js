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
  const [purposeTimeFilter, setPurposeTimeFilter] = useState('allTime');
  const [serviceTimeFilter, setServiceTimeFilter] = useState('allTime');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function to get filtered document data
  const getDocumentData = () => {
    const timeData = analyticsData.documents.timeData[documentTimeFilter];
    
    if (documentTypeFilter === 'all') {
      return {
        labels: ['Barangay Clearance', 'Certificate', 'Indigency', 'Business Permit', 'Barangay ID', 'Others'],
        data: [
          timeData.barangayClearance,
          timeData.certificate,
          timeData.indigency,
          timeData.businessPermit,
          timeData.id,
          timeData.others
        ],
        total: timeData.total
      };
    } else {
      const value = timeData[documentTypeFilter];
      const typeNames = {
        barangayClearance: 'Barangay Clearance',
        certificate: 'Certificate',
        indigency: 'Indigency',
        businessPermit: 'Business Permit',
        id: 'Barangay ID',
        others: 'Others'
      };
      return {
        labels: [typeNames[documentTypeFilter]],
        data: [value],
        total: value
      };
    }
  };

  // Helper function to get filtered complaint data
  const getComplaintData = () => {
    const timeData = analyticsData.complaints.timeData[complaintTimeFilter];
    
    if (complaintTypeFilter === 'all') {
      return {
        labels: ['Public Safety', 'Health & Sanitation', 'Noise Disturbance', 'Community & Social Issues', 'Others'],
        data: [
          timeData.publicSafety,
          timeData.healthSanitation,
          timeData.noiseDisturbance,
          timeData.communitySocial,
          timeData.others
        ],
        total: timeData.total
      };
    } else {
      const value = timeData[complaintTypeFilter];
      const typeNames = {
        publicSafety: 'Public Safety',
        healthSanitation: 'Health & Sanitation',
        noiseDisturbance: 'Noise Disturbance',
        communitySocial: 'Community & Social Issues',
        others: 'Others'
      };
      return {
        labels: [typeNames[complaintTypeFilter]],
        data: [value],
        total: value
      };
    }
  };

  // Helper function to get document purpose data
  const getPurposeData = () => {
    const timeData = analyticsData.documentPurpose.timeData[purposeTimeFilter];
    return {
      labels: ['Employment', 'Business', 'Travel', 'Loan', 'Scholarship', 'Others'],
      data: [
        timeData.employment,
        timeData.business,
        timeData.travel,
        timeData.loan,
        timeData.scholarship,
        timeData.others
      ],
      total: timeData.total
    };
  };

  // Helper function to get service request data
  const getServiceData = () => {
    const timeData = analyticsData.serviceRequests.timeData[serviceTimeFilter];
    return {
      labels: ['Medical Assistance', 'Financial Aid', 'Legal Aid', 'Emergency Response', 'Transport Service', 'Others'],
      data: [
        timeData.medicalAssistance,
        timeData.financialAid,
        timeData.legalAid,
        timeData.emergencyResponse,
        timeData.transportService,
        timeData.others
      ],
      total: timeData.total
    };
  };

  if (!isClient) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  }

  const documentData = getDocumentData();
  const complaintData = getComplaintData();
  const purposeData = getPurposeData();
  const serviceData = getServiceData();

  // Chart options
  const getChartOptions = (title, labels, colors) => ({
    chart: {
      type: 'donut',
      height: 300,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 100
        },
        dynamicAnimation: {
          enabled: true,
          speed: 500
        }
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true
    },
    labels: labels,
    colors: colors,
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151'
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151'
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + '%';
      },
      style: {
        fontSize: '12px',
        fontWeight: '600'
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toLocaleString();
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  });

  const getBarChartOptions = (title, categories) => ({
    chart: {
      type: 'bar',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 500
        }
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true
    },
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151'
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return val.toLocaleString();
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    colors: ['#3B82F6'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toLocaleString();
      },
      style: {
        fontSize: '10px',
        fontWeight: '600'
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 3
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toLocaleString();
        }
      }
    }
  });

  const getLineChartOptions = (title) => ({
    chart: {
      type: 'line',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 500
        }
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true
    },
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151'
      }
    },
    xaxis: {
      categories: analyticsData.documents.monthlyTrend.map(item => item.month),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return val.toLocaleString();
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    colors: ['#10B981'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      fillOpacity: 1,
      strokeOpacity: 1
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 3
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toLocaleString();
        }
      }
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Document Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Document Overview</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={documentTimeFilter}
              onChange={(e) => setDocumentTimeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="allTime">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="barangayClearance">Clearance</option>
              <option value="certificate">Certificate</option>
              <option value="indigency">Indigency</option>
              <option value="id">ID</option>
              <option value="businessPermit">Business Permit</option>
            </select>
          </div>
        </div>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-blue-600">{documentData.total.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Documents</div>
        </div>
        <Chart
          key={`document-${documentTimeFilter}-${documentTypeFilter}`}
          options={{
            chart: {
              type: 'radialBar',
              height: 300,
              animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                  enabled: true,
                  delay: 150
                },
                dynamicAnimation: {
                  enabled: true,
                  speed: 500
                }
              },
              fontFamily: 'Inter, sans-serif'
            },
            plotOptions: {
              radialBar: {
                offsetY: -10,
                startAngle: -135,
                endAngle: 225,
                hollow: {
                  margin: 0,
                  size: '45%',
                  background: 'transparent'
                },
                track: {
                  background: '#F3F4F6',
                  strokeWidth: '97%',
                  margin: 0,
                  dropShadow: {
                    enabled: true,
                    top: -3,
                    left: 0,
                    blur: 4,
                    opacity: 0.35
                  }
                },
                dataLabels: {
                  name: {
                    fontSize: '14px',
                    color: '#374151',
                    offsetY: -10
                  },
                  value: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#1F2937',
                    offsetY: 16,
                    formatter: function (val) {
                      return parseInt(val) + "%"
                    }
                  }
                }
              }
            },
            colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'],
            labels: documentData.labels,
            title: {
              text: 'Document Distribution',
              align: 'center',
              style: {
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151'
              }
            },
            legend: {
              show: true,
              position: 'bottom',
              offsetY: 0,
              height: 40,
              fontSize: '12px',
              fontWeight: 500,
              labels: {
                colors: '#6B7280',
                useSeriesColors: false
              },
              markers: {
                width: 12,
                height: 12,
                strokeWidth: 0,
                strokeColor: '#fff',
                fillColors: undefined,
                radius: 12,
                customHTML: undefined,
                onClick: undefined,
                offsetX: 0,
                offsetY: 0
              },
              itemMargin: {
                horizontal: 5,
                vertical: 0
              }
            },
            responsive: [{
              breakpoint: 480,
              options: {
                legend: {
                  show: false
                }
              }
            }]
          }}
          series={documentData.data.map(value => 
            Math.round((value / documentData.total) * 100)
          )}
          type="radialBar"
          height={300}
        />
      </div>

      {/* Complaints Overview Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Complaints Overview</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={complaintTimeFilter}
              onChange={(e) => setComplaintTimeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="allTime">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <select
              value={complaintTypeFilter}
              onChange={(e) => setComplaintTypeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="publicSafety">Public Safety</option>
              <option value="healthSanitation">Health & Sanitation</option>
              <option value="noiseDisturbance">Noise Disturbance</option>
              <option value="communitySocial">Community & Social Issues</option>
            </select>
          </div>
        </div>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-red-600">{complaintData.total.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Complaints</div>
        </div>
        <Chart
          key={`complaint-${complaintTimeFilter}-${complaintTypeFilter}`}
          options={{
            chart: {
              type: 'radialBar',
              height: 300,
              animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                  enabled: true,
                  delay: 100
                },
                dynamicAnimation: {
                  enabled: true,
                  speed: 500
                }
              },
              fontFamily: 'Inter, sans-serif'
            },
            plotOptions: {
              radialBar: {
                offsetY: 0,
                startAngle: 0,
                endAngle: 360,
                hollow: {
                  margin: 15,
                  size: '50%',
                  background: 'transparent',
                  image: undefined,
                  position: 'front',
                  dropShadow: {
                    enabled: true,
                    top: 3,
                    left: 0,
                    blur: 4,
                    opacity: 0.24
                  }
                },
                track: {
                  background: '#F9FAFB',
                  strokeWidth: '67%',
                  margin: 0,
                  dropShadow: {
                    enabled: true,
                    top: -3,
                    left: 0,
                    blur: 4,
                    opacity: 0.35
                  }
                },
                dataLabels: {
                  name: {
                    fontSize: '16px',
                    color: '#374151',
                    offsetY: -10,
                    fontWeight: 600
                  },
                  value: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#DC2626',
                    offsetY: 16,
                    formatter: function (val) {
                      return parseInt(val) + "%"
                    }
                  },
                  total: {
                    show: true,
                    showAlways: false,
                    label: 'Total',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#9CA3AF',
                    formatter: function (w) {
                      return complaintData.total.toLocaleString()
                    }
                  }
                }
              }
            },
            colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'],
            labels: complaintData.labels,
            title: {
              text: 'Complaint Categories',
              align: 'center',
              style: {
                fontSize: '16px',
                fontWeight: 600,
                color: '#374151'
              }
            },
            legend: {
              show: true,
              position: 'bottom',
              offsetY: 10,
              height: 40,
              fontSize: '12px',
              fontWeight: 500,
              labels: {
                colors: '#6B7280',
                useSeriesColors: true
              },
              markers: {
                width: 10,
                height: 10,
                strokeWidth: 2,
                strokeColor: '#fff',
                fillColors: undefined,
                radius: 2,
                customHTML: undefined,
                onClick: undefined,
                offsetX: 0,
                offsetY: 0
              },
              itemMargin: {
                horizontal: 8,
                vertical: 2
              }
            },
            responsive: [{
              breakpoint: 480,
              options: {
                legend: {
                  show: false
                }
              }
            }]
          }}
          series={complaintData.data.map(value => 
            Math.round((value / complaintData.total) * 100)
          )}
          type="radialBar"
          height={300}
        />
      </div>

      {/* Document Purpose Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Document Purpose</h3>
          <select
            value={purposeTimeFilter}
            onChange={(e) => setPurposeTimeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="allTime">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
        <Chart
          key={`purpose-${purposeTimeFilter}`}
          options={getBarChartOptions('Purpose Distribution', purposeData.labels)}
          series={[{ name: 'Documents', data: purposeData.data }]}
          type="bar"
          height={350}
        />
      </div>

      {/* Service Requests Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Service Requests</h3>
          <select
            value={serviceTimeFilter}
            onChange={(e) => setServiceTimeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="allTime">All Time</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>
        <Chart
          key={`service-${serviceTimeFilter}`}
          options={getChartOptions('Service Types', serviceData.labels, ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#6B7280'])}
          series={serviceData.data}
          type="donut"
          height={300}
        />
      </div>

      {/* Document Trends Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Document Trends (Monthly)</h3>
          <select
            value={documentTypeFilter}
            onChange={(e) => setDocumentTypeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Documents</option>
            <option value="barangayClearance">Clearance</option>
            <option value="certificate">Certificate</option>
            <option value="indigency">Indigency</option>
            <option value="id">ID</option>
            <option value="businessPermit">Business Permit</option>
          </select>
        </div>
        <Chart
          key={`trends-${documentTypeFilter}`}
          options={getLineChartOptions('Monthly Document Trends')}
          series={[{ 
            name: documentTypeFilter === 'all' ? 'Total Documents' : documentTypeFilter.charAt(0).toUpperCase() + documentTypeFilter.slice(1),
            data: analyticsData.documents.monthlyTrend.map(item => 
              documentTypeFilter === 'all' ? item.total : 
              documentTypeFilter === 'barangayClearance' ? item.clearance :
              documentTypeFilter === 'certificate' ? item.certificate :
              documentTypeFilter === 'indigency' ? item.indigency :
              documentTypeFilter === 'businessPermit' ? item.businessPermit :
              documentTypeFilter === 'id' ? item.id : item.others
            )
          }]}
          type="line"
          height={350}
        />
      </div>

      {/* User Activity Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activity</h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analyticsData.userActivity.activeToday}</div>
            <div className="text-sm text-gray-500">Active Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.userActivity.activeThisWeek}</div>
            <div className="text-sm text-gray-500">Active This Week</div>
          </div>
        </div>
        <Chart
          key="user-activity"
          options={getChartOptions('User Roles', analyticsData.userActivity.chartData.roles.labels, analyticsData.userActivity.chartData.roles.colors)}
          series={analyticsData.userActivity.chartData.roles.data}
          type="donut"
          height={250}
        />
      </div>
    </div>
  );
};

export default AnalyticsCharts; 