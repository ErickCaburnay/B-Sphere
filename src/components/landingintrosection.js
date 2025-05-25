"use client";

import { CheckCircle } from "lucide-react";

const LandingIntroSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-green-700 to-blue-900 text-white" id="welcome">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Intro Content */}
          <div data-aos="fade-right">
            <span className="text-green-200 font-medium">Welcome to BIMS</span>
            <h2 className="text-3xl font-bold mt-2 mb-6">Barangay Information Management System</h2>
            <p className="text-lg opacity-90 mb-6">
              BIMS is your digital portal to barangay services. Easily request documents, update personal records,
              submit concerns, and stay informed with community projects — all in one place.
            </p>

            <div className="space-y-4">
              <FeatureCard
                title="Document Requests"
                description="Apply for Barangay Certificates, Clearances, Indigency letters and more online."
                bgColor="bg-blue-600"
              />
              <FeatureCard
                title="Resident Records"
                description="Update your personal data and view your household profile with ease."
                bgColor="bg-green-600"
              />
              <FeatureCard
                title="Community Updates"
                description="Stay informed with latest projects, emergency alerts, and barangay events."
                bgColor="bg-yellow-500"
              />
            </div>
          </div>

          {/* Right: Request Access Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden" data-aos="fade-left">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Resident Access</h3>
              <form className="space-y-4">
                <FormInput label="Full Name" type="text" placeholder="Juan Dela Cruz" />
                <FormInput label="Barangay Zone / Purok" type="text" placeholder="Purok 4, Barangay Maunlad" />
                <FormInput label="Email Address" type="email" placeholder="you@example.com" />
                <FormInput label="Phone Number" type="tel" placeholder="+63 XXX XXX XXXX" />

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition duration-300 mt-4"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ title, description, bgColor }) => (
  <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
    <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
      <CheckCircle size={20} />
    </div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  </div>
);

const FormInput = ({ label, type, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
    />
  </div>
);

export default LandingIntroSection;
