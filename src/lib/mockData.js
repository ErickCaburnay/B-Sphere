// Mock data for Dashboard Demographics and Analytics
// This file contains sample data for testing purposes
// Replace with real database data when ready

export const demographicsData = {
  population: {
    total: 12847,
    male: 6423,
    female: 6424,
    growth: 2.3, // percentage growth
    chartData: {
      labels: ['Male', 'Female'],
      data: [6423, 6424],
      colors: ['#3B82F6', '#EC4899']
    }
  },
  
  ageDistribution: {
    total: 12847,
    groups: {
      children: 2847, // 0-17
      adults: 8234, // 18-59
      seniors: 1766 // 60+
    },
    chartData: {
      labels: ['Children (0-17)', 'Adults (18-59)', 'Seniors (60+)'],
      data: [2847, 8234, 1766],
      colors: ['#10B981', '#F59E0B', '#8B5CF6']
    }
  },
  
  education: {
    total: 9876, // Adults with education records
    levels: {
      elementary: 2134,
      highSchool: 3456,
      college: 2987,
      postGrad: 567,
      noFormalEducation: 732
    },
    chartData: {
      labels: ['Elementary', 'High School', 'College', 'Post Graduate', 'No Formal Education'],
      data: [2134, 3456, 2987, 567, 732],
      colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#6366F1']
    }
  },
  
  voters: {
    total: 8967, // Eligible voters (18+)
    registered: 7234,
    unregistered: 1733,
    registrationRate: 80.7, // percentage
    chartData: {
      labels: ['Registered', 'Unregistered'],
      data: [7234, 1733],
      colors: ['#059669', '#DC2626']
    }
  },
  
  households: {
    total: 3456,
    averageSize: 3.7,
    types: {
      nuclear: 2134, // Parents + children
      extended: 987, // Multi-generational
      single: 335 // Single person households
    },
    chartData: {
      labels: ['Nuclear Family', 'Extended Family', 'Single Person'],
      data: [2134, 987, 335],
      colors: ['#0EA5E9', '#8B5CF6', '#F59E0B']
    }
  },

  // New demographic data for PWD, 4Ps, Solo-Parent, and TUPAD
  specialPrograms: {
    total: 2198,
    pwd: {
      total: 234,
      male: 134,
      female: 100,
      ageGroups: {
        children: 45, // 0-17
        adults: 156, // 18-59
        seniors: 33 // 60+
      }
    },
    fourPs: {
      total: 543,
      households: 187,
      children: 298,
      adults: 245
    },
    soloParent: {
      total: 187,
      male: 23,
      female: 164,
      withChildren: 187,
      averageChildren: 2.3
    },
    tupad: {
      total: 322,
      male: 198,
      female: 124,
      ageGroups: {
        young: 89, // 18-30
        middle: 156, // 31-50
        senior: 77 // 51-60
      },
      averageDays: 30
    },
    chartData: {
      programs: {
        labels: ['PWD', '4Ps Beneficiaries', 'Solo Parents', 'TUPAD'],
        data: [234, 543, 187, 322],
        colors: ['#8B5CF6', '#EF4444', '#F59E0B', '#10B981']
      },
      pwdByAge: {
        labels: ['Children (0-17)', 'Adults (18-59)', 'Seniors (60+)'],
        data: [45, 156, 33],
        colors: ['#10B981', '#3B82F6', '#8B5CF6']
      },
      pwdByGender: {
        labels: ['Male', 'Female'],
        data: [134, 100],
        colors: ['#3B82F6', '#EC4899']
      },
      soloParentByGender: {
        labels: ['Male', 'Female'],
        data: [23, 164],
        colors: ['#3B82F6', '#EC4899']
      }
    }
  },

  // Religious affiliation data
  religiousAffiliation: {
    total: 12847,
    affiliations: {
      catholic: 8934,
      protestant: 2134,
      iglesiaNiCristo: 876,
      islam: 234,
      buddhist: 123,
      others: 546
    },
    chartData: {
      labels: ['Catholic', 'Protestant', 'Iglesia ni Cristo', 'Islam', 'Buddhist', 'Others'],
      data: [8934, 2134, 876, 234, 123, 546],
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
    }
  },

  // Employment status data
  employmentStatus: {
    total: 8234, // Working age population (18-59)
    employed: 5678,
    unemployed: 1456,
    selfEmployed: 987,
    student: 113,
    chartData: {
      labels: ['Employed', 'Unemployed', 'Self-Employed', 'Student'],
      data: [5678, 1456, 987, 113],
      colors: ['#22C55E', '#EF4444', '#F59E0B', '#3B82F6']
    }
  },

  // Civil status detailed data
  civilStatus: {
    total: 12847,
    status: {
      single: 4567,
      married: 6234,
      widowed: 1234,
      separated: 567,
      divorced: 245
    },
    chartData: {
      labels: ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'],
      data: [4567, 6234, 1234, 567, 245],
      colors: ['#3B82F6', '#22C55E', '#8B5CF6', '#F59E0B', '#EF4444']
    }
  }
};

export const analyticsData = {
  documents: {
    total: 4567,
    thisMonth: 234,
    status: {
      pending: 123,
      approved: 3987,
      rejected: 234,
      processing: 223
    },
    types: {
      barangayClearance: 1234,
      certificate: 987,
      indigency: 654,
      businessPermit: 432,
      id: 876,
      others: 384
    },
    // Time-based data for filtering
    timeData: {
      today: {
        total: 23,
        barangayClearance: 8,
        certificate: 5,
        indigency: 4,
        businessPermit: 2,
        id: 3,
        others: 1
      },
      thisWeek: {
        total: 156,
        barangayClearance: 45,
        certificate: 32,
        indigency: 28,
        businessPermit: 18,
        id: 25,
        others: 8
      },
      thisMonth: {
        total: 678,
        barangayClearance: 198,
        certificate: 145,
        indigency: 123,
        businessPermit: 87,
        id: 98,
        others: 27
      },
      thisYear: {
        total: 4567,
        barangayClearance: 1234,
        certificate: 987,
        indigency: 654,
        businessPermit: 432,
        id: 876,
        others: 384
      },
      allTime: {
        total: 15847,
        barangayClearance: 4234,
        certificate: 3456,
        indigency: 2876,
        businessPermit: 1987,
        id: 2345,
        others: 949
      }
    },
    // Monthly trend data
    monthlyTrend: [
      { month: 'Jan', total: 345, clearance: 98, certificate: 76, indigency: 54, businessPermit: 32, id: 67, others: 18 },
      { month: 'Feb', total: 398, clearance: 112, certificate: 89, indigency: 67, businessPermit: 41, id: 73, others: 16 },
      { month: 'Mar', total: 412, clearance: 125, certificate: 95, indigency: 72, businessPermit: 38, id: 69, others: 13 },
      { month: 'Apr', total: 387, clearance: 108, certificate: 87, indigency: 63, businessPermit: 45, id: 71, others: 13 },
      { month: 'May', total: 456, clearance: 134, certificate: 102, indigency: 78, businessPermit: 48, id: 79, others: 15 },
      { month: 'Jun', total: 423, clearance: 118, certificate: 94, indigency: 69, businessPermit: 52, id: 76, others: 14 }
    ],
    chartData: {
      status: {
        labels: ['Approved', 'Processing', 'Pending', 'Rejected'],
        data: [3987, 223, 123, 234],
        colors: ['#22C55E', '#F59E0B', '#6B7280', '#EF4444']
      },
      types: {
        labels: ['Barangay Clearance', 'Certificate', 'Indigency', 'Business Permit', 'Barangay ID', 'Others'],
        data: [1234, 987, 654, 432, 876, 384],
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
      }
    }
  },
  
  complaints: {
    total: 234,
    thisMonth: 23,
    status: {
      resolved: 187,
      pending: 34,
      inProgress: 13
    },
    avgResolutionTime: 5.2, // days
    categories: {
      publicSafety: 67,
      healthSanitation: 45,
      noiseDisturbance: 34,
      communitySocial: 28,
      others: 60
    },
    // Time-based data for filtering
    timeData: {
      today: {
        total: 3,
        publicSafety: 1,
        healthSanitation: 1,
        noiseDisturbance: 0,
        communitySocial: 1,
        others: 0
      },
      thisWeek: {
        total: 18,
        publicSafety: 6,
        healthSanitation: 4,
        noiseDisturbance: 2,
        communitySocial: 3,
        others: 3
      },
      thisMonth: {
        total: 23,
        publicSafety: 8,
        healthSanitation: 6,
        noiseDisturbance: 3,
        communitySocial: 2,
        others: 4
      },
      thisYear: {
        total: 234,
        publicSafety: 67,
        healthSanitation: 45,
        noiseDisturbance: 34,
        communitySocial: 28,
        others: 60
      },
      allTime: {
        total: 1456,
        publicSafety: 423,
        healthSanitation: 298,
        noiseDisturbance: 234,
        communitySocial: 187,
        others: 314
      }
    },
    // Monthly trend data
    monthlyTrend: [
      { month: 'Jan', total: 42, publicSafety: 12, healthSanitation: 8, noiseDisturbance: 6, communitySocial: 7, others: 9 },
      { month: 'Feb', total: 38, publicSafety: 11, healthSanitation: 7, noiseDisturbance: 5, communitySocial: 6, others: 9 },
      { month: 'Mar', total: 45, publicSafety: 13, healthSanitation: 9, noiseDisturbance: 8, communitySocial: 7, others: 8 },
      { month: 'Apr', total: 39, publicSafety: 10, healthSanitation: 8, noiseDisturbance: 6, communitySocial: 5, others: 10 },
      { month: 'May', total: 48, publicSafety: 14, healthSanitation: 10, noiseDisturbance: 7, communitySocial: 8, others: 9 },
      { month: 'Jun', total: 22, publicSafety: 7, healthSanitation: 3, noiseDisturbance: 2, communitySocial: 5, others: 5 }
    ],
    chartData: {
      status: {
        labels: ['Resolved', 'Pending', 'In Progress'],
        data: [187, 34, 13],
        colors: ['#22C55E', '#F59E0B', '#3B82F6']
      },
      categories: {
        labels: ['Public Safety', 'Health & Sanitation', 'Noise Disturbance', 'Community & Social Issues', 'Others'],
        data: [67, 45, 34, 28, 60],
        colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#8B5CF6']
      }
    }
  },
  
  socialServices: {
    total: 1876,
    thisMonth: 156,
    programs: {
      seniorCitizen: 432,
      pwd: 234,
      solo: 187,
      indigent: 543,
      scholarship: 298,
      livelihood: 182
    },
    beneficiaries: {
      active: 1654,
      inactive: 222
    },
    chartData: {
      programs: {
        labels: ['Senior Citizen', 'PWD', 'Solo Parent', 'Indigent', 'Scholarship', 'Livelihood'],
        data: [432, 234, 187, 543, 298, 182],
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#22C55E', '#3B82F6']
      },
      beneficiaries: {
        labels: ['Active', 'Inactive'],
        data: [1654, 222],
        colors: ['#10B981', '#6B7280']
      }
    }
  },

  // Document Purpose Analytics
  documentPurpose: {
    total: 4567,
    purposes: {
      employment: 1234,
      business: 987,
      travel: 654,
      loan: 432,
      scholarship: 567,
      others: 693
    },
    timeData: {
      today: {
        total: 23,
        employment: 8,
        business: 5,
        travel: 4,
        loan: 2,
        scholarship: 3,
        others: 1
      },
      thisWeek: {
        total: 156,
        employment: 45,
        business: 32,
        travel: 28,
        loan: 18,
        scholarship: 25,
        others: 8
      },
      thisMonth: {
        total: 678,
        employment: 198,
        business: 145,
        travel: 123,
        loan: 87,
        scholarship: 98,
        others: 27
      },
      thisYear: {
        total: 4567,
        employment: 1234,
        business: 987,
        travel: 654,
        loan: 432,
        scholarship: 567,
        others: 693
      },
      allTime: {
        total: 18234,
        employment: 5678,
        business: 4321,
        travel: 3456,
        loan: 2134,
        scholarship: 1987,
        others: 658
      }
    },
    chartData: {
      labels: ['Employment', 'Business', 'Travel', 'Loan', 'Scholarship', 'Others'],
      data: [1234, 987, 654, 432, 567, 693],
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
    }
  },

  // Service Requests Analytics
  serviceRequests: {
    total: 2345,
    thisMonth: 187,
    status: {
      completed: 1876,
      pending: 234,
      inProgress: 156,
      cancelled: 79
    },
    types: {
      medicalAssistance: 543,
      financialAid: 432,
      legalAid: 234,
      emergencyResponse: 198,
      transportService: 156,
      others: 782
    },
    timeData: {
      today: {
        total: 12,
        medicalAssistance: 3,
        financialAid: 2,
        legalAid: 1,
        emergencyResponse: 2,
        transportService: 1,
        others: 3
      },
      thisWeek: {
        total: 89,
        medicalAssistance: 23,
        financialAid: 18,
        legalAid: 12,
        emergencyResponse: 15,
        transportService: 8,
        others: 13
      },
      thisMonth: {
        total: 187,
        medicalAssistance: 45,
        financialAid: 38,
        legalAid: 23,
        emergencyResponse: 32,
        transportService: 18,
        others: 31
      },
      thisYear: {
        total: 2345,
        medicalAssistance: 543,
        financialAid: 432,
        legalAid: 234,
        emergencyResponse: 198,
        transportService: 156,
        others: 782
      },
      allTime: {
        total: 8976,
        medicalAssistance: 2134,
        financialAid: 1876,
        legalAid: 987,
        emergencyResponse: 1234,
        transportService: 876,
        others: 1869
      }
    },
    chartData: {
      status: {
        labels: ['Completed', 'Pending', 'In Progress', 'Cancelled'],
        data: [1876, 234, 156, 79],
        colors: ['#22C55E', '#F59E0B', '#3B82F6', '#EF4444']
      },
      types: {
        labels: ['Medical Assistance', 'Financial Aid', 'Legal Aid', 'Emergency Response', 'Transport Service', 'Others'],
        data: [543, 432, 234, 198, 156, 782],
        colors: ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E', '#8B5CF6', '#6B7280']
      }
    }
  },

  // User Activity Analytics
  userActivity: {
    totalUsers: 156,
    activeToday: 23,
    activeThisWeek: 87,
    activeThisMonth: 134,
    roles: {
      admin: 3,
      staff: 12,
      clerk: 8
    },
    loginTrend: [
      { date: '2024-06-01', logins: 45 },
      { date: '2024-06-02', logins: 52 },
      { date: '2024-06-03', logins: 38 },
      { date: '2024-06-04', logins: 61 },
      { date: '2024-06-05', logins: 47 },
      { date: '2024-06-06', logins: 55 },
      { date: '2024-06-07', logins: 42 }
    ],
    chartData: {
      roles: {
        labels: ['Admin', 'Staff', 'Clerk'],
        data: [3, 12, 8],
        colors: ['#EF4444', '#3B82F6', '#22C55E']
      }
    }
  },

  // System Performance Analytics
  systemPerformance: {
    averageResponseTime: 1.2, // seconds
    uptime: 99.8, // percentage
    totalRequests: 12847,
    errorRate: 0.2, // percentage
    peakHours: [9, 10, 11, 14, 15, 16], // hours of the day
    dailyRequests: [
      { date: '2024-06-01', requests: 1234 },
      { date: '2024-06-02', requests: 1456 },
      { date: '2024-06-03', requests: 1123 },
      { date: '2024-06-04', requests: 1678 },
      { date: '2024-06-05', requests: 1345 },
      { date: '2024-06-06', requests: 1567 },
      { date: '2024-06-07', requests: 1289 }
    ]
  }
};

// Helper function to format numbers
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Helper function to calculate percentage
export const calculatePercentage = (value, total) => {
  return ((value / total) * 100).toFixed(1);
};

// Helper function to get trend indicator
export const getTrendIndicator = (current, previous) => {
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change).toFixed(1),
    direction: change >= 0 ? 'up' : 'down',
    isPositive: change >= 0
  };
}; 