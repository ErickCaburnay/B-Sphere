"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function DashboardSections() {
  useEffect(() => {
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

  const cardAnimation = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="px-4 py-6 bg-gradient-to-b from-green-300 to-white min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Dashboard</h2>
      <div className="h-1 bg-red-300 w-full mb-6"></div>

      {/* DEMOGRAPHICS SECTION */}
      <section className="mb-16">
        <h3 className="text-2xl text-center font-semibold mb-6 text-gray-700">Demographics</h3>
        <div className="flex flex-wrap gap-6 justify-center">
          {[
            { id: "genderChart", icon: "population.png", title: "Population Overview", totalId: "totalPopulation", label: "Total Residents" },
            { id: "ageDistributionChart", icon: "senior.png", title: "Age Overview", totalId: "totalAgeGroup", label: "Total Users" },
            { id: "educationChart", icon: "educ-icon.png", title: "Education", totalId: "totalEducation", label: "Total Records" },
            { id: "votersChart", icon: "fingerprint.png", title: "Voter Overview", totalId: "totalVoters", label: "Total Eligible Voters" },
            { id: "householdChart", icon: "household.png", title: "Household", totalId: "totalHouseholds", label: "Total Households" }
          ].map(({ id, icon, title, totalId, label }) => (
            <motion.div
              key={id}
              className="bg-white/80 rounded-2xl shadow-xl p-6 w-full sm:w-[45%] lg:w-[30%] hover:shadow-2xl transition-shadow duration-300"                
              initial="initial"
              animate="animate"
              variants={cardAnimation}
            >
              <div className="flex items-center gap-4 mb-4">
                <Image src={`/resources/${icon}`} alt={title} width={40} height={40} />
                <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
              </div>
              <div className="text-center">
                <p id={totalId} className="text-3xl font-bold text-green-600">Loading...</p>
                <p className="text-gray-500">{label}</p>
              </div>
              <canvas id={id} className="w-full h-40 mt-4"></canvas>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ANALYTICS SECTION */}
      <section>
        <div className="h-1 bg-red-300 w-full mb-6"></div>
        <div className="h-1 bg-blue-green w-full mb-6"></div>
        <h3 className="text-2xl text-center font-semibold mb-6 text-gray-700">Analytics</h3>
        <div className="flex flex-wrap gap-6 justify-center">
          {[
            {
              id: "documentStatusChart",
              icon: "doc-icon.png",
              title: "Document Overview",
              extra: <>
                <p className="text-gray-600">Total Documents:</p>
                <p id="documentCount" className="text-xl font-bold text-green-600">Loading...</p>
              </>
            },
            {
              id: "documentPurposeChart",
              icon: "doc_icon.png",
              title: "Document Purposes"
            },
            {
              id: "complaintsStatusChart",
              icon: "complaint-icon.png",
              title: "Complaints Overview",
              extra: <>
                <p className="text-gray-600">Avg. Resolution Time</p>
                <p id="avgResolutionTime" className="text-xl font-bold text-green-600">Loading...</p>
              </>
            },
            {
              id: "socialServicesChart",
              icon: "social-welfare.png",
              title: "Social Services"
            }
          ].map(({ id, icon, title, extra }) => (
            <motion.div
              key={id}
              className="bg-white/80 rounded-2xl shadow-xl p-6 w-full sm:w-[45%] lg:w-[30%] hover:shadow-2xl transition-shadow duration-300"
              initial="initial"
              animate="animate"
              variants={cardAnimation}
            >
              <div className="flex items-center gap-4 mb-4">
                <Image src={`/resources/${icon}`} alt={title} width={40} height={40} />
                <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
              </div>
              <canvas id={id} className="w-full h-40"></canvas>
              {extra && <div className="text-center mt-4">{extra}</div>}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
