"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Vote, Heart, Accessibility, GraduationCap, DollarSign, Family, Baby } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ResidentDashboard({ residents }) {
  const [stats, setStats] = useState({
    totalResidents: 0,
    registeredVoters: 0,
    seniorCitizens: 0,
    pwdResidents: 0,
    tupadBeneficiaries: 0,
    fourPsBeneficiaries: 0,
    soloParents: 0,
    ageDistribution: [],
    educationalAttainment: [],
    programParticipation: []
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

    const programParticipation = {
      'TUPAD': 0,
      'PWD': 0,
      '4Ps': 0,
      'Solo Parent': 0,
    };

    residentsData.forEach(resident => {
      const age = calculateAge(resident.birthdate);
      if (age >= 0 && age <= 17) ageGroups['0-17']++;
      else if (age >= 18 && age <= 30) ageGroups['18-30']++;
      else if (age >= 31 && age <= 45) ageGroups['31-45']++;
      else if (age >= 46 && age <= 60) ageGroups['46-60']++;
      else if (age > 60) ageGroups['60+']++;

      if (resident.educationalAttainment) {
        educationalAttainment[resident.educationalAttainment]++;
      }

      if (resident.isTUPAD) programParticipation['TUPAD']++;
      if (resident.isPWD) programParticipation['PWD']++;
      if (resident.is4Ps) programParticipation['4Ps']++;
      if (resident.isSoloParent) programParticipation['Solo Parent']++;
    });

    setStats({
      totalResidents: residentsData.length,
      registeredVoters: residentsData.filter(r => r.voterStatus === "Registered").length,
      seniorCitizens: residentsData.filter(r => calculateAge(r.birthdate) >= 60).length,
      pwdResidents: residentsData.filter(r => r.isPWD).length,
      tupadBeneficiaries: residentsData.filter(r => r.isTUPAD).length,
      fourPsBeneficiaries: residentsData.filter(r => r.is4Ps).length,
      soloParents: residentsData.filter(r => r.isSoloParent).length,
      ageDistribution: Object.entries(ageGroups).map(([range, count]) => ({ range, count })),
      educationalAttainment: Object.entries(educationalAttainment).map(([level, count]) => ({ level, count })),
      programParticipation: Object.entries(programParticipation).map(([program, count]) => ({ program, count }))
    });
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Users className="text-blue-500" size={24} />
            <h3 className="text-lg font-semibold">Total Residents</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalResidents}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Vote className="text-green-500" size={24} />
            <h3 className="text-lg font-semibold">Registered Voters</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.registeredVoters}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Heart className="text-red-500" size={24} />
            <h3 className="text-lg font-semibold">Senior Citizens</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.seniorCitizens}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Accessibility className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold">PWD Residents</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.pwdResidents}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Number of Residents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Educational Attainment */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Educational Attainment</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.educationalAttainment}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.educationalAttainment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Participation */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Program Participation</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.programParticipation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="program" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Number of Beneficiaries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Additional Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="text-yellow-500" size={20} />
                <h4 className="font-medium">TUPAD Beneficiaries</h4>
              </div>
              <p className="text-xl font-bold mt-2">{stats.tupadBeneficiaries}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Family className="text-pink-500" size={20} />
                <h4 className="font-medium">4Ps Beneficiaries</h4>
              </div>
              <p className="text-xl font-bold mt-2">{stats.fourPsBeneficiaries}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Baby className="text-blue-500" size={20} />
                <h4 className="font-medium">Solo Parents</h4>
              </div>
              <p className="text-xl font-bold mt-2">{stats.soloParents}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 