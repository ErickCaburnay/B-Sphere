"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import CountUp from "react-countup";
import Image from "next/image";
import { demographicsData, calculatePercentage } from "@/lib/mockData";

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

export default function DemographicCharts() {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStartAnimation(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Chart options with animations
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
        fontFamily: 'Inter, sans-serif'
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

  // Chart Components
  const PopulationChart = () => {
    const options = getChartOptions(
      'donut', 
      demographicsData.population.chartData.labels,
      demographicsData.population.chartData.colors
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={demographicsData.population.chartData.data}
            type="donut"
            height="100%"
          />
        )}
      </div>
    );
  };

  const AgeDistributionChart = () => {
    const options = getChartOptions(
      'bar',
      demographicsData.ageDistribution.chartData.labels,
      demographicsData.ageDistribution.chartData.colors
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[{
              name: 'Population',
              data: demographicsData.ageDistribution.chartData.data
            }]}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const EducationChart = () => {
    const options = getChartOptions(
      'donut',
      demographicsData.education.chartData.labels,
      demographicsData.education.chartData.colors
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={demographicsData.education.chartData.data}
            type="donut"
            height="100%"
          />
        )}
      </div>
    );
  };

  const VotersChart = () => {
    const options = getChartOptions(
      'donut',
      demographicsData.voters.chartData.labels,
      demographicsData.voters.chartData.colors
    );
    
    return (
              <div className="h-48 mt-4">
          {startAnimation && (
            <Chart
              options={options}
              series={demographicsData.voters.chartData.data}
              type="donut"
              height="100%"
            />
          )}
        </div>
    );
  };

  const HouseholdChart = () => {
    const options = getChartOptions(
      'bar',
      demographicsData.households.chartData.labels,
      demographicsData.households.chartData.colors,
      '',
      { horizontal: true }
    );
    
          return (
        <div className="h-48 mt-4">
          {startAnimation && (
            <Chart
              options={options}
              series={[{
                name: 'Households',
                data: demographicsData.households.chartData.data
              }]}
              type="bar"
              height="100%"
            />
          )}
        </div>
      );
  };

  // New Charts for PWD, 4Ps, Solo-Parent
  const SpecialProgramsChart = () => {
    const options = getChartOptions(
      'bar',
      demographicsData.specialPrograms.chartData.programs.labels,
      demographicsData.specialPrograms.chartData.programs.colors
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[{
              name: 'Beneficiaries',
              data: demographicsData.specialPrograms.chartData.programs.data
            }]}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const PWDByAgeChart = () => {
    const options = getChartOptions(
      'donut',
      demographicsData.specialPrograms.chartData.pwdByAge.labels,
      demographicsData.specialPrograms.chartData.pwdByAge.colors
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={demographicsData.specialPrograms.chartData.pwdByAge.data}
            type="donut"
            height="100%"
          />
        )}
      </div>
    );
  };

  const CivilStatusChart = () => {
    const options = {
      chart: {
        type: 'radialBar',
        height: 300,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1500
        },
        fontFamily: 'Inter, sans-serif'
      },
      stroke: {
        lineCap: 'round',
        width: 8
      },
      plotOptions: {
        radialBar: {
          offsetY: -20,
          startAngle: -90,
          endAngle: 270,
          hollow: {
            margin: 5,
            size: '30%',
            background: 'transparent'
          },
          track: {
            background: '#F3F4F6',
            strokeWidth: '97%',
            margin: 0
          },
          stroke: {
            lineCap: 'round'
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: '10px',
              fontWeight: 600,
              color: '#374151',
              offsetY: -8
            },
            value: {
              show: true,
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#1F2937',
              offsetY: 6,
              formatter: function (val) {
                return parseInt(val) + "%"
              }
            }
          },
          barLabels: {
            enabled: true,
            useSeriesColors: true,
            offsetX: 0,
            fontSize: '11px',
            fontWeight: 600,
            formatter: function(seriesName, opts) {
              return parseInt(opts.w.globals.series[opts.seriesIndex]) + "%"
            }
          }
        }
      },
      colors: ['#3B82F6', '#22C55E', '#8B5CF6', '#F59E0B', '#EF4444'],
      labels: demographicsData.civilStatus.chartData.labels,
      legend: {
        show: true,
        position: 'bottom',
        offsetY: 0,
        fontSize: '12px',
        fontWeight: 500,
        labels: {
          colors: '#6B7280',
          useSeriesColors: false
        },
        markers: {
          width: 10,
          height: 10,
          strokeWidth: 0,
          radius: 12
        },
        itemMargin: {
          horizontal: 6,
          vertical: 4
        },
        formatter: function(seriesName, opts) {
          const value = demographicsData.civilStatus.chartData.data[opts.seriesIndex];
          return seriesName + ": " + value.toLocaleString()
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            fontSize: '10px'
          }
        }
      }]
    };

    const series = demographicsData.civilStatus.chartData.data.map(value => 
      Math.round((value / demographicsData.civilStatus.total) * 100)
    );
    
    return (
      <div className="h-72 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="radialBar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const EmploymentStatusChart = () => {
    const options = getChartOptions(
      'bar',
      demographicsData.employmentStatus.chartData.labels,
      demographicsData.employmentStatus.chartData.colors
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[{
              name: 'Population',
              data: demographicsData.employmentStatus.chartData.data
            }]}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  const ReligiousAffiliationChart = () => {
    const options = {
      chart: {
        type: 'radialBar',
        height: 300,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1500
        },
        fontFamily: 'Inter, sans-serif'
      },
      stroke: {
        lineCap: 'round',
        width: 8
      },
      plotOptions: {
        radialBar: {
          offsetY: -10,
          startAngle: 0,
          endAngle: 360,
          hollow: {
            margin: 10,
            size: '25%',
            background: 'transparent'
          },
          track: {
            background: '#F9FAFB',
            strokeWidth: '97%',
            margin: 0
          },
          stroke: {
            lineCap: 'round'
          },
          dataLabels: {
            name: {
              show: true,
              fontSize: '10px',
              fontWeight: 600,
              color: '#374151',
              offsetY: -8
            },
            value: {
              show: true,
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#1F2937',
              offsetY: 6,
              formatter: function (val) {
                return parseInt(val) + "%"
              }
            }
          },
          barLabels: {
            enabled: true,
            useSeriesColors: true,
            offsetX: 0,
            fontSize: '11px',
            fontWeight: 600,
            formatter: function(seriesName, opts) {
              return parseInt(opts.w.globals.series[opts.seriesIndex]) + "%"
            }
          }
        }
      },
      colors: ['#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280'],
      labels: demographicsData.religiousAffiliation.chartData.labels,
      legend: {
        show: true,
        position: 'bottom',
        offsetY: 5,
        fontSize: '12px',
        fontWeight: 500,
        labels: {
          colors: '#6B7280',
          useSeriesColors: false
        },
        markers: {
          width: 10,
          height: 10,
          strokeWidth: 0,
          radius: 12
        },
        itemMargin: {
          horizontal: 6,
          vertical: 4
        },
        formatter: function(seriesName, opts) {
          const value = demographicsData.religiousAffiliation.chartData.data[opts.seriesIndex];
          return seriesName + ": " + value.toLocaleString()
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            fontSize: '10px'
          }
        }
      }]
    };

    const series = demographicsData.religiousAffiliation.chartData.data.map(value => 
      Math.round((value / demographicsData.religiousAffiliation.total) * 100)
    );
    
    return (
      <div className="h-72 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={series}
            type="radialBar"
            height="100%"
          />
        )}
      </div>
    );
  };

  // New Chart Types inspired by the dashboard image
  
  // Population Growth Trend (Area Chart)
  const PopulationTrendChart = () => {
    const trendData = [
      { month: 'Jan', population: 12200 },
      { month: 'Feb', population: 12350 },
      { month: 'Mar', population: 12480 },
      { month: 'Apr', population: 12620 },
      { month: 'May', population: 12750 },
      { month: 'Jun', population: 12847 }
    ];

    const options = getChartOptions(
      'area',
      trendData.map(d => d.month),
      ['#3B82F6']
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[{
              name: 'Population',
              data: trendData.map(d => d.population)
            }]}
            type="area"
            height="100%"
          />
        )}
      </div>
    );
  };

  // Voter Registration Rate (Radial Bar)
  const VoterRegistrationRadial = () => {
    const options = {
      chart: {
        type: 'radialBar',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1500
        }
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%'
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
              color: '#059669'
            }
          }
        }
      },
      colors: ['#059669'],
      labels: ['Registration Rate']
    };
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[demographicsData.voters.registrationRate]}
            type="radialBar"
            height="100%"
          />
        )}
      </div>
    );
  };

  // Age & Gender Grouped Bar Chart
  const AgeGenderGroupedChart = () => {
    // Calculate approximate male/female split for each age group
    const maleData = [
      Math.round(demographicsData.ageDistribution.groups.children * 0.51), // 51% male
      Math.round(demographicsData.ageDistribution.groups.adults * 0.50),   // 50% male
      Math.round(demographicsData.ageDistribution.groups.seniors * 0.48)   // 48% male (women live longer)
    ];
    
    const femaleData = [
      demographicsData.ageDistribution.groups.children - maleData[0],
      demographicsData.ageDistribution.groups.adults - maleData[1],
      demographicsData.ageDistribution.groups.seniors - maleData[2]
    ];

    const options = {
      chart: {
        type: 'bar',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1500
        },
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#3B82F6', '#EC4899'], // Blue for male, Pink for female
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          dataLabels: {
            position: 'top'
          }
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
        offsetY: -20
      },
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
      xaxis: {
        categories: ['Children (0-17)', 'Adults (18-59)', 'Seniors (60+)'],
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
      },
      tooltip: {
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: function(val) {
            return val.toLocaleString() + ' people';
          }
        }
      }
    };
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[
              {
                name: 'Male',
                data: maleData
              },
              {
                name: 'Female',
                data: femaleData
              }
            ]}
            type="bar"
            height="100%"
          />
        )}
      </div>
    );
  };

  // Educational Progress Line Chart
  const EducationProgressChart = () => {
    const progressData = [
      { level: 'Elementary', completion: 85 },
      { level: 'High School', completion: 78 },
      { level: 'College', completion: 65 },
      { level: 'Post Grad', completion: 45 }
    ];

    const options = getChartOptions(
      'line',
      progressData.map(d => d.level),
      ['#F59E0B']
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[{
              name: 'Completion Rate %',
              data: progressData.map(d => d.completion)
            }]}
            type="line"
            height="100%"
          />
        )}
      </div>
    );
  };

  // Employment Status Radial Progress
  const EmploymentRadialChart = () => {
    const employmentRate = Math.round((demographicsData.employmentStatus.employed / demographicsData.employmentStatus.total) * 100);
    
    const options = {
      chart: {
        type: 'radialBar',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1500
        }
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%'
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
              color: '#22C55E'
            }
          }
        }
      },
      colors: ['#22C55E'],
      labels: ['Employment Rate']
    };
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[employmentRate]}
            type="radialBar"
            height="100%"
          />
        )}
      </div>
    );
  };

  // TUPAD Age Distribution Chart
  const TupadAgeChart = () => {
    const options = getChartOptions(
      'donut',
      ['Young (18-30)', 'Middle (31-50)', 'Senior (51-60)'],
      ['#10B981', '#059669', '#047857']
    );
    
    return (
      <div className="h-48 mt-4">
        {startAnimation && (
          <Chart
            options={options}
            series={[
              demographicsData.specialPrograms.tupad.ageGroups.young,
              demographicsData.specialPrograms.tupad.ageGroups.middle,
              demographicsData.specialPrograms.tupad.ageGroups.senior
            ]}
            type="donut"
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
      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-gray-200 overflow-hidden"
      initial="initial"
      animate="animate"
      variants={cardAnimation}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Icon Background - Blurred */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 group-hover:opacity-35 transition-opacity duration-500">
        <Image 
          src={`/resources/${icon}`} 
          alt={title} 
          width={160} 
          height={160}
          className="filter blur-[1px] scale-110 grayscale-[20%] brightness-75"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header */}
      <div className="relative flex flex-col items-center text-center mb-6">
        <div className="mb-3">
          <h4 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{title}</h4>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        
        {/* Centered Total Value */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {startAnimation ? <AnimatedCounter value={data.total} /> : "0"}
          </span>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
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

      {/* Chart */}
      {ChartComponent && startAnimation && (
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <ChartComponent />
        </motion.div>
      )}
      
      {/* Additional content */}
      <div className="relative">
        {children}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* First Row - Main Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Population Overview with Donut Chart */}
        <DemographicCard
          icon="users.png"
          title="Population Overview"
          subtitle="Total registered residents"
          data={demographicsData.population}
          trend={{ value: demographicsData.population.growth, isPositive: true }}
          ChartComponent={PopulationChart}
        >
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-lg font-bold text-blue-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.population.male} /> : "0"}
              </p>
              <p className="text-xs text-blue-500">Male</p>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-2xl border border-pink-100">
              <p className="text-lg font-bold text-pink-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.population.female} /> : "0"}
              </p>
              <p className="text-xs text-pink-500">Female</p>
            </div>
          </div>
        </DemographicCard>

        {/* Population Growth Trend with Area Chart */}
        <DemographicCard
          icon="arrow_up.png"
          title="Population Growth"
          subtitle="6-month trend analysis"
          data={demographicsData.population}
          trend={{ value: demographicsData.population.growth, isPositive: true }}
          ChartComponent={PopulationTrendChart}
        >
          <div className="text-center p-3 bg-blue-50 rounded-2xl border border-blue-100 mt-4">
            <p className="text-lg font-bold text-blue-600">
              {startAnimation ? <AnimatedCounter value={demographicsData.population.growth} decimals={1} suffix="%" /> : "0%"}
            </p>
            <p className="text-xs text-blue-500">Growth Rate</p>
          </div>
        </DemographicCard>

        {/* Voter Registration with Radial Progress */}
        <DemographicCard
          icon="fingerprint.png"
          title="Voter Registration"
          subtitle="Registration progress"
          data={demographicsData.voters}
          ChartComponent={VoterRegistrationRadial}
        >
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-lg font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.voters.registered} /> : "0"}
              </p>
              <p className="text-xs text-green-500">Registered</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-lg font-bold text-red-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.voters.unregistered} /> : "0"}
              </p>
              <p className="text-xs text-red-500">Unregistered</p>
            </div>
          </div>
        </DemographicCard>

        {/* Employment Status with Radial Progress */}
        <DemographicCard
          icon="users.png"
          title="Employment Rate"
          subtitle="Working age employment"
          data={demographicsData.employmentStatus}
          ChartComponent={EmploymentRadialChart}
        >
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-2xl border border-green-100">
              <p className="text-lg font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.employmentStatus.employed} /> : "0"}
              </p>
              <p className="text-xs text-green-500">Employed</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-lg font-bold text-red-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.employmentStatus.unemployed} /> : "0"}
              </p>
              <p className="text-xs text-red-500">Unemployed</p>
            </div>
          </div>
        </DemographicCard>
      </div>

      {/* Second Row - Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Age & Gender Distribution */}
        <DemographicCard
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

        {/* Education Progress Line Chart */}
        <DemographicCard
          icon="educ-icon.png"
          title="Education Progress"
          subtitle="Completion rate by level"
          data={demographicsData.education}
          ChartComponent={EducationProgressChart}
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

        {/* Special Programs Bar Chart */}
        <DemographicCard
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
      </div>

      {/* Third Row - Additional Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
        {/* Civil Status Donut */}
        <DemographicCard
          icon="fingerprint.png"
          title="Civil Status"
          subtitle="Marital status distribution"
          data={demographicsData.civilStatus}
          ChartComponent={CivilStatusChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.civilStatus.status.married} /> : "0"}
              </p>
              <p className="text-xs text-green-500">Married</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.civilStatus.status.single} /> : "0"}
              </p>
              <p className="text-xs text-blue-500">Single</p>
            </div>
          </div>
        </DemographicCard>

        {/* Household Statistics */}
        <DemographicCard
          icon="household.png"
          title="Household Types"
          subtitle="Family composition"
          data={demographicsData.households}
          ChartComponent={HouseholdChart}
        >
          <div className="text-center p-3 bg-orange-50 rounded-2xl border border-orange-100 mt-4">
            <p className="text-lg font-bold text-orange-600">
              {startAnimation ? <AnimatedCounter value={demographicsData.households.averageSize} decimals={1} /> : "0"}
            </p>
            <p className="text-xs text-orange-500">Average Size</p>
          </div>
        </DemographicCard>

        {/* PWD by Age Group */}
        <DemographicCard
          icon="users.png"
          title="PWD Distribution"
          subtitle="By age groups"
          data={demographicsData.specialPrograms.pwd}
          ChartComponent={PWDByAgeChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.pwd.ageGroups.adults} /> : "0"}
              </p>
              <p className="text-xs text-blue-500">Adults</p>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-sm font-bold text-purple-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.pwd.ageGroups.seniors} /> : "0"}
              </p>
              <p className="text-xs text-purple-500">Seniors</p>
            </div>
          </div>
        </DemographicCard>

        {/* TUPAD Program */}
        <DemographicCard
          icon="users.png"
          title="TUPAD Program"
          subtitle="Temporary employment"
          data={demographicsData.specialPrograms.tupad}
          ChartComponent={TupadAgeChart}
        >
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="text-center p-2 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-bold text-green-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.tupad.male} /> : "0"}
              </p>
              <p className="text-xs text-green-500">Male</p>
            </div>
            <div className="text-center p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm font-bold text-emerald-600">
                {startAnimation ? <AnimatedCounter value={demographicsData.specialPrograms.tupad.female} /> : "0"}
              </p>
              <p className="text-xs text-emerald-500">Female</p>
            </div>
          </div>
        </DemographicCard>

        {/* Religious Affiliation */}
        <DemographicCard
          icon="gov.png"
          title="Religious Groups"
          subtitle="Faith communities"
          data={demographicsData.religiousAffiliation}
          ChartComponent={ReligiousAffiliationChart}
        >
          <div className="text-center p-3 bg-blue-50 rounded-2xl border border-blue-100 mt-4">
            <p className="text-lg font-bold text-blue-600">
              {startAnimation ? <AnimatedCounter value={demographicsData.religiousAffiliation.affiliations.catholic} /> : "0"}
            </p>
            <p className="text-xs text-blue-500">Catholic (Majority)</p>
          </div>
        </DemographicCard>
      </div>
    </div>
  );
} 
