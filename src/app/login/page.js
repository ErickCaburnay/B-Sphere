'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { usePathname, useRouter } from 'next/navigation';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
// Firebase imports removed - using API-based authentication instead

const LoginPage = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [userType, setUserType] = useState(null); // null, 'resident', or 'admin'
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setError(''); // Clear any previous errors
  };

  const handleBackToSelection = () => {
    setUserType(null);
    setFormData({ email: '', password: '' });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Login page - Starting login process');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: userType
        }),
      });

      console.log('Login page - Login response:', {
        status: response.status,
        ok: response.ok
      });

      const data = await response.json();
      console.log('Login page - Login data received:', {
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        userType: data.userType
      });

      if (data.success) {
        // Store user data and token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', data.userType);
        
        console.log('Login page - Data stored in localStorage:', {
          token: localStorage.getItem('token') ? 'stored' : 'missing',
          user: localStorage.getItem('user') ? 'stored' : 'missing',
          userType: localStorage.getItem('userType') ? 'stored' : 'missing'
        });

        // Set cookie for middleware
        document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        
        console.log('Login page - Cookie set:', {
          hasCookie: document.cookie.includes('token=')
        });

        // Redirect based on user type
        if (data.userType === 'admin') {
          console.log('Login page - Redirecting to admin dashboard');
          router.push('/dashboard');
        } else {
          console.log('Login page - Redirecting to resident dashboard');
          router.push('/resident-dashboard');
        }
      } else {
        console.error('Login page - Login failed:', data.error);
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login page - Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setResetMessage('');

    try {
      // Use Firebase Auth for password reset (this still works for residents)
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const { db } = await import('@/lib/firebase');
      const auth = getAuth();
      
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent. Please check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please check the email address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* Loading Animation */}
      {isLoading && <LoadingAnimation message="Signing you in..." />}
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

              {/* Right Panel - User Type Selection or Login Form */}
              <div className="md:w-1/2 p-8 bg-white/10 backdrop-blur-sm">
                {!userType ? (
                  // User Type Selection
                  <div className="flex flex-col justify-center h-full">
                    <h3 className="text-2xl font-bold mb-8 text-center text-white">Choose Login Type</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => handleUserTypeSelect('resident')}
                        className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition duration-300 flex items-center justify-start gap-3 group"
                      >
                        <div className="relative w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:bg-green-500/30 transition duration-300">
                          <div className="absolute -inset-1 bg-green-400/60 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                          <div className="absolute -inset-2 bg-green-400/40 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 bg-green-500/50 rounded-full animate-pulse opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                          <Image src="/resources/resident.png" alt="Resident" width={24} height={24} className="relative z-10" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">Resident Login</div>
                          <div className="text-sm text-white/70">Access resident services and information</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleUserTypeSelect('admin')}
                        className="w-full p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition duration-300 flex items-center justify-start gap-3 group"
                      >
                        <div className="relative w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition duration-300">
                          <div className="absolute -inset-1 bg-blue-400/60 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                          <div className="absolute -inset-2 bg-blue-400/40 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 bg-blue-500/50 rounded-full animate-pulse opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                          <Image src="/resources/settings.png" alt="Admin" width={24} height={24} className="relative z-10" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-lg">Admin Login</div>
                          <div className="text-sm text-white/70">Access administrative dashboard</div>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Login Form
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={handleBackToSelection}
                        className="text-white/70 hover:text-white transition duration-300 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <div className="flex items-center gap-2">
                        <div className={`relative w-3 h-3 rounded-full ${userType === 'resident' ? 'bg-green-500' : 'bg-blue-500'}`}>
                          <div className={`absolute -inset-1 rounded-full animate-pulse blur-sm ${userType === 'resident' ? 'bg-green-400/80' : 'bg-blue-400/80'}`}></div>
                          <div className={`absolute -inset-2 rounded-full animate-ping ${userType === 'resident' ? 'bg-green-400/60' : 'bg-blue-400/60'}`}></div>
                          <div className={`absolute inset-0 rounded-full animate-pulse ${userType === 'resident' ? 'bg-green-500/70' : 'bg-blue-500/70'}`}></div>
                        </div>
                        <span className="text-white/90 text-sm capitalize">{userType} Login</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-6 text-center text-white">
                      {userType === 'resident' ? 'Resident Login' : 'Admin Login'}
                    </h3>
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-100 text-sm">
                        {error}
                      </div>
                    )}
                    
                    {resetMessage && (
                      <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-100 text-sm">
                        {resetMessage}
                      </div>
                    )}
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                          >
                            <Image
                              src={showPassword ? "/resources/eye_slash_icon_white.jpg" : "/resources/eye_icon_white.jpg"}
                              alt={showPassword ? "Hide password" : "Show password"}
                              width={20}
                              height={20}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                            />
                          </button>
                        </div>
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
                        {userType === 'resident' && (
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-green-300 hover:text-green-100 transition duration-300"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 text-white rounded-lg font-medium transition duration-300 shadow-lg ${
                          isLoading 
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : userType === 'resident' 
                              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                        }`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Logging in...
                          </div>
                        ) : (
                          `Log In as ${userType === 'resident' ? 'Resident' : 'Admin'}`
                        )}
                      </button>
                    </form>
                    <p className="mt-4 text-center text-white/90 text-sm">
                      Don't have an account?{' '}
                      <Link href="/signup" className="text-green-300 hover:text-green-100 transition duration-300">
                        Sign Up
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Reset Password</h3>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isLoading || !resetEmail}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition duration-300"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
