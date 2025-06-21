"use client";

import { useState } from 'react';
import { BarChart, PieChart, FileText, Download, Printer } from 'lucide-react';

export function Reports({ residents }) {
  const [reportType, setReportType] = useState('demographics');
  const [reportData, setReportData] = useState(null);

  const generateReport = () => {
    let data = {};
    switch (reportType) {
      case 'demographics':
        data = generateDemographicsReport(residents);
        break;
      case 'voter-status':
        data = generateVoterStatusReport(residents);
        break;
      case 'program-beneficiaries':
        data = generateProgramBeneficiariesReport(residents);
        break;
      case 'household-distribution':
        data = generateHouseholdDistributionReport(residents);
        break;
      default:
        break;
    }
    setReportData(data);
  };

  const generateDemographicsReport = (residentsData) => {
    const genderDistribution = { Male: 0, Female: 0, Other: 0 };
    const ageGroups = { '0-17': 0, '18-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
    const civilStatus = { Single: 0, Married: 0, Widowed: 0, Separated: 0, Other: 0 };
    const educationalAttainment = {
      'No Formal Education': 0,
      'Elementary': 0,
      'High School': 0,
      'Vocational': 0,
      'College': 0,
      'Post Graduate': 0,
    };

    residentsData.forEach(resident => {
      if (resident.gender) genderDistribution[resident.gender] = (genderDistribution[resident.gender] || 0) + 1;
      
      const age = calculateAge(resident.birthdate);
      if (age >= 0 && age <= 17) ageGroups['0-17']++;
      else if (age >= 18 && age <= 30) ageGroups['18-30']++;
      else if (age >= 31 && age <= 45) ageGroups['31-45']++;
      else if (age >= 46 && age <= 60) ageGroups['46-60']++;
      else if (age > 60) ageGroups['60+']++;

      if (resident.maritalStatus) civilStatus[resident.maritalStatus] = (civilStatus[resident.maritalStatus] || 0) + 1;
      if (resident.educationalAttainment && educationalAttainment[resident.educationalAttainment] !== undefined) {
        educationalAttainment[resident.educationalAttainment]++;
      }
    });

    return {
      title: 'Demographics Report',
      sections: [
        { title: 'Gender Distribution', type: 'pie', data: genderDistribution },
        { title: 'Age Group Distribution', type: 'bar', data: ageGroups },
        { title: 'Civil Status Distribution', type: 'pie', data: civilStatus },
        { title: 'Educational Attainment', type: 'bar', data: educationalAttainment },
      ]
    };
  };

  const generateVoterStatusReport = (residentsData) => {
    const voterStatus = { Registered: 0, 'Not Registered': 0 };
    residentsData.forEach(resident => {
      if (resident.isVoter) voterStatus.Registered++;
      else voterStatus['Not Registered']++;
    });
    return {
      title: 'Voter Status Report',
      sections: [
        { title: 'Voter Registration Status', type: 'pie', data: voterStatus },
      ]
    };
  };

  const generateProgramBeneficiariesReport = (residentsData) => {
    const programs = { TUPAD: 0, PWD: 0, '4Ps': 0, 'Solo Parent': 0 };
    residentsData.forEach(resident => {
      if (resident.isTupad) programs.TUPAD++;
      if (resident.isPwd) programs.PWD++;
      if (resident.is4Ps) programs['4Ps']++;
      if (resident.isSoloParent) programs['Solo Parent']++;
    });
    return {
      title: 'Special Programs Beneficiaries Report',
      sections: [
        { title: 'Beneficiaries Count', type: 'bar', data: programs },
      ]
    };
  };

  const generateHouseholdDistributionReport = (residentsData) => {
    const householdSizes = {};
    const householdHeads = {};

    // This requires a proper household structure in your data
    // For now, let's assume `residents` can be grouped by a `householdId`
    const households = residentsData.reduce((acc, resident) => {
      if (resident.householdId) {
        if (!acc[resident.householdId]) {
          acc[resident.householdId] = [];
        }
        acc[resident.householdId].push(resident);
      }
      return acc;
    }, {});

    Object.values(households).forEach(members => {
      const size = members.length;
      householdSizes[size] = (householdSizes[size] || 0) + 1;
      const head = members.find(m => m.isHouseholdHead); // Assuming a flag for household head
      if (head) {
        const headName = `${head.firstName} ${head.lastName}`;
        householdHeads[headName] = (householdHeads[headName] || 0) + 1;
      }
    });

    return {
      title: 'Household Distribution Report',
      sections: [
        { title: 'Household Size Distribution', type: 'bar', data: householdSizes },
        { title: 'Household Heads', type: 'list', data: Object.keys(householdHeads) } // List of heads
      ]
    };
  };

  const calculateAge = (birthdate) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between border border-gray-200">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass || 'bg-blue-100 text-blue-600'}`}>
        {icon}
      </div>
    </div>
  );

  const BarChartDisplay = ({ data }) => {
    const labels = Object.keys(data);
    const values = Object.values(data);
    const maxVal = Math.max(...values, 0);

    if (labels.length === 0) return <p className="text-center text-gray-500">No data for this chart.</p>;

    return (
      <div className="space-y-2">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-sm text-gray-700 w-24 flex-shrink-0">{label}:</span>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${(values[i] / maxVal) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-700">{values[i]}</span>
          </div>
        ))}
      </div>
    );
  };

  const PieChartDisplay = ({ data }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) return <p className="text-center text-gray-500">No data for this chart.</p>;

    let startAngle = 0;
    const colors = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4', '#8BC34A', '#FFEB3B', '#E91E63'];

    return (
      <div className="flex flex-col items-center">
        <div className="w-48 h-48 relative">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {Object.entries(data).map(([label, value], i) => {
              const percentage = total > 0 ? (value / total) * 360 : 0;
              const largeArcFlag = percentage > 180 ? 1 : 0;
              const endAngle = startAngle + percentage;

              const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
              const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
              const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
              const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

              const d = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              startAngle = endAngle;
              return <path key={label} d={d} fill={colors[i % colors.length]} />;
            })}
          </svg>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {Object.entries(data).map(([label, value], i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
              <span>{label} ({value}) - {total > 0 ? ((value / total) * 100).toFixed(1) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ListDisplay = ({ data }) => {
    if (data.length === 0) return <p className="text-center text-gray-500">No data for this list.</p>;
    return (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {data.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <label htmlFor="report-type" className="text-sm font-medium text-gray-700">Select Report Type:</label>
        <select
          id="report-type"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="demographics">Demographics Report</option>
          <option value="voter-status">Voter Status Report</option>
          <option value="program-beneficiaries">Special Programs Beneficiaries Report</option>
          <option value="household-distribution">Household Distribution Report</option>
        </select>
        <button
          onClick={generateReport}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <BarChart className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">{reportData.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()} // Basic print functionality
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
              <button
                onClick={() => { /* Implement export logic based on reportData */ }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {reportData.sections.map((section, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">{section.title}</h4>
                <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  {section.type === 'bar' && <BarChartDisplay data={section.data} />}
                  {section.type === 'pie' && <PieChartDisplay data={section.data} />}
                  {section.type === 'list' && <ListDisplay data={section.data} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!reportData && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-600">
          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Select a report type and click "Generate Report" to view statistics.</p>
        </div>
      )}
    </div>
  );
} 