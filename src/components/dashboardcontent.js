"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { demographicsData, analyticsData, formatNumber, calculatePercentage } from "@/lib/mockData";

export default function DashboardSections() {
  const [chartsInitialized, setChartsInitialized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Memoize the card animation to prevent recreation on every render
  const cardAnimation = useMemo(() => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }), []);

  // Optimize date initialization with useCallback
  const initializeDate = useCallback(() => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const dateElement = document.getElementById("current-date");
    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString("en-US", options);
    }
  }, []);

  useEffect(() => {
    initializeDate();
    setIsVisible(true);
    setChartsInitialized(true);
  }, [initializeDate]);

  // Modern demographic cards with enhanced design
  const DemographicCard = ({ icon, title, data, subtitle, trend, children }) => (
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
            {formatNumber(data.total)}
          </span>
          {trend && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={`text-xs ${trend.isPositive ? '↗' : '↘'}`}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {trend.value}%
            </div>
          )}
        </div>
        
        {children}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
    </motion.div>
  );

  // Modern analytics cards with enhanced design
  const AnalyticsCard = ({ icon, title, data, subtitle, extraInfo, children }) => (
    <motion.div
      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-gray-200 overflow-hidden"
      initial="initial"
      animate="animate"
      variants={cardAnimation}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header */}
      <div className="relative flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
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
          <span className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {formatNumber(data.total)}
          </span>
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            <span className="text-xs">📈</span>
            +{formatNumber(data.thisMonth)} this month
          </div>
        </div>
        
        {extraInfo && (
          <div className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            {extraInfo}
          </div>
        )}
        
        {children}
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
    </motion.div>
  );

  // Stats component for displaying breakdown data
  const StatsGrid = ({ data, colors }) => (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {Object.entries(data).map(([key, value], index) => (
        <div key={key} className="flex items-center gap-2 p-3 bg-white/70 rounded-xl border border-gray-100">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: colors[index] || '#6B7280' }}
          ></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 capitalize truncate">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="text-sm font-bold text-gray-800">{formatNumber(value)}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="px-4 py-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-500 mt-2">Real-time insights and analytics</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <p id="current-date" className="text-sm text-gray-600"></p>
          </div>
        </div>
      </div>

      {/* DEMOGRAPHICS SECTION */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Demographics Overview</h3>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Comprehensive population statistics and demographic insights for informed decision-making
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Population Overview */}
          <DemographicCard
            icon="population.png"
            title="Population Overview"
            subtitle="Total registered residents"
            data={demographicsData.population}
            trend={{ value: demographicsData.population.growth, isPositive: true }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(demographicsData.population.male)}</p>
                <p className="text-sm text-blue-500">Male</p>
                <p className="text-xs text-gray-500">{calculatePercentage(demographicsData.population.male, demographicsData.population.total)}%</p>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-2xl border border-pink-100">
                <p className="text-2xl font-bold text-pink-600">{formatNumber(demographicsData.population.female)}</p>
                <p className="text-sm text-pink-500">Female</p>
                <p className="text-xs text-gray-500">{calculatePercentage(demographicsData.population.female, demographicsData.population.total)}%</p>
              </div>
            </div>
          </DemographicCard>

          {/* Age Distribution */}
          <DemographicCard
            icon="senior.png"
            title="Age Distribution"
            subtitle="Population by age groups"
            data={demographicsData.ageDistribution}
          >
            <StatsGrid 
              data={demographicsData.ageDistribution.groups} 
              colors={demographicsData.ageDistribution.chartData.colors}
            />
          </DemographicCard>

          {/* Education Levels */}
          <DemographicCard
            icon="educ-icon.png"
            title="Education Levels"
            subtitle="Educational attainment"
            data={demographicsData.education}
          >
            <StatsGrid 
              data={demographicsData.education.levels} 
              colors={demographicsData.education.chartData.colors}
            />
          </DemographicCard>

          {/* Voter Registration */}
          <DemographicCard
            icon="fingerprint.png"
            title="Voter Registration"
            subtitle="Eligible voter statistics"
            data={demographicsData.voters}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-2xl font-bold text-green-600">{formatNumber(demographicsData.voters.registered)}</p>
                <p className="text-sm text-green-500">Registered</p>
                <p className="text-xs text-gray-500">{demographicsData.voters.registrationRate}%</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-2xl font-bold text-red-600">{formatNumber(demographicsData.voters.unregistered)}</p>
                <p className="text-sm text-red-500">Unregistered</p>
                <p className="text-xs text-gray-500">{calculatePercentage(demographicsData.voters.unregistered, demographicsData.voters.total)}%</p>
              </div>
            </div>
          </DemographicCard>

          {/* Household Statistics */}
          <DemographicCard
            icon="household.png"
            title="Household Statistics"
            subtitle="Family composition data"
            data={demographicsData.households}
          >
            <div className="mb-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
              <p className="text-2xl font-bold text-orange-600">{demographicsData.households.averageSize}</p>
              <p className="text-sm text-orange-500">Average Household Size</p>
            </div>
            <StatsGrid 
              data={demographicsData.households.types} 
              colors={demographicsData.households.chartData.colors}
            />
          </DemographicCard>
        </div>
      </section>

      {/* ANALYTICS SECTION */}
      <section>
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Service Analytics</h3>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Monitor service delivery, track performance metrics, and analyze operational efficiency
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
          {/* Document Services */}
          <AnalyticsCard
            icon="doc-icon.png"
            title="Document Services"
            subtitle="Document processing overview"
            data={analyticsData.documents}
            extraInfo={
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{formatNumber(analyticsData.documents.status.approved)}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-600">{formatNumber(analyticsData.documents.status.processing)}</p>
                  <p className="text-xs text-gray-500">Processing</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-600">{formatNumber(analyticsData.documents.status.pending)}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600">{formatNumber(analyticsData.documents.status.rejected)}</p>
                  <p className="text-xs text-gray-500">Rejected</p>
                </div>
              </div>
            }
          >
            <StatsGrid 
              data={analyticsData.documents.types} 
              colors={analyticsData.documents.chartData.types.colors}
            />
          </AnalyticsCard>

          {/* Complaints Management */}
          <AnalyticsCard
            icon="complaint-icon.png"
            title="Complaints Management"
            subtitle="Issue resolution tracking"
            data={analyticsData.complaints}
            extraInfo={
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{analyticsData.complaints.avgResolutionTime}</p>
                  <p className="text-sm text-gray-500">Avg. Resolution Days</p>
                </div>
                <div className="grid grid-cols-3 gap-3 flex-1 ml-6">
                  <div className="text-center p-2 bg-green-50 rounded-xl">
                    <p className="text-sm font-bold text-green-600">{formatNumber(analyticsData.complaints.status.resolved)}</p>
                    <p className="text-xs text-gray-500">Resolved</p>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded-xl">
                    <p className="text-sm font-bold text-yellow-600">{formatNumber(analyticsData.complaints.status.pending)}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-xl">
                    <p className="text-sm font-bold text-blue-600">{formatNumber(analyticsData.complaints.status.inProgress)}</p>
                    <p className="text-xs text-gray-500">In Progress</p>
                  </div>
                </div>
              </div>
            }
          >
            <StatsGrid 
              data={analyticsData.complaints.categories} 
              colors={analyticsData.complaints.chartData.categories.colors}
            />
          </AnalyticsCard>

          {/* Social Services */}
          <AnalyticsCard
            icon="social-welfare.png"
            title="Social Services"
            subtitle="Community assistance programs"
            data={analyticsData.socialServices}
            extraInfo={
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600">{formatNumber(analyticsData.socialServices.beneficiaries.active)}</p>
                  <p className="text-sm text-gray-500">Active Beneficiaries</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-500">{formatNumber(analyticsData.socialServices.beneficiaries.inactive)}</p>
                  <p className="text-sm text-gray-400">Inactive</p>
                </div>
              </div>
            }
          >
            <StatsGrid 
              data={analyticsData.socialServices.programs} 
              colors={analyticsData.socialServices.chartData.programs.colors}
            />
          </AnalyticsCard>
        </div>
      </section>
    </div>
  );
}
