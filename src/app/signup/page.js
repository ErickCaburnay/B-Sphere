"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { usePathname } from 'next/navigation';

const SignupPage = () => {
  const pathname = usePathname();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-green-900 text-transparent bg-clip-text">
              B-Sphere
            </h1>
            </Link>
          </div>
          {/* <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-green-600 transition duration-300">Home</Link>
            <Link href="/features" className="text-gray-600 hover:text-green-600 transition duration-300">Features</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-green-600 transition duration-300">Pricing</Link>
            <Link href="/contact" className="text-gray-600 hover:text-green-600 transition duration-300">Contact</Link>
          </nav> */}
          <div className="flex gap-4">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                pathname === '/login'
                  ? 'bg-green-700 text-white shadow-md scale-105'
                  : 'text-green-600 hover:text-green-800'
              }`}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                pathname === '/signup'
                  ? 'bg-green-700 text-white shadow-md scale-105'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Signup Form Section with Background */}
      <section className="pt-28 pb-20 px-6 min-h-screen flex items-center justify-center relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bhall.jpg"
            alt="Background"
            fill
            className="object-cover blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Split Panel Signup Form */}
        <div className="max-w-5xl w-full relative z-10" data-aos="fade-up">
          <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 hover:shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_0_3px_rgba(34,197,94,0.4),inset_0_3px_0_rgba(255,255,255,0.5),inset_0_-3px_0_rgba(0,0,0,0.3)] shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_2px_rgba(34,197,94,0.25),inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/15 before:to-transparent before:pointer-events-none relative">
            <div className="flex flex-col md:flex-row min-h-[700px]">
              {/* Left Panel - Branding */}
              <div className="md:w-2/5 bg-gradient-to-br from-green-600/90 to-green-800/90 p-8 flex flex-col justify-center items-center text-center text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                  <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
                </div>
                <h1 className="text-4xl font-extrabold mb-6">B-Sphere</h1>
                <p className="text-white/90 max-w-sm leading-relaxed">
                  Join our comprehensive barangay information management system. 
                  Connect with your community and access essential services with ease.
                </p>
              </div>

              {/* Right Panel - Signup Form */}
              <div className="md:w-3/5 p-8 bg-white/10 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6 text-center text-white">Create your account</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Juan"
                        className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Dela Cruz"
                        className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Middle Name (Optional)</label>
                    <input
                      type="text"
                      name="middleName"
                      placeholder="Santos"
                      className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+63 912 345 6789"
                      className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      className="h-4 w-4 text-green-600 border-white/30 rounded focus:ring-green-500 bg-white/20"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-white/90">
                      I agree to the <Link href="/terms" className="text-green-300 hover:text-green-100 transition duration-300">Terms & Conditions</Link>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition duration-300 shadow-lg"
                  >
                    Sign Up
                  </button>
                </form>
                <p className="mt-4 text-center text-white/90 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-green-300 hover:text-green-100 transition duration-300">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignupPage;
