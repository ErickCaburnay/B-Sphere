"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { demographicsData, analyticsData, formatNumber, calculatePercentage } from "@/lib/mockData";
import DemographicCharts from "./DemographicCharts";
import AnalyticsCharts from "./AnalyticsCharts";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function DashboardSections() {
  const [chartsInitialized, setChartsInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  // Memoize the card animation to prevent recreation on every render
  const cardAnimation = useMemo(() => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }), []);

  // Chart animation options
  const chartAnimationOptions = {
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
      delay: (context) => context.dataIndex * 100,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  useEffect(() => {
    setIsVisible(true);
    setChartsInitialized(true);
    // Start animations after component mounts
    setTimeout(() => setStartAnimation(true), 500);
  }, []);

  // Animated Counter Component
  const AnimatedCounter = ({ value, duration = 2, prefix = "", suffix = "", decimals = 0 }) => (
    <CountUp
      start={0}
      end={value}
      duration={duration}
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
      separator=","
      preserveValue
    />
  );

  // Chart Components
  const PopulationChart = () => {
    const data = {
      labels: demographicsData.population.chartData.labels,
      datasets: [{
        data: demographicsData.population.chartData.data,
        backgroundColor: demographicsData.population.chartData.colors,
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff'
      }]
    };

    return (
      <div className="h-32 mt-4">
        <Doughnut data={data} options={{
          ...chartAnimationOptions,
          cutout: '60%',
          plugins: {
            ...chartAnimationOptions.plugins,
            legend: { display: false }
          }
        }} />
      </div>
    );
  };

  const AgeDistributionChart = () => {
    const data = {
      labels: demographicsData.ageDistribution.chartData.labels,
      datasets: [{
        data: demographicsData.ageDistribution.chartData.data,
        backgroundColor: demographicsData.ageDistribution.chartData.colors,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };

    return (
      <div className="h-32 mt-4">
        <Bar data={data} options={{
          ...chartAnimationOptions,
          scales: {
            y: { display: false },
            x: { display: false }
          },
          plugins: {
            ...chartAnimationOptions.plugins,
            legend: { display: false }
          }
        }} />
      </div>
    );
  };

  const EducationChart = () => {
    const data = {
      labels: demographicsData.education.chartData.labels,
      datasets: [{
        data: demographicsData.education.chartData.data,
        backgroundColor: demographicsData.education.chartData.colors,
        borderWidth: 0,
      }]
    };

    return (
      <div className="h-32 mt-4">
        <Doughnut data={data} options={{
          ...chartAnimationOptions,
          cutout: '50%',
          plugins: {
            ...chartAnimationOptions.plugins,
            legend: { display: false }
          }
        }} />
      </div>
    );
  };

  const VotersChart = () => {
    const data = {
      labels: demographicsData.voters.chartData.labels,
      datasets: [{
        data: demographicsData.voters.chartData.data,
        backgroundColor: demographicsData.voters.chartData.colors,
        borderWidth: 0,
      }]
    };

    return (
      <div className="h-32 mt-4">
        <Doughnut data={data} options={{
          ...chartAnimationOptions,
          cutout: '60%',
          plugins: {
            ...chartAnimationOptions.plugins,
            legend: { display: false }
          }
        }} />
      </div>
    );
  };

  const HouseholdChart = () => {
    const data = {
      labels: demographicsData.households.chartData.labels,
      datasets: [{
        data: demographicsData.households.chartData.data,
        backgroundColor: demographicsData.households.chartData.colors,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };

    return (
      <div className="h-32 mt-4">
        <Bar data={data} options={{
          ...chartAnimationOptions,
          indexAxis: 'y',
          scales: {
            y: { display: false },
            x: { display: false }
          },
          plugins: {
            ...chartAnimationOptions.plugins,
            legend: { display: false }
          }
        }} />
      </div>
    );
  };



  // Modern demographic cards with enhanced design
  const DemographicCard = ({ icon, title, data, subtitle, trend, children, ChartComponent }) => (
    <motion.div
      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-gray-200 overflow-hidden"
      initial="initial"
      animate="animate"
      variants={cardAnimation}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header */}
      <div className="relative flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
          <Image 
            src={`/resources/${icon}`} 
            alt={title} 
            width={32} 
            height={32}
            className="filter brightness-0 invert"
          />
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{title}</h4>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative">
        <div className="flex items-end gap-3 mb-4">
          <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
        
        {/* Chart */}
        {ChartComponent && startAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <ChartComponent />
          </motion.div>
        )}
        
        {children}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
    </motion.div>
  );



  return (
    <div className="px-4 py-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Real-time insights and analytics</p>
        </div>
        {/* Red Horizontal Line */}
        <div className="w-full h-1 bg-red-300 rounded-full mt-6"></div>
      </div>

      {/* DEMOGRAPHICS SECTION */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Demographics Overview</h3>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Comprehensive population statistics and demographic insights for informed decision-making including PWD, 4Ps, and Solo Parents
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <DemographicCharts />
      </section>

      {/* ANALYTICS SECTION */}
      <section>
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Service Analytics</h3>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Monitor service delivery, track performance metrics, and analyze operational efficiency with interactive filtering
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <AnalyticsCharts />
      </section>
    </div>
  );
}
