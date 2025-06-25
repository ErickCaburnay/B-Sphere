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
      noise: 67,
      garbage: 45,
      publicSafety: 34,
      infrastructure: 28,
      animalControl: 23,
      others: 37
    },
    chartData: {
      status: {
        labels: ['Resolved', 'Pending', 'In Progress'],
        data: [187, 34, 13],
        colors: ['#22C55E', '#F59E0B', '#3B82F6']
      },
      categories: {
        labels: ['Noise', 'Garbage', 'Public Safety', 'Infrastructure', 'Animal Control', 'Others'],
        data: [67, 45, 34, 28, 23, 37],
        colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6']
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