"use client";

import { useState, useEffect } from 'react';
import { Users, Vote, Heart, Accessibility, GraduationCap, DollarSign, Family, Baby } from 'lucide-react';

export function ResidentStats({ residents }) {
  const [stats, setStats] = useState({
    totalResidents: 0,
    registeredVoters: 0,
    seniorCitizens: 0,
    pwdResidents: 0,
    tupadBeneficiaries: 0,
    fourPsBeneficiaries: 0,
    soloParents: 0,
    ageDistribution: [],
    educationalAttainment: []
  });

  useEffect(() => {
    if (residents && residents.length > 0) {
      calculateStats(residents);
    }
  }, [residents]);

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

  const calculateStats = (residentsData) => {
    let totalResidents = residentsData.length;
    let registeredVoters = 0;
    let seniorCitizens = 0;
    let pwdResidents = 0;
    let tupadBeneficiaries = 0;
    let fourPsBeneficiaries = 0;
    let soloParents = 0;

    const ageGroups = {
      '0-17': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0,
    };

    const educationalAttainment = {
      'No Formal Education': 0,
      'Elementary': 0,
      'High School': 0,
      'Vocational': 0,
      'College': 0,
      'Post Graduate': 0,
    };

    residentsData.forEach(resident => {
      if (resident.isVoter) registeredVoters++;
      if (resident.isSeniorCitizen) seniorCitizens++;
      if (resident.isPwd) pwdResidents++;
      if (resident.isTupad) tupadBeneficiaries++;
      if (resident.is4Ps) fourPsBeneficiaries++;
      if (resident.isSoloParent) soloParents++;

      const age = calculateAge(resident.birthdate);
      if (age >= 0 && age <= 17) ageGroups['0-17']++;
      else if (age >= 18 && age <= 30) ageGroups['18-30']++;
      else if (age >= 31 && age <= 45) ageGroups['31-45']++;
      else if (age >= 46 && age <= 60) ageGroups['46-60']++;
      else if (age > 60) ageGroups['60+']++;

      if (resident.educationalAttainment && educationalAttainment[resident.educationalAttainment] !== undefined) {
        educationalAttainment[resident.educationalAttainment]++;
      }
    });

    setStats({
      totalResidents,
      registeredVoters,
      seniorCitizens,
      pwdResidents,
      tupadBeneficiaries,
      fourPsBeneficiaries,
      soloParents,
      ageDistribution: Object.entries(ageGroups).map(([range, count]) => ({ range, count })),
      educationalAttainment: Object.entries(educationalAttainment).map(([level, count]) => ({ level, count })),
    });
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

  const ProgressBar = ({ label, value, maxValue, colorClass }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <div className="mb-2">
        <div className="flex justify-between items-center text-sm text-gray-700">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div
            className={`h-2.5 rounded-full ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const maxAgeGroupCount = Math.max(...stats.ageDistribution.map(item => item.count), 0);
  const maxEducationCount = Math.max(...stats.educationalAttainment.map(item => item.count), 0);

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Residents"
          value={stats.totalResidents}
          icon={<Users size={24} />}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Registered Voters"
          value={stats.registeredVoters}
          icon={<Vote size={24} />}
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard
          title="Senior Citizens"
          value={stats.seniorCitizens}
          icon={<Heart size={24} />}
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="PWD Residents"
          value={stats.pwdResidents}
          icon={<Accessibility size={24} />}
          colorClass="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="TUPAD Beneficiaries"
          value={stats.tupadBeneficiaries}
          icon={<DollarSign size={24} />}
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="4Ps Beneficiaries"
          value={stats.fourPsBeneficiaries}
          icon={<Family size={24} />}
          colorClass="bg-pink-100 text-pink-600"
        />
        <StatCard
          title="Solo Parents"
          value={stats.soloParents}
          icon={<Baby size={24} />}
          colorClass="bg-red-100 text-red-600"
        />
      </div>

      {/* Age Distribution & Educational Attainment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <div>
            {stats.ageDistribution.map(item => (
              <ProgressBar
                key={item.range}
                label={item.range}
                value={item.count}
                maxValue={maxAgeGroupCount}
                colorClass="bg-blue-500"
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Attainment</h3>
          <div>
            {stats.educationalAttainment.map(item => (
              <ProgressBar
                key={item.level}
                label={item.level}
                value={item.count}
                maxValue={maxEducationCount}
                colorClass="bg-green-500"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 