import React from "react";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
  return (
    <div className="font-sans bg-gray-50 text-gray-900">
      {/* Header Section */}
      <header className="flex justify-between items-center p-4 bg-white shadow-md animate__animated animate__fadeIn">
        <div className="flex items-center">
          <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-500 via-blue-600 to-blue-950 text-transparent bg-clip-text">
            B-Sphere{" "}
            <span className="text-sm align-middle"></span>
          </h1>
        </div>
        <div className="flex gap-6">
          <Link
            href="/login"
            className="text-blue-500 font-bold transition duration-300 transform hover:scale-105 hover:text-blue-900"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-blue-500 font-bold transition duration-300 transform hover:scale-105 hover:text-blue-900"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16 px-6 text-center bg-cover bg-center h-screen" style={{ backgroundImage: "url('/images/hero_bg2.webp')" }}>
        <h1 className="text-4xl font-bold">Empower Your Barangay with Real-Time Info</h1>
        <p className="mt-4 text-xl">Track residents, manage requests, auto-generate docs</p>
        <div className="mt-6 space-x-4">
          <button className="bg-green-600 px-6 py-2 text-white rounded-lg hover:bg-green-500 transition duration-300">
            Start Free Demo
          </button>
          <button className="bg-transparent border-2 border-white px-6 py-2 text-white rounded-lg hover:bg-white hover:text-blue-600 transition duration-300">
            Watch Video Tour
          </button>
        </div>
      </section>


      {/* Problem Statement */}
      <section className="py-16 px-6 text-center bg-white">
        <h2 className="text-2xl font-semibold">The Problem</h2>
        <p className="mt-4 text-lg">
          Barangays face challenges such as manual records, lost forms, and delays in service delivery.
        </p>
      </section>

      {/* Solution Overview */}
      <section className="py-16 px-6 bg-gray-100">
        <h2 className="text-2xl font-semibold text-center">Our Solution</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold">Resident Master Data</h3>
            <p>Manage resident information in one secure place.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold">Online Service Requests</h3>
            <p>Track and manage service requests online.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold">Document Generation</h3>
            <p>Auto-generate reports, certificates, and documents.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold">Analytics & Reports</h3>
            <p>Get data-driven insights for better decision-making.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white">
        <h2 className="text-2xl font-semibold text-center">How It Works</h2>
        <div className="mt-8 flex justify-center">
          <ol className="space-y-4 text-lg">
            <li>1. Register Residents</li>
            <li>2. Process Requests</li>
            <li>3. Generate Reports & Certificates</li>
          </ol>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 px-6 bg-blue-600 text-white">
        <h2 className="text-2xl font-semibold text-center">Key Benefits</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <h3 className="font-semibold">Faster Response Times</h3>
          </div>
          <div className="text-center">
            <h3 className="font-semibold">Zero Paperwork Lost</h3>
          </div>
          <div className="text-center">
            <h3 className="font-semibold">Data-Driven Planning</h3>
          </div>
          <div className="text-center">
            <h3 className="font-semibold">Secure, Role-Based Access</h3>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-2xl font-semibold">What Our Users Say</h2>
        <p className="mt-6 text-lg">“This system has drastically improved our barangay’s service delivery!” – Barangay Captain Juan</p>
      </section>

      {/* Pricing / Plans */}
      <section className="py-16 px-6 bg-gray-100 text-center">
        <h2 className="text-2xl font-semibold">Pricing Plans</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Basic</h3>
            <p>₱100/mo</p>
            <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg">Get Started</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Pro</h3>
            <p>₱200/mo</p>
            <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg">Get Started</button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p>Custom Pricing</p>
            <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg">Contact Us</button>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-16 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-semibold">Request a Free Trial</h2>
        <form className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg"
          />
          <input
            type="text"
            placeholder="Barangay"
            className="w-full p-3 rounded-lg"
          />
          <select className="w-full p-3 rounded-lg">
            <option>Role</option>
            <option>Barangay Official</option>
            <option>Resident</option>
            <option>NGO</option>
          </select>
          <button className="bg-green-600 px-6 py-2 text-white rounded-lg hover:bg-green-500 transition duration-300">
            Request Free Trial
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-6 text-center">
        <p>&copy; 2025 Barangay Information Management System</p>
        <div className="mt-4 space-x-6">
          <a href="#" className="text-white">About</a>
          <a href="#" className="text-white">Features</a>
          <a href="#" className="text-white">Pricing</a>
          <a href="#" className="text-white">FAQ</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
