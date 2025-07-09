"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { usePathname } from 'next/navigation';

const SignupPage = () => {
  const pathname = usePathname();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [canAcceptTerms, setCanAcceptTerms] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    birthdate: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= 0.95) { // 95% scrolled
      setCanAcceptTerms(true);
    }
  };

  const handleAcceptTerms = () => {
    setHasReadTerms(true);
    setShowTermsModal(false);
  };

  const handleTermsCheckbox = () => {
    if (!hasReadTerms) {
      setShowTermsModal(true);
    } else {
      setIsTermsAccepted(!isTermsAccepted);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.birthdate.trim()) {
      newErrors.birthdate = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || (age === 13 && today < new Date(birthDate.setFullYear(birthDate.getFullYear() + 13)))) {
        newErrors.birthdate = 'You must be at least 13 years old';
      }
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!isTermsAccepted) {
      newErrors.terms = 'You must accept the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            middleName: formData.middleName,
            email: formData.email,
            phone: formData.phone,
            birthdate: formData.birthdate,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Success - store user data and redirect to resident dashboard
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token || 'temp-token');
          alert('Account created successfully! Welcome to B-Sphere.');
          window.location.href = '/resident-dashboard';
        } else {
          // Error - show error message
          setErrors({ submit: data.error || 'Failed to create account' });
        }
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

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
        <div className="max-w-4xl w-full relative z-10" data-aos="fade-up">
          <div className="bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 hover:shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_0_3px_rgba(34,197,94,0.4),inset_0_3px_0_rgba(255,255,255,0.5),inset_0_-3px_0_rgba(0,0,0,0.3)] shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_2px_rgba(34,197,94,0.25),inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-2px_0_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/15 before:to-transparent before:pointer-events-none relative">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Left Panel - Branding */}
              <div className="md:w-1/2 bg-gradient-to-br from-green-600/90 to-green-800/90 p-8 flex flex-col justify-center items-center text-center text-white">
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
              <div className="md:w-1/2 p-8 bg-white/10 backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="relative w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <div className="absolute -inset-1 bg-green-400/60 rounded-full animate-pulse blur-sm"></div>
                    <div className="absolute -inset-2 bg-green-400/40 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-green-500/50 rounded-full animate-pulse"></div>
                    <Image src="/resources/resident.png" alt="Resident" width={16} height={16} className="relative z-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Create your account</h3>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Juan"
                        className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                          errors.firstName ? 'border-red-500' : 'border-white/30'
                        }`}
                      />
                      {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Dela Cruz"
                        className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                          errors.lastName ? 'border-red-500' : 'border-white/30'
                        }`}
                      />
                      {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Middle Name (Optional)</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      placeholder="Santos"
                      className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                        errors.email ? 'border-red-500' : 'border-white/30'
                      }`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0921 234 5678"
                      onInput={(e) => {
                        const numbers = e.target.value.replace(/\D/g, '');
                        let formatted = '';
                        
                        if (numbers.length > 11) {
                          e.target.value = e.target.value.slice(0, -1);
                          return;
                        }
                        
                        if (numbers.length > 0) {
                          if (numbers.length <= 4) {
                            formatted = numbers;
                          } else if (numbers.length <= 7) {
                            formatted = `${numbers.substring(0, 4)} ${numbers.substring(4)}`;
                          } else {
                            formatted = `${numbers.substring(0, 4)} ${numbers.substring(4, 7)} ${numbers.substring(7, 11)}`;
                          }
                        }
                        
                        e.target.value = formatted;
                      }}
                      onKeyDown={(e) => {
                        // Allow backspace, delete, tab, escape, enter, arrow keys
                        if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
                          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                          (e.keyCode === 65 && e.ctrlKey === true) ||
                          (e.keyCode === 67 && e.ctrlKey === true) ||
                          (e.keyCode === 86 && e.ctrlKey === true) ||
                          (e.keyCode === 88 && e.ctrlKey === true) ||
                          // Allow home, end
                          (e.keyCode >= 35 && e.keyCode <= 36)) {
                          return;
                        }
                        // Ensure that it is a number and stop the keypress
                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                        errors.phone ? 'border-red-500' : 'border-white/30'
                      }`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Birth Date *</label>
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                      className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                        errors.birthdate ? 'border-red-500' : 'border-white/30'
                      }`}
                    />
                    {errors.birthdate && <p className="text-red-400 text-xs mt-1">{errors.birthdate}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                            errors.password ? 'border-red-500' : 'border-white/30'
                          }`}
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
                      {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
                            errors.confirmPassword ? 'border-red-500' : 'border-white/30'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                        >
                          <Image
                            src={showConfirmPassword ? "/resources/eye_slash_icon_white.jpg" : "/resources/eye_icon_white.jpg"}
                            alt={showConfirmPassword ? "Hide password" : "Show password"}
                            width={20}
                            height={20}
                            className="opacity-70 hover:opacity-100 transition-opacity"
                          />
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={isTermsAccepted}
                      onChange={handleTermsCheckbox}
                      className="h-4 w-4 text-green-600 border-white/30 rounded focus:ring-green-500 bg-white/20 mt-1"
                    />
                    <div className="ml-2 flex-1">
                      <label htmlFor="terms" className="text-sm text-white/90 cursor-pointer">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-green-300 hover:text-green-100 transition duration-300 underline"
                        >
                          Terms & Conditions
                        </button>
                      </label>
                      {errors.terms && <p className="text-red-400 text-xs mt-1">{errors.terms}</p>}
                    </div>
                  </div>
                  {errors.submit && (
                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-medium transition duration-300 shadow-lg ${
                      isSubmitting
                        ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    }`}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Sign Up'}
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

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">Terms and Conditions</h2>
            </div>
            <div 
              className="flex-1 overflow-y-auto p-6 text-white/90 text-sm leading-relaxed"
              onScroll={handleTermsScroll}
            >
              <div className="space-y-4">
                <p className="text-white/70 text-xs">Last Updated: {new Date().toLocaleDateString()}</p>
                
                <p>
                  These Terms and Conditions ("Terms") govern your access to and use of the Barangay Information Management System (BIMS), 
                  a web application operated and managed by the Barangay [Insert Name], [Insert City/Municipality/Province], Philippines 
                  ("Barangay", "we", "us", or "our").
                </p>

                <p>
                  By creating an account, accessing, or using the System, you agree to be bound by these Terms. If you do not agree with 
                  any part of these Terms, you must not use the System.
                </p>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">1. Definitions</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>System</strong> – Refers to the Barangay Information Management System (BIMS), including all related pages, databases, services, and functionalities.</li>
                    <li><strong>User</strong> – Any individual who registers and accesses the System, including residents, staff, and barangay officials.</li>
                    <li><strong>Resident</strong> – A user who resides within the jurisdiction of the Barangay.</li>
                    <li><strong>Admin Roles</strong> – Refers to super-admin, admin, sub-admin, and staff who are authorized to manage modules within the System.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">2. Eligibility and User Registration</h3>
                  <p><strong>2.1</strong> Only individuals who are:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Residents of the barangay, or</li>
                    <li>Authorized barangay officials and personnel</li>
                  </ul>
                  <p>are permitted to use this System.</p>
                  
                  <p><strong>2.2</strong> During registration, you agree to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Provide accurate, complete, and current information.</li>
                    <li>Not impersonate or misrepresent any affiliation with a person or entity.</li>
                  </ul>
                  
                  <p><strong>2.3</strong> Residents are strictly prohibited from registering accounts under administrative roles (e.g., admin, staff, sub-admin) unless explicitly authorized by the Barangay.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">3. User Roles and Access</h3>
                  <p><strong>3.1</strong> The System supports role-based access. Access permissions and functionalities vary depending on the role assigned:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Super Admin</strong> – Full system access, including configuration and user management.</li>
                    <li><strong>Admin</strong> – Access to manage residents, requests, and reports within their assigned barangay.</li>
                    <li><strong>Sub-Admin/Staff</strong> – Module-specific access (e.g., document processing, complaints).</li>
                    <li><strong>Resident</strong> – Access limited to personal data management, document requests, and notifications.</li>
                  </ul>
                  
                  <p><strong>3.2</strong> Unauthorized attempts to elevate role privileges or access restricted areas of the System may result in account suspension or legal action.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">4. Account Security</h3>
                  <p><strong>4.1</strong> You are responsible for maintaining the confidentiality of your account credentials.</p>
                  <p><strong>4.2</strong> You agree to notify the Barangay immediately of any unauthorized access or suspected breach of security.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">5. Data Privacy and Usage</h3>
                  <p><strong>5.1</strong> The System complies with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines.</p>
                  
                  <p><strong>5.2</strong> Collected information will be used solely for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Processing official barangay transactions</li>
                    <li>Validating user identity</li>
                    <li>Service delivery and reporting</li>
                  </ul>
                  
                  <p><strong>5.3</strong> Personal data shall not be shared with third parties without prior consent, unless required by law or a legitimate government function.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">6. Acceptable Use</h3>
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Use the System for any unlawful purpose</li>
                    <li>Submit false, fraudulent, or misleading information</li>
                    <li>Interfere with or disrupt the integrity or performance of the System</li>
                    <li>Attempt to gain unauthorized access to any part of the System</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">7. Termination and Suspension</h3>
                  <p>We reserve the right to suspend or terminate your account:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>If you violate any of these Terms</li>
                    <li>If your access is no longer authorized (e.g., separation from barangay office)</li>
                    <li>For any conduct deemed inappropriate or harmful to the System or its users</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">8. Modifications</h3>
                  <p>We may revise these Terms at any time. Updates will be posted on the System, and continued use after changes constitutes acceptance of the new Terms.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">9. Limitation of Liability</h3>
                  <p>The Barangay is not liable for any:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Loss or corruption of data</li>
                    <li>Unauthorized access or use of accounts</li>
                    <li>System downtime or unavailability</li>
                    <li>Indirect or consequential damages arising from the use of the System</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">10. Governing Law</h3>
                  <p>These Terms shall be governed and interpreted under the laws of the Republic of the Philippines. Any disputes shall be subject to the jurisdiction of the proper courts in [Insert City/Municipality].</p>
                </div>

                <div className="border-t border-white/20 pt-4 mt-6">
                  <p className="font-semibold text-white">
                    By registering or using this System, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/20 flex justify-between items-center">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 text-white/70 hover:text-white transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptTerms}
                disabled={!canAcceptTerms}
                className={`px-6 py-2 rounded-lg font-medium transition duration-300 ${
                  canAcceptTerms
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                    : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                {canAcceptTerms ? 'OK' : 'Scroll to bottom to continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
