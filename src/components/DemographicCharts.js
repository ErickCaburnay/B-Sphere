"use client";

import { useEffect, useState, memo, useCallback } from "react";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Image from "next/image";
import { demographicsData, calculatePercentage } from "@/lib/mockData";

// Custom Image component that handles errors gracefully
const SafeImage = memo(({ src, alt, ...props }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  if (imageError) {
    return null; // Don't render anything if image fails to load
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      onError={handleError}
      onLoad={handleLoad}
      style={{ opacity: imageLoaded ? 1 : 0 }}
    />
  );
});

SafeImage.displayName = 'SafeImage';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Animation variants
const cardAnimation = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Animated Counter Component
const AnimatedCounter = ({ value, decimals = 0, suffix = "" }) => (
  <CountUp
    start={0}
    end={value}
    duration={2}
    decimals={decimals}
    suffix={suffix}
    separator=","
  />
);

const DemographicCharts = memo(() => {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStartAnimation(true), 300);
    return () => clearTimeout(timer);
  }, []);







  // Chart options with animations and interactivity
  const getChartOptions = (type, labels, colors, title = "", customOptions = {}) => {
    const baseOptions = {
      chart: {
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1500,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        toolbar: {
          show: false
        },
        background: 'transparent',
        fontFamily: 'Inter, sans-serif',

      },
      colors: colors,
      labels: labels,
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        labels: {
          colors: '#6B7280'
        },
        markers: {
          width: 8,
          height: 8,
          radius: 2
        }
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: function(val) {
            return val.toLocaleString();
          }
        }
      },
      title: {
        text: title,
        style: {
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }
      }
    };

    if (type === 'donut') {
      return {
        ...baseOptions,
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#374151'
                },
                value: {
                  show: true,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  formatter: function(val) {
                    return val.toLocaleString();
                  }
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Total',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce((a, b) => {
                      return a + b;
                    }, 0).toLocaleString();
                  }
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            colors: ['#fff']
          },
          formatter: function(val, opts) {
            return Math.round(val) + '%';
          }
        }
      };
    }

    if (type === 'bar') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'bar'
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            horizontal: customOptions.horizontal || false,
            distributed: true,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            colors: ['#374151']
          },
          formatter: function(val) {
            return val.toLocaleString();
          },
          offsetY: -20
        },
        xaxis: {
          categories: labels,
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            },
            rotate: -45
          },
          axisBorder: {
            show: true,
            color: '#E5E7EB'
          },
          axisTicks: {
            show: true,
            color: '#E5E7EB'
          }
        },
        yaxis: {
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            },
            formatter: function(val) {
              return val.toLocaleString();
            }
          }
        },
        grid: {
          show: true,
          borderColor: '#F3F4F6',
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: false
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          }
        }
      };
    }

    if (type === 'area') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'area'
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
            stops: [0, 90, 100]
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            colors: ['#374151']
          },
          formatter: function(val) {
            return val.toLocaleString();
          },
          background: {
            enabled: true,
            foreColor: '#fff',
            borderRadius: 4,
            padding: 4,
            opacity: 0.9
          }
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 4,
          colors: colors,
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: {
            size: 6
          }
        },
        xaxis: {
          categories: labels,
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            }
          },
          axisBorder: {
            show: true,
            color: '#E5E7EB'
          },
          axisTicks: {
            show: true,
            color: '#E5E7EB'
          }
        },
        yaxis: {
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            },
            formatter: function(val) {
              return val.toLocaleString();
            }
          }
        },
        grid: {
          show: true,
          borderColor: '#F3F4F6',
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: false
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          }
        }
      };
    }

    if (type === 'line') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'line'
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 5,
          colors: colors,
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: {
            size: 7
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '11px',
            fontWeight: 'bold',
            colors: ['#374151']
          },
          formatter: function(val) {
            return val + '%';
          },
          background: {
            enabled: true,
            foreColor: '#fff',
            borderRadius: 4,
            padding: 4,
            opacity: 0.9
          }
        },
        xaxis: {
          categories: labels,
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            },
            rotate: -45
          },
          axisBorder: {
            show: true,
            color: '#E5E7EB'
          },
          axisTicks: {
            show: true,
            color: '#E5E7EB'
          }
        },
        yaxis: {
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            },
            formatter: function(val) {
              return val + '%';
            }
          }
        },
        grid: {
          show: true,
          borderColor: '#F3F4F6',
          strokeDashArray: 3,
          xaxis: {
            lines: {
              show: false
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          }
        }
      };
    }

    if (type === 'radialBar') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'radialBar'
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '60%'
            },
            track: {
              background: '#F3F4F6',
              strokeWidth: '100%',
              margin: 5
            },
            dataLabels: {
              name: {
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151'
              },
              value: {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1F2937',
                formatter: function(val) {
                  return val + '%';
                }
              }
            }
          }
        },
        stroke: {
          lineCap: 'round'
        }
      };
    }

    if (type === 'heatmap') {
      return {
        ...baseOptions,
        chart: {
          ...baseOptions.chart,
          type: 'heatmap'
        },
        plotOptions: {
          heatmap: {
            shadeIntensity: 0.5,
            radius: 4,
            useFillColorAsStroke: true,
            colorScale: {
              ranges: customOptions.ranges || [
                { from: 0, to: 1000, color: '#E0F2FE', name: 'Low' },
                { from: 1001, to: 2000, color: '#7DD3FC', name: 'Medium' },
                { from: 2001, to: 3000, color: '#0EA5E9', name: 'High' },
                { from: 3001, to: 5000, color: '#0284C7', name: 'Very High' }
              ]
            }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            colors: ['#fff']
          },
          formatter: function(val) {
            return val.toLocaleString();
          }
        },
        xaxis: {
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            }
          }
        },
        yaxis: {
          labels: {
            show: true,
            style: {
              fontSize: '12px',
              colors: '#6B7280'
            }
          }
        }
      };
    }

    return baseOptions;
  };

  // Chart Components - Updated according to image specifications
  const PopulationChart = () => {
    // Population Overview - Area Chart for total pop over time OR Bar Chart for pop/zone (Image 2)
    const options = {
      chart: {
        type: 'area',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        sparkline: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      colors: ['#3B82F6'],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        labels: { style: { fontSize: '10px' } }
      },
      yaxis: {
        labels: { 
          style: { fontSize: '10px' },
          formatter: function (val) {
            return val.toFixed(0);
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString() + " residents";
          }
        }
      }
    };
    
    const series = [{
      name: 'Population',
      data: [12000, 12150, 12300, 12450, 12600, demographicsData.population.total]
    }];
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="area"
            height="100%"
          />
        )}
      </div>
    );
  };

  const PopulationGrowthChart = () => {
    // Population Growth - Line Chart (compare year-by-year) (Image 3)
    const options = {
      chart: {
        type: 'line',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#10B981'],
      xaxis: {
        categories: ['2019', '2020', '2021', '2022', '2023', '2024'],
        labels: { style: { fontSize: '10px' } }
      },
      yaxis: {
        labels: { 
          style: { fontSize: '10px' },
          formatter: function (val) {
            return val.toFixed(1) + '%';
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toFixed(1) + "% growth";
          }
        }
      }
    };
    
    const series = [{
      name: 'Growth Rate',
      data: [2.1, 1.8, 2.3, 2.7, 3.1, demographicsData.population.growth]
    }];
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="line"
            height="100%"
          />
        )}
      </div>
    );
  };

  const VotersChart = () => {
    // Voters vs. Non-Voters - Donut Chart (simple %) OR Stacked Bar (per zone) (Image 1)
    const voterPercentage = Math.round((demographicsData.voters.registered / (demographicsData.voters.registered + demographicsData.voters.unregistered)) * 100);
    const nonVoterPercentage = 100 - voterPercentage;
    
    const options = {
      chart: {
        type: 'donut',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Voters',
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151',
                formatter: function (w) {
                  return voterPercentage + '%';
                }
              }
            }
          }
        }
      },
      colors: ['#10B981', '#EF4444'],
      labels: ['Registered', 'Unregistered'],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Math.round(val) + '%';
        },
        style: { fontSize: '10px', fontWeight: 'bold' }
      },
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '10px'
      }
    };
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={[voterPercentage, nonVoterPercentage]}
            type="donut"
            height="100%"
          />
        )}
      </div>
    );
  };

  const EmploymentStatusChart = () => {
    // Employment Rate - Line Chart over years OR Bar Chart (by category: employed, unemployed) (Image 2)
    const employmentRate = Math.round((demographicsData.employmentStatus.employed / demographicsData.employmentStatus.total) * 100);
    
    const options = {
      chart: {
        type: 'bar',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: '10px', fontWeight: 'bold' },
        formatter: function (val) {
          return val.toLocaleString();
        }
      },
      colors: ['#10B981', '#EF4444'],
      xaxis: {
        categories: ['Employed', 'Unemployed'],
        labels: { style: { fontSize: '10px' } }
      },
      yaxis: {
        labels: { 
          style: { fontSize: '10px' },
          formatter: function (val) {
            return val.toLocaleString();
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString() + " people";
          }
        }
      }
    };
    
    const series = [{
      name: 'Employment Status',
              data: [demographicsData.employmentStatus.employed, demographicsData.employmentStatus.unemployed]
    }];
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const AgeGenderGroupedChart = () => {
    // Age & Gender Distribution - Grouped Bar Chart (x-axis = age brackets, grouped by gender) (Image 2)
    const options = {
      chart: {
        type: 'bar',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
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
        enabled: false
      },
      colors: ['#3B82F6', '#EC4899'],
      xaxis: {
        categories: ['0-17', '18-35', '36-59', '60+'],
        labels: { style: { fontSize: '10px' } }
      },
      yaxis: {
        labels: { 
          style: { fontSize: '10px' },
          formatter: function (val) {
            return val.toLocaleString();
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        fontSize: '10px'
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString() + " people";
          }
        }
      }
    };
    
    const series = [
      {
        name: 'Male',
        data: [1200, 2800, 2400, 800]
      },
      {
        name: 'Female',
        data: [1150, 2900, 2500, 900]
      }
    ];
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const EducationChart = () => {
    // Educational Attainment - Horizontal Bar Chart (x = number, y = education level) (Image 2)
    const options = {
      chart: {
        type: 'bar',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          barHeight: '70%'
        }
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: '10px', fontWeight: 'bold' },
        formatter: function (val) {
          return val.toLocaleString();
        }
      },
      colors: ['#8B5CF6'],
      xaxis: {
        labels: { 
          style: { fontSize: '10px' },
          formatter: function (val) {
            return val.toLocaleString();
          }
        }
      },
      yaxis: {
        labels: { style: { fontSize: '10px' } }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString() + " people";
          }
        }
      }
    };
    
    const series = [{
      name: 'Population',
      data: [3200, 2800, 2400, 1800, 1200, 800]
    }];
    
    const categories = ['Elementary', 'High School', 'College', 'Vocational', 'Graduate', 'Post-Graduate'];
    options.yaxis.categories = categories;
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const SpecialProgramsChart = () => {
    // Special Programs (PWD, 4Ps, etc) - Donut Chart (program %) OR Bar Chart (count per program) (Image 1)
    const options = {
      chart: {
        type: 'donut',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif'
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Programs',
                fontSize: '12px',
                fontWeight: 600,
                color: '#374151'
              }
            }
          }
        }
      },
      colors: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6'],
      labels: ['4Ps', 'PWD', 'Solo Parent', 'Senior'],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Math.round(val) + '%';
        },
        style: { fontSize: '10px', fontWeight: 'bold' }
      },
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '10px'
      }
    };
    
    const series = [45, 25, 20, 10]; // Sample percentages
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="donut"
            height="100%"
          />
        )}
      </div>
    );
  };

  const CivilStatusChart = () => {
    // Civil Status - Pie Chart (Single, Married, etc.) (Image 2)
    const options = {
      chart: {
        type: 'pie',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      labels: ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Math.round(val) + '%';
        },
        style: { fontSize: '10px', fontWeight: 'bold' }
      },
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '10px'
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return Math.round(val) + '%';
          }
        }
      }
    };
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={demographicsData.civilStatus.chartData.data}
            type="pie"
            height="100%"
          />
        )}
      </div>
    );
  };

  const HouseholdChart = () => {
    // Household Types - Bar Chart (Own, Rent, Informal, etc.) (Image 1 or 2)
    const options = {
      chart: {
        type: 'bar',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: '10px', fontWeight: 'bold' },
        formatter: function (val) {
          return val.toLocaleString();
        }
      },
      colors: ['#10B981'],
      xaxis: {
        categories: ['Own', 'Rent', 'Informal', 'Others'],
        labels: { style: { fontSize: '10px' } }
      },
      yaxis: {
        labels: { 
          style: { fontSize: '10px' },
          formatter: function (val) {
            return val.toLocaleString();
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString() + " households";
          }
        }
      }
    };
    
    const series = [{
      name: 'Households',
      data: [2800, 1200, 800, 400]
    }];
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const ReligiousAffiliationChart = () => {
    // Religious Groups - Bar Chart (x = group, y = count) OR Donut (Image 1)
    const options = {
      chart: {
        type: 'bar',
        height: 200,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        },
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
        formatter: function (val) {
          return val.toLocaleString();
        }
      },
      colors: ['#8B5CF6'],
      xaxis: {
        categories: ['Catholic', 'Protestant', 'INC', 'Islam', 'Others', 'None'],
        labels: { 
          style: { fontSize: '9px' },
          rotate: -45
        }
      },
      yaxis: {
        labels: { 
          style: { fontSize: '10px' },
          formatter: function (val) {
            return val.toLocaleString();
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toLocaleString() + " people";
          }
        }
      }
    };
    
    const series = [{
      name: 'Population',
              data: demographicsData.religiousAffiliation.chartData.data
    }];
    
    return (
      <div className="h-full">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };



  // Stats Grid Component
  const StatsGrid = ({ data, colors }) => (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {Object.entries(data).map(([key, value], index) => (
        <div 
          key={key} 
          className="text-center p-3 rounded-2xl border"
          style={{ 
            backgroundColor: `${colors[index % colors.length]}15`,
            borderColor: `${colors[index % colors.length]}30`
          }}
        >
          <p 
            className="text-lg font-bold"
            style={{ color: colors[index % colors.length] }}
          >
            {startAnimation ? <AnimatedCounter value={value} /> : "0"}
          </p>
          <p className="text-xs text-gray-600 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </p>
        </div>
      ))}
    </div>
  );

  // Demographic Card Component
  const DemographicCard = ({ icon, title, data, subtitle, trend, children, ChartComponent }) => (
    <motion.div
      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-3 border border-gray-100 hover:border-gray-200 overflow-hidden flex flex-col h-[450px]"
      initial="initial"
      animate="animate"
      variants={cardAnimation}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Icon Background - Blurred */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        <SafeImage 
          src={`/resources/${icon}`} 
          alt={title} 
          width={120} 
          height={120}
          className="filter blur-[1px] scale-110 grayscale-[20%] brightness-75"
        />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header - Ultra Compact */}
      <div className="relative flex flex-col items-center text-center mb-1">
        <div className="mb-0.5">
          <h4 className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{title}</h4>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        
        {/* Centered Total Value - Ultra Compact */}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {startAnimation ? <AnimatedCounter value={data.total} /> : "0"}
          </span>
          {trend && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={`text-xs ${trend.isPositive ? '↗' : '↘'}`}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {startAnimation ? <AnimatedCounter value={trend.value} decimals={1} suffix="%" /> : "0%"}
            </div>
          )}
        </div>
      </div>

      {/* Chart - Expanded */}
      {ChartComponent && startAnimation && (
        <motion.div
          className="relative flex-1 min-h-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <ChartComponent />
        </motion.div>
      )}
      
      {/* Additional content - At Bottom */}
      <div className="relative mt-1">
        {children}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
    </motion.div>
  );



  return (
    <div className="space-y-6">

      {/* First Row - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Population Overview */}
        <DemographicCard
          key="population-overview"
          icon="users.png"
          title="Population Overview"
          subtitle="Total registered residents"
          data={demographicsData.population}
          trend={{ value: demographicsData.population.growth, isPositive: true }}
          ChartComponent={PopulationChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.population.male} /> : "0"}
              </p>
              <p className="text-xs text-blue-500">Male</p>
            </div>
            <div className="text-center p-2 bg-pink-50 rounded-xl border border-pink-100">
              <p className="text-sm font-bold text-pink-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.population.female} /> : "0"}
              </p>
              <p className="text-xs text-pink-500">Female</p>
            </div>
          </div>
        </DemographicCard>

        {/* 2. Population Growth */}
        <DemographicCard
          key="population-growth"
          icon="arrow_up.png"
          title="Population Growth"
          subtitle="6-month trend analysis"
          data={demographicsData.population}
          trend={{ value: demographicsData.population.growth, isPositive: true }}
          ChartComponent={PopulationGrowthChart}
        >
          <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-bold text-blue-600">
              {startAnimation ? <AnimatedCounter value={demographicsData.population.growth} decimals={1} suffix="%" /> : "0%"}
            </p>
            <p className="text-xs text-blue-500">Growth Rate</p>
          </div>
        </DemographicCard>
      </div>

      {/* Second Row - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Age & Gender Distribution */}
        <DemographicCard
          key="age-gender-distribution"
          icon="senior.png"
          title="Age & Gender Distribution"
          subtitle="Population by age groups and gender"
          data={demographicsData.ageDistribution}
          ChartComponent={AgeGenderGroupedChart}
        >
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.ageDistribution.groups.children} /> : "0"}
              </p>
              <p className="text-xs text-green-500">Children</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.ageDistribution.groups.adults} /> : "0"}
              </p>
              <p className="text-xs text-blue-500">Adults</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-sm font-bold text-purple-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.ageDistribution.groups.seniors} /> : "0"}
              </p>
              <p className="text-xs text-purple-500">Seniors</p>
            </div>
          </div>
        </DemographicCard>

        {/* 4. Household Types */}
        <DemographicCard
          key="household-types"
          icon="household.png"
          title="Household Types"
          subtitle="Family composition"
          data={demographicsData.households}
          ChartComponent={HouseholdChart}
        >
          <div className="text-center p-2 bg-orange-50 rounded-xl border border-orange-100 mt-2">
            <p className="text-sm font-bold text-orange-600">
              {startAnimation ? <AnimatedCounter value={demographicsData.households.averageSize} decimals={1} /> : "0"}
            </p>
            <p className="text-xs text-orange-500">Average Size</p>
          </div>
        </DemographicCard>
      </div>

      {/* Third Row - 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 5. Educational Level */}
        <DemographicCard
          key="educational-level"
          icon="educ-icon.png"
          title="Educational Level"
          subtitle="Completion rate by level"
          data={demographicsData.education}
          ChartComponent={EducationChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-bold text-green-600">85%</p>
              <p className="text-xs text-green-500">Elementary</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-600">65%</p>
              <p className="text-xs text-blue-500">College</p>
            </div>
          </div>
        </DemographicCard>

        {/* 6. Employment Rate */}
        <DemographicCard
          key="employment-rate"
          icon="users.png"
          title="Employment Rate"
          subtitle="Working age employment"
          data={demographicsData.employmentStatus}
          ChartComponent={EmploymentStatusChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.employmentStatus.employed} /> : "0"}
              </p>
              <p className="text-xs text-green-500">Employed</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm font-bold text-red-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.employmentStatus.unemployed} /> : "0"}
              </p>
              <p className="text-xs text-red-500">Unemployed</p>
            </div>
          </div>
        </DemographicCard>

        {/* 7. Voters & Non-Voters */}
        <DemographicCard
          key="voters-non-voters"
          icon="fingerprint.png"
          title="Voters & Non-Voters"
          subtitle="Registration progress"
          data={demographicsData.voters}
          ChartComponent={VotersChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.voters.registered} /> : "0"}
              </p>
              <p className="text-xs text-green-500">Registered</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm font-bold text-red-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.voters.unregistered} /> : "0"}
              </p>
              <p className="text-xs text-red-500">Unregistered</p>
            </div>
          </div>
        </DemographicCard>
      </div>

      {/* Fourth Row - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 8. Special Programs */}
        <DemographicCard
          key="special-programs"
          icon="social-welfare.png"
          title="Special Programs"
          subtitle="PWD, 4Ps, Solo Parents, TUPAD"
          data={demographicsData.specialPrograms}
          ChartComponent={SpecialProgramsChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center p-2 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-sm font-bold text-purple-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.pwd.total} /> : "0"}
              </p>
              <p className="text-xs text-purple-500">PWD</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm font-bold text-red-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.fourPs.total} /> : "0"}
              </p>
              <p className="text-xs text-red-500">4Ps</p>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-sm font-bold text-yellow-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.soloParent.total} /> : "0"}
              </p>
              <p className="text-xs text-yellow-500">Solo Parent</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.tupad.total} /> : "0"}
              </p>
              <p className="text-xs text-green-500">TUPAD</p>
            </div>
          </div>
        </DemographicCard>

        {/* 9. Religious Groups */}
        <DemographicCard
          key="religious-groups"
          icon="gov.png"
          title="Religious Groups"
          subtitle="Faith communities"
          data={demographicsData.religiousAffiliation}
          ChartComponent={ReligiousAffiliationChart}
        >
          <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100 mt-2">
            <p className="text-sm font-bold text-blue-600">
              {startAnimation ? <AnimatedCounter value={demographicsData.religiousAffiliation.affiliations.catholic} /> : "0"}
            </p>
            <p className="text-xs text-blue-500">Catholic (Majority)</p>
          </div>
        </DemographicCard>
      </div>

    </div>
  );
});

export default DemographicCharts; 
