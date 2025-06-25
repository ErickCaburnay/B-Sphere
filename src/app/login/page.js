'use client';

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { usePathname } from 'next/navigation';

const LoginPage = () => {
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
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-green-900 text-transparent bg-clip-text">
              B-Sphere
            </h1>
          </Link>
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
                    : 'text-green-600 hover:text-green-800' // match "Log In" inactive state
                }`}
                >
                Sign Up
                </Link>
          </div>
        </div>
      </header>

      {/* Login Form Section with Background */}
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
        
        {/* Split Panel Login Form */}
        <div className="max-w-4xl w-full relative z-10" data-aos="fade-up">
          <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-[0_35px_80px_rgba(0,0,0,0.6),0_0_0_2px_rgba(34,197,94,0.3),inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.2)] shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(34,197,94,0.2),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none relative">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Left Panel - Branding */}
              <div className="md:w-1/2 bg-gradient-to-br from-green-600/90 to-green-800/90 p-8 flex flex-col justify-center items-center text-center text-white">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                  <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to</h2>
                <h1 className="text-4xl font-extrabold mb-6">B-Sphere</h1>
                <p className="text-white/90 max-w-sm leading-relaxed">
                  Your comprehensive barangay information management system. 
                  Streamline your community services and stay connected with your local government.
                </p>
              </div>

              {/* Right Panel - Login Form */}
              <div className="md:w-1/2 p-8 bg-white/10 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-6 text-center text-white">Welcome Back</h3>
                <form className="space-y-4">
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
                    <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 text-green-600 border-white/30 rounded focus:ring-green-500 bg-white/20"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-white/90">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-green-300 hover:text-green-100 transition duration-300">
                      Forgot Password?
                    </Link>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition duration-300 shadow-lg"
                  >
                    Log In
                  </button>
                </form>
                <p className="mt-4 text-center text-white/90 text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-green-300 hover:text-green-100 transition duration-300">
                    Sign Up
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

export default LoginPage;
