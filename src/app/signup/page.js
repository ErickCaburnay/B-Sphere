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
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-950 text-transparent bg-clip-text">
              B-Sphere
            </h1>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition duration-300">Home</Link>
            <Link href="/features" className="text-gray-600 hover:text-blue-600 transition duration-300">Features</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition duration-300">Pricing</Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition duration-300">Contact</Link>
          </nav>
          <div className="flex gap-4">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                pathname === '/login'
                  ? 'bg-blue-700 text-white shadow-md scale-105'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className={`px-4 py-2 rounded-lg font-medium transition duration-300 ${
                pathname === '/signup'
                  ? 'bg-blue-700 text-white shadow-md scale-105'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Signup Form Section */}
      <section className="pt-28 pb-20 px-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg" data-aos="fade-up">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Juan Dela Cruz"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default SignupPage;
