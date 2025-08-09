"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { 
  CheckCircle, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Upload, 
  FileText, 
  X, 
  Download, 
  Trash2,
  AlertCircle,
  Phone,
  Mail,
  Clock,
  ArrowLeft
} from "lucide-react";

import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Use centralized Firebase config
import { sendProductionOTP, verifyProductionOTP, cleanupExpiredOTPs } from '@/lib/productionOTP';
import EmailPerformanceMonitor from '@/components/ui/EmailPerformanceMonitor';

const steps = [
  { id: 0, label: "Account Info", icon: "👤" },
  { id: 1, label: "OTP Verification", icon: "🔐" },
  { id: 2, label: "Personal Info", icon: "📋" },
];

// Step 1: Account Information Component
const Step1Account = ({ data, setData, onNext, errors, setErrors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // Use refs to maintain stable references
  const setDataRef = useRef(setData);
  const setErrorsRef = useRef(setErrors);
  
  // Update refs when props change
  useEffect(() => {
    setDataRef.current = setData;
    setErrorsRef.current = setErrors;
  }, [setData, setErrors]);

  // Simple input handler - no error clearing during typing
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setDataRef.current(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle error clearing on blur instead of during typing
  const handleInputBlur = useCallback((e) => {
    const { name, value } = e.target;
    if (value.trim()) {
      setErrorsRef.current(prev => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    }
  }, []);

  const validateStep1 = () => {
    const newErrors = {};
    if (!data.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!data.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!data.contactNumber?.trim()) newErrors.contactNumber = 'Phone number is required';
    if (!data.birthdate?.trim()) {
      newErrors.birthdate = 'Birth date is required';
    } else {
      const birthDate = new Date(data.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.birthdate = 'You must be at least 13 years old';
      }
    }
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!isTermsAccepted) {
      newErrors.terms = 'You must accept the Terms & Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateStep1()) {
      try {
        // Submit Step 1 data to backend
        const response = await fetch('/api/auth/signup/step1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          // Store tempId and step1 data for next steps
          localStorage.setItem('signup_tempId', result.tempId);
          localStorage.setItem('signup_step1_data', JSON.stringify(data));
          onNext();
        } else {
          setErrors(prev => ({ ...prev, submit: result.error || 'Failed to proceed to next step' }));
        }
      } catch (error) {
        console.error('Step 1 error:', error);
        setErrors(prev => ({ ...prev, submit: 'Network error. Please try again.' }));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-white/80">Enter your basic information to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={data.firstName || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Juan"
            autoComplete="given-name"
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
            value={data.lastName || ''}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Dela Cruz"
            autoComplete="family-name"
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
          value={data.middleName || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Santos"
          autoComplete="additional-name"
          className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Email Address *</label>
        <input
          type="email"
          name="email"
          value={data.email || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="you@example.com"
          autoComplete="email"
          className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
            errors.email ? 'border-red-500' : 'border-white/30'
          }`}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Contact Number *</label>
        <input
          type="tel"
          name="contactNumber"
          value={data.contactNumber || ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="0921 234 5678"
          autoComplete="tel"
          className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
            errors.contactNumber ? 'border-red-500' : 'border-white/30'
          }`}
        />
        {errors.contactNumber && <p className="text-red-400 text-xs mt-1">{errors.contactNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Birth Date *</label>
        <input
          type="date"
          name="birthdate"
          value={data.birthdate || ''}
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
              value={data.password || ''}
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
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              value={data.confirmPassword || ''}
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
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
          onChange={() => setIsTermsAccepted(!isTermsAccepted)}
          className="h-4 w-4 text-green-600 border-white/30 rounded focus:ring-green-500 bg-white/20 mt-1"
        />
        <div className="ml-2 flex-1">
          <label htmlFor="terms" className="text-sm text-white/90 cursor-pointer">
            I agree to the{' '}
            <span className="text-green-300 hover:text-green-100 transition duration-300 underline">
              Terms &amp; Conditions
            </span>
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
        onClick={handleNext}
        className="w-full py-3 rounded-lg font-medium transition duration-300 shadow-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
      >
        Continue to OTP Verification
      </button>
    </div>
  );
};

// Step 2: OTP Verification Component
const Step2OTP = ({ data, setData, onNext, onBack, email, contactNumber, accountData, errors, setErrors }) => {
  const [otpMethod, setOtpMethod] = useState('email');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // Clean up expired OTPs on component mount
  useEffect(() => {
    cleanupExpiredOTPs();
  }, []);

  // Create resident account after OTP verification
  const createResidentAccount = async () => {
    try {
      const response = await fetch('/api/auth/signup/step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_account_direct',
          email: email,
          contactNumber: contactNumber,
          firstName: accountData.firstName || '',
          lastName: accountData.lastName || '',
          middleName: accountData.middleName || '',
          birthdate: accountData.birthdate || '',
          password: accountData.password || ''
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the uniqueId and firebaseUid for Step 3
        localStorage.setItem('signup_uniqueId', result.uniqueId);
        localStorage.setItem('signup_firebaseUid', result.firebaseUid);
  
      } else {
        throw new Error(result.error || 'Failed to create account');
    }
    } catch (error) {
      console.error('❌ Failed to create resident account:', error);
      throw new Error('Failed to create account. Please try again.');
    }
  };

  // Initialize reCAPTCHA only when needed for phone verification
  useEffect(() => {
    if (otpMethod === 'phone' && typeof window !== 'undefined') {
      // Clear any existing verifier first
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          delete window.recaptchaVerifier;
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      // Add a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible', // Make it invisible for better UX
            callback: (response) => {
      
        },
        'expired-callback': () => {
              setRecaptchaVerifier(null);
              setErrors(prev => ({ ...prev, otp: 'Verification expired. Please try again.' }));
        }
      });
          
          window.recaptchaVerifier = verifier;
      setRecaptchaVerifier(verifier);
        } catch (error) {
          console.error('reCAPTCHA initialization error:', error);
          setErrors(prev => ({ ...prev, otp: 'Failed to initialize phone verification. Please refresh the page.' }));
    }
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      // Cleanup when switching away from phone method
      if (otpMethod !== 'phone' && window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          delete window.recaptchaVerifier;
        } catch (e) {
          // Ignore cleanup errors
        }
        setRecaptchaVerifier(null);
      }
    };
  }, [otpMethod]);

  const sendOtp = async () => {
    const startTime = Date.now();
    setIsVerifying(true);
    setErrors(prev => ({ ...prev, otp: '' }));
    
    try {
      if (otpMethod === 'email') {
        // 🚀 PERFORMANCE: Generate OTP and prepare data simultaneously
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpData = {
          code: otpCode,
          email: email,
          timestamp: Date.now()
        };
        

        
        // 🚀 PERFORMANCE: Parallel operations - store locally while sending
        localStorage.setItem('email_otp', JSON.stringify(otpData));
        
        // 🚀 PERFORMANCE: Optimized fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        try {
          const response = await fetch('/api/send-email-otp', {
          method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: otpCode }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
        const result = await response.json();

        if (response.ok) {
            const totalTime = Date.now() - startTime;
  
            
            // Track performance
            if (window.addEmailPerformanceData) {
              window.addEmailPerformanceData(totalTime, true);
          }

            // Show performance info in development
            if (process.env.NODE_ENV === 'development' && result.performance) {
  
          }
            
            setOtpSent(true);
        } else {
            // Even if email sending fails, keep the OTP and allow user to enter it
            // In case they received it despite the API error
            console.warn('⚠️ Email sending may have failed, but OTP is still valid for 5 minutes');
            setOtpSent(true); // Still show the input field
            
            // Set a warning message instead of throwing an error
            setErrors(prev => ({ 
              ...prev, 
              otp: `Warning: Email may not have been sent (${result.error || 'Unknown error'}). If you received the OTP, you can still enter it.` 
            }));
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          // Track failed performance
          if (window.addEmailPerformanceData) {
            window.addEmailPerformanceData(Date.now() - startTime, false);
          }
          
          if (fetchError.name === 'AbortError') {
            // Even on timeout, keep the OTP and show input field
            console.warn('⚠️ Email sending timed out, but OTP is still valid');
            setOtpSent(true);
            setErrors(prev => ({ 
              ...prev, 
              otp: 'Email sending timed out. If you received the OTP, you can still enter it. Otherwise, try again.' 
            }));
            return; // Don't throw error, just show warning
          }
          
          // For other errors, still allow OTP entry
          console.warn('⚠️ Email sending error:', fetchError.message);
          setOtpSent(true);
          setErrors(prev => ({ 
            ...prev, 
            otp: `Email error: ${fetchError.message}. If you received the OTP, you can still enter it.` 
          }));
        }
      } else if (otpMethod === 'phone') {
        // Firebase Auth phone verification
        if (!recaptchaVerifier) {
          throw new Error('Phone verification not ready. Please wait a moment and try again.');
        }

        // Format phone number for Firebase
        // First, clean the contact number (remove spaces and non-digits)
        const cleanNumber = contactNumber.replace(/\D/g, '');
        
        // Validate that it's a valid Philippine mobile number (11 digits starting with 09)
        if (!/^09\d{9}$/.test(cleanNumber)) {
          throw new Error('Invalid phone number format. Please use format: 0921 234 5678');
        }
        
        // Convert to international format (+63 format)
        // Remove the leading 0 and add +63
        const phoneNumber = '+63' + cleanNumber.substring(1);
        
        try {
          const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
          setConfirmationResult(confirmation);
          setOtpSent(true);
        } catch (firebaseError) {
          console.error('Firebase phone auth error details:', {
            code: firebaseError.code,
            message: firebaseError.message,
            phoneNumber: phoneNumber,
            recaptchaVerifier: !!recaptchaVerifier
          });
          
          // Handle specific Firebase errors with more detailed messages
          if (firebaseError.code === 'auth/invalid-app-credential') {
            throw new Error('Firebase phone authentication is not properly configured. This may require upgrading to Firebase Blaze plan.');
          } else if (firebaseError.code === 'auth/too-many-requests') {
            throw new Error('Too many SMS requests. Please try again in a few minutes or use email verification.');
          } else if (firebaseError.code === 'auth/invalid-phone-number') {
            throw new Error(`Invalid phone number format. Received: ${phoneNumber}`);
          } else if (firebaseError.code === 'auth/captcha-check-failed') {
            throw new Error('Security verification failed. Please refresh the page and try again.');
          } else if (firebaseError.code === 'auth/quota-exceeded') {
            throw new Error('SMS quota exceeded. Please try email verification or contact support.');
          } else {
            throw new Error(`SMS sending failed: ${firebaseError.message}. Please try email verification instead.`);
          }
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      
      let errorMessage = 'Failed to send verification. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please use format: 09xxxxxxxxx';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      } else if (error.code === 'auth/internal-error') {
        errorMessage = 'Phone verification service temporarily unavailable. Please try email verification.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({ ...prev, otp: errorMessage }));
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'Please enter the verification code' }));
      return;
    }

    setIsVerifying(true);
    setErrors(prev => ({ ...prev, otp: '' }));
    
    try {
      if (otpMethod === 'email') {
        // Email OTP verification
        const storedOtp = localStorage.getItem('email_otp');
  
        
        if (!storedOtp) {
          throw new Error('OTP expired. Please request a new one.');
        }

        let otpData;
        try {
          otpData = JSON.parse(storedOtp);
  
        } catch (parseError) {
          console.error('❌ Failed to parse stored OTP:', parseError);
          localStorage.removeItem('email_otp');
          throw new Error('Invalid OTP data. Please request a new one.');
        }
        const now = Date.now();
        const otpAge = now - otpData.timestamp;
        
        // Check if OTP is expired (5 minutes)
        if (otpAge > 5 * 60 * 1000) {
          localStorage.removeItem('email_otp');
          throw new Error('OTP expired. Please request a new one.');
        }
        
        // Check if OTP matches (ensure both are strings for comparison)
        if (String(otpData.code) !== String(otp.trim())) {
          throw new Error('Invalid OTP code. Please try again.');
        }

        // Check if email matches
        if (otpData.email !== email) {
          throw new Error('OTP does not match the email address.');
        }
        
        // OTP is valid, clean up and proceed to create account
        localStorage.removeItem('email_otp');
        
        // Call Step 2 API to create the resident record
        await createResidentAccount();
        onNext();
        
      } else if (otpMethod === 'phone') {
        // Firebase phone verification
        if (!confirmationResult) {
          throw new Error('No verification session found. Please request a new OTP.');
        }
        
        const result = await confirmationResult.confirm(otp.trim());

        if (result.user) {
          // Call Step 2 API to create the resident record
          await createResidentAccount();
              onNext();
            } else {
          throw new Error('Phone verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP code has expired. Please request a new one.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Verification session expired. Please request a new OTP.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({ ...prev, otp: errorMessage }));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Verify Your Account</h2>
        <p className="text-white/70">We need to verify your identity before proceeding</p>
      </div>

      {!otpSent ? (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Choose verification method</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setOtpMethod('email')}
                className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  otpMethod === 'email'
                    ? 'border-green-500 bg-green-500/20 text-white'
                    : 'border-white/30 bg-white/10 text-white/80 hover:border-white/50'
                }`}
              >
                <Mail className="w-5 h-5" />
                <span>Email OTP</span>
              </button>
              <button
                onClick={() => setOtpMethod('phone')}
                className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${
                  otpMethod === 'phone'
                    ? 'border-green-500 bg-green-500/20 text-white'
                    : 'border-white/30 bg-white/10 text-white/80 hover:border-white/50'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>SMS OTP</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-white/70 mb-4">
              We'll send a verification code to: <span className="font-semibold text-white">
                {otpMethod === 'email' ? email : contactNumber}
              </span>
            </p>
            
            <div className={`${otpMethod === 'email' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-green-500/20 border-green-500/30'} border rounded-lg p-4 mb-4`}>
              <p className={`${otpMethod === 'email' ? 'text-blue-200' : 'text-green-200'} text-sm`}>
                {otpMethod === 'email' ? '📧' : '📱'} We'll send a 6-digit verification code to your {otpMethod === 'email' ? 'email address' : 'phone number'}.
              </p>
            </div>
            
            <button
              onClick={sendOtp}
              disabled={isVerifying}
              className={`px-8 py-3 rounded-lg font-medium transition duration-300 ${
                isVerifying
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
              }`}
            >
              {isVerifying ? 'Sending OTP...' : (otpMethod === 'email' ? 'Send Email OTP' : 'Send SMS OTP')}
            </button>
            
            {/* Invisible reCAPTCHA container for phone authentication */}
            {otpMethod === 'phone' && (
              <div>
                <div id="recaptcha-container" className="mt-2"></div>
                <p className="text-white/50 text-xs mt-2">
                  🔒 Protected by invisible reCAPTCHA
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
              <div className="space-y-4">
                <p className="text-white/70 mb-4">
                Check your {otpMethod === 'email' ? 'email inbox' : 'phone messages'} for the OTP code sent to: <span className="font-semibold text-white">
                  {otpMethod === 'email' ? email : contactNumber}
                </span>
                </p>
              <div className={`${otpMethod === 'email' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-green-500/20 border-green-500/30'} border rounded-lg p-4`}>
                <p className={`${otpMethod === 'email' ? 'text-blue-200' : 'text-green-200'} text-sm`}>
                  {otpMethod === 'email' ? '📧' : '📱'} Enter the 6-digit verification code from your {otpMethod === 'email' ? 'email' : 'SMS'} below.
                  </p>
                </div>
              </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
              <input
                type="text"
                value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full p-4 text-center text-2xl font-mono rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              maxLength="6"
              />
              {errors.otp && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm justify-center">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.otp}</span>
                </div>
              )}
            </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={verifyOtp}
              disabled={isVerifying || !otp.trim()}
              className={`px-8 py-3 rounded-lg font-medium transition duration-300 ${
                isVerifying || !otp.trim()
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : otpMethod === 'email'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
              }`}
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </button>

                <button
              onClick={() => {
                setOtp('');
                setErrors(prev => ({ ...prev, otp: '' }));
                sendOtp();
              }}
              disabled={isVerifying}
              className="px-6 py-3 rounded-lg font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition duration-300 disabled:opacity-50"
            >
              Resend OTP
                </button>

            <button
              onClick={() => setOtpSent(false)}
              className="px-6 py-3 rounded-lg font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition duration-300"
            >
              Change Method
            </button>
                </div>
              </div>
            )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-white/80 hover:text-white transition duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
};

// Custom Dropdown Component with Glass Effect
const GlassDropdown = ({ name, value, onChange, options, placeholder, error, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedLabel(option ? option.label : '');
  }, [value, options]);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-left flex items-center justify-between ${
          error ? 'border-red-500' : 'border-white/30'
        }`}
      >
        <span className={value ? 'text-white' : 'text-white/70'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 rounded-lg bg-gray-800 border border-gray-600 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className="w-full p-3 text-left text-white hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg border-b border-gray-600 last:border-b-0"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

// Step 3: Personal Information Component
const Step3Personal = ({ data, setData, onBack, accountData, errors, setErrors }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  // Use refs to maintain stable references
  const setDataRef = useRef(setData);
  const setErrorsRef = useRef(setErrors);
  
  // Update refs when props change
  useEffect(() => {
    setDataRef.current = setData;
    setErrorsRef.current = setErrors;
  }, [setData, setErrors]);

  // Simple input handler - no error clearing during typing
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setDataRef.current(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Handle error clearing on blur instead of during typing
  const handleInputBlur = useCallback((e) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? e.target.checked : value.trim();
    if (fieldValue) {
      setErrorsRef.current(prev => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    }
  }, []);

  const validateStep3 = () => {
    const newErrors = {};
    if (!data.address?.trim()) newErrors.address = 'Address is required';
    if (!data.gender?.trim()) newErrors.gender = 'Gender is required';
    if (!data.citizenship?.trim()) newErrors.citizenship = 'Citizenship is required';
    if (!data.voterStatus?.trim()) newErrors.voterStatus = 'Voter status is required';
    if (!data.maritalStatus?.trim()) newErrors.maritalStatus = 'Marital status is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateStep3()) {
      setIsSubmitting(true);
      try {
        const uniqueId = localStorage.getItem('signup_uniqueId');
        const firebaseUid = localStorage.getItem('signup_firebaseUid');
        
  
        
        if (!uniqueId || !firebaseUid) {
          console.error('❌ Missing registration data:', { uniqueId, firebaseUid });
          throw new Error('Missing registration data. Please restart registration.');
        }

        // Submit Step 3 data to backend (without files)
        const response = await fetch('/api/auth/signup/step3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uniqueId: uniqueId,
            firebaseUid: firebaseUid,
            ...data,
            uploadedFiles: [] // No files to upload
          }),
        });

        const result = await response.json();

        if (response.ok) {
          // Show verification modal instead of completing registration
          setShowVerificationModal(true);
        } else {
          setErrors(prev => ({ ...prev, submit: result.error || 'Failed to complete registration' }));
        }
      } catch (error) {
        console.error('Step 3 error:', error);
        setErrors(prev => ({ ...prev, submit: 'Network error. Please try again.' }));
      } finally {
        setIsSubmitting(false);
          }
        }
  };

  const sendVerificationLink = async () => {
    setIsSendingVerification(true);
    try {
      const uniqueId = localStorage.getItem('signup_uniqueId');
      const firebaseUid = localStorage.getItem('signup_firebaseUid');
      
      const response = await fetch('/api/auth/send-verification-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uniqueId: uniqueId,
            firebaseUid: firebaseUid,
          method: verificationMethod,
          email: accountData.email,
          phoneNumber: accountData.contactNumber
          }),
        });

        const result = await response.json();

        if (response.ok) {
          // Clean up localStorage
          localStorage.removeItem('signup_uniqueId');
          localStorage.removeItem('signup_firebaseUid');
          
        alert(`Verification link sent to your ${verificationMethod}! Please check and click the link to complete your registration.`);
        window.location.href = '/login';
        } else {
        alert(result.error || 'Failed to send verification link. Please try again.');
        }
      } catch (error) {
      console.error('Verification link error:', error);
      alert('Failed to send verification link. Please try again.');
      } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Complete Personal Information</h2>
        <p className="text-white/80">Provide additional details to complete your profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Suffix</label>
          <input
            type="text"
            name="suffix"
            value={data.suffix || ''}
            onChange={handleInputChange}
            placeholder="Jr., Sr., III, etc."
            className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Birthplace</label>
          <input
            type="text"
            name="birthplace"
            value={data.birthplace || ''}
            onChange={handleInputChange}
            placeholder="Enter birthplace"
            className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Gender *</label>
          <GlassDropdown
            name="gender"
            value={data.gender || ''}
            onChange={handleInputChange}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
            placeholder="Select Gender"
            error={errors.gender}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Citizenship *</label>
          <input
            type="text"
            name="citizenship"
            value={data.citizenship || ''}
            onChange={handleInputChange}
            placeholder="Enter citizenship"
            className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
              errors.citizenship ? 'border-red-500' : 'border-white/30'
            }`}
          />
          {errors.citizenship && <p className="text-red-400 text-xs mt-1">{errors.citizenship}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Voter Status *</label>
          <GlassDropdown
            name="voterStatus"
            value={data.voterStatus || ''}
            onChange={handleInputChange}
            options={[
              { value: 'Registered', label: 'Registered' },
              { value: 'Not Registered', label: 'Not Registered' }
            ]}
            placeholder="Select Voter Status"
            error={errors.voterStatus}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Marital Status *</label>
          <GlassDropdown
            name="maritalStatus"
            value={data.maritalStatus || ''}
            onChange={handleInputChange}
            options={[
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' },
              { value: 'Widowed', label: 'Widowed' },
              { value: 'Separated', label: 'Separated' }
            ]}
            placeholder="Select Marital Status"
            error={errors.maritalStatus}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Employment Status</label>
          <GlassDropdown
            name="employmentStatus"
            value={data.employmentStatus || ''}
            onChange={handleInputChange}
            options={[
              { value: 'Employed', label: 'Employed' },
              { value: 'Unemployed', label: 'Unemployed' },
              { value: 'Student', label: 'Student' },
              { value: 'Retired', label: 'Retired' }
            ]}
            placeholder="Select Employment Status"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Occupation</label>
          <input
            type="text"
            name="occupation"
            value={data.occupation || ''}
            onChange={handleInputChange}
            placeholder="Enter occupation"
            className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Educational Attainment</label>
        <GlassDropdown
          name="educationalAttainment"
          value={data.educationalAttainment || ''}
          onChange={handleInputChange}
          options={[
            { value: 'Elementary', label: 'Elementary' },
            { value: 'High School', label: 'High School' },
            { value: 'College', label: 'College' },
            { value: 'Vocational', label: 'Vocational' },
            { value: 'Post Graduate', label: 'Post Graduate' }
          ]}
          placeholder="Select Education Level"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Complete Address *</label>
        <input
          type="text"
          name="address"
          value={data.address || ''}
          onChange={handleInputChange}
          placeholder="Enter complete address"
          className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition ${
            errors.address ? 'border-red-500' : 'border-white/30'
          }`}
        />
        {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
      </div>



      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Choose Verification Method</h3>
              <p className="text-white/70">Select how you'd like to receive your verification link</p>
          </div>

            <div className="space-y-4 mb-6">
                  <button
                onClick={() => setVerificationMethod('email')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  verificationMethod === 'email'
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-white/30 bg-white/10 text-white/80 hover:border-white/50'
                }`}
                  >
                <Mail className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Email Verification</div>
                  <div className="text-sm opacity-70">{accountData.email}</div>
                </div>
              </button>

              <button
                onClick={() => setVerificationMethod('phone')}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  verificationMethod === 'phone'
                    ? 'border-green-500 bg-green-500/20 text-white'
                    : 'border-white/30 bg-white/10 text-white/80 hover:border-white/50'
                }`}
              >
                <Phone className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">SMS Verification</div>
                  <div className="text-sm opacity-70">{accountData.contactNumber}</div>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 px-4 py-3 text-white/80 hover:text-white transition duration-300"
              >
                Cancel
              </button>
                    <button
                onClick={sendVerificationLink}
                disabled={isSendingVerification}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition duration-300 ${
                  isSendingVerification
                    ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                }`}
              >
                {isSendingVerification ? 'Sending...' : 'Send Verification Link'}
                    </button>
                  </div>
                </div>
            </div>
          )}

      {errors.submit && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 text-white/80 hover:text-white transition duration-300"
        >
          ← Back to OTP Verification
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-lg font-medium transition duration-300 ${
            isSubmitting
              ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Complete Registration'}
        </button>
      </div>
    </div>
  );
};

function AdminSignupForm({
  adminForm,
  setAdminForm,
  adminErrors,
  adminOtpMethod,
  setAdminOtpMethod,
  adminOtpSent,
  adminOtp,
  setAdminOtp,
  adminIsVerifying,
  sendAdminOtp,
  verifyAdminOtpAndCreate,
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Admin Account</h2>
        <p className="text-white/80">Temporary tool to register admin accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">First Name *</label>
          <input type="text" value={adminForm.firstName} onChange={e=>setAdminForm(p=>({...p,firstName:e.target.value}))} className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.firstName?'border-red-500':'border-white/30'} text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`} placeholder="Juan" />
          {adminErrors.firstName && <p className="text-red-400 text-xs mt-1">{adminErrors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Last Name *</label>
          <input type="text" value={adminForm.lastName} onChange={e=>setAdminForm(p=>({...p,lastName:e.target.value}))} className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.lastName?'border-red-500':'border-white/30'} text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`} placeholder="Dela Cruz" />
          {adminErrors.lastName && <p className="text-red-400 text-xs mt-1">{adminErrors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Middle Name</label>
        <input type="text" value={adminForm.middleName} onChange={e=>setAdminForm(p=>({...p,middleName:e.target.value}))} className="w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Santos" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Birth Date *</label>
          <input type="date" value={adminForm.birthdate} onChange={e=>setAdminForm(p=>({...p,birthdate:e.target.value}))} className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.birthdate?'border-red-500':'border-white/30'} text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`} />
          {adminErrors.birthdate && <p className="text-red-400 text-xs mt-1">{adminErrors.birthdate}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Role *</label>
          <div className={`w-full rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.role?'border-red-500':'border-white/30'} text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`}>
            <select value={adminForm.role} onChange={e=>setAdminForm(p=>({...p,role:e.target.value}))} className="w-full p-3 bg-transparent">
              <option value="admin">Admin</option>
              <option value="sub-admin1">Sub-Admin1</option>
              <option value="sub-admin2">Sub-Admin2</option>
              <option value="sub-admin3">Sub-Admin3</option>
            </select>
          </div>
          {adminErrors.role && <p className="text-red-400 text-xs mt-1">{adminErrors.role}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Email Address *</label>
        <input type="email" value={adminForm.email} onChange={e=>setAdminForm(p=>({...p,email:e.target.value}))} className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.email?'border-red-500':'border-white/30'} text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`} placeholder="you@example.com" />
        {adminErrors.email && <p className="text-red-400 text-xs mt-1">{adminErrors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-1">Contact Number *</label>
        <input type="tel" value={adminForm.contactNumber} onChange={e=>setAdminForm(p=>({...p,contactNumber:e.target.value}))} className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.contactNumber?'border-red-500':'border-white/30'} text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`} placeholder="0921 234 5678" />
        {adminErrors.contactNumber && <p className="text-red-400 text-xs mt-1">{adminErrors.contactNumber}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Password *</label>
          <input type="password" value={adminForm.password} onChange={e=>setAdminForm(p=>({...p,password:e.target.value}))} className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.password?'border-red-500':'border-white/30'} text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`} placeholder="••••••••" />
          {adminErrors.password && <p className="text-red-400 text-xs mt-1">{adminErrors.password}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Confirm Password *</label>
          <input type="password" value={adminForm.confirmPassword} onChange={e=>setAdminForm(p=>({...p,confirmPassword:e.target.value}))} className={`w-full p-3 rounded-lg bg-white/20 backdrop-blur-sm border ${adminErrors.confirmPassword?'border-red-500':'border-white/30'} text-white placeholder-white/70 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition`} placeholder="••••••••" />
          {adminErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{adminErrors.confirmPassword}</p>}
        </div>
      </div>

      {adminErrors.submit && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{adminErrors.submit}</p>
        </div>
      )}

      {!adminOtpSent ? (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Choose verification method</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={()=>setAdminOtpMethod('email')} className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${adminOtpMethod==='email'?'border-green-500 bg-green-500/20 text-white':'border-white/30 bg-white/10 text-white/80 hover:border-white/50'}`}>
                <Mail className="w-5 h-5" />
                <span>Email OTP</span>
              </button>
              <button onClick={()=>setAdminOtpMethod('phone')} className={`flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all ${adminOtpMethod==='phone'?'border-green-500 bg-green-500/20 text-white':'border-white/30 bg-white/10 text-white/80 hover:border-white/50'}`}>
                <Phone className="w-5 h-5" />
                <span>SMS OTP</span>
              </button>
            </div>
          </div>
          <div className="text-center">
            <button onClick={sendAdminOtp} disabled={adminIsVerifying} className={`px-8 py-3 rounded-lg font-medium transition duration-300 ${adminIsVerifying?'bg-gray-500/50 text-gray-300 cursor-not-allowed':'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'}`}>
              {adminIsVerifying? 'Sending OTP...' : (adminOtpMethod==='email'?'Send Email OTP':'Send SMS OTP')}
            </button>
            {adminOtpMethod==='phone' && (
              <div>
                <div id="admin-recaptcha-container" className="mt-2"></div>
                <p className="text-white/50 text-xs mt-2">🔒 Protected by invisible reCAPTCHA</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <input type="text" value={adminOtp} onChange={e=>setAdminOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="Enter 6-digit code" className="w-full p-4 text-center text-2xl font-mono rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" maxLength={6} />
          {adminErrors.otp && <div className="text-red-400 text-sm">{adminErrors.otp}</div>}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={verifyAdminOtpAndCreate} disabled={adminIsVerifying || !adminOtp.trim()} className={`px-8 py-3 rounded-lg font-medium transition duration-300 ${adminIsVerifying||!adminOtp.trim()? 'bg-gray-500/50 text-gray-300 cursor-not-allowed':'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'}`}>{adminIsVerifying? 'Verifying...' : 'Verify & Create Admin'}</button>
            <button onClick={()=>{setAdminOtp(''); }} disabled={adminIsVerifying} className="px-6 py-3 rounded-lg font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition duration-300 disabled:opacity-50">Clear</button>
            <button onClick={()=>{ setAdminOtp(''); sendAdminOtp(); }} disabled={adminIsVerifying} className="px-6 py-3 rounded-lg font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition duration-300 disabled:opacity-50">Resend OTP</button>
            <button onClick={()=>{ setAdminOtp(''); setAdminOtpMethod('email'); }} className="px-6 py-3 rounded-lg font-medium bg-white/20 text-white border border-white/30 hover:bg-white/30 transition duration-300">Change Method</button>
          </div>
        </div>
      )}
    </div>
  );
}

const SignupPage = () => {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [accountData, setAccountData] = useState({});
  const [otpData, setOtpData] = useState({});
  const [personalData, setPersonalData] = useState({});
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState('resident'); // 'resident' | 'admin'

  // Admin form state
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
  });
  const [adminErrors, setAdminErrors] = useState({});
  const [adminOtpMethod, setAdminOtpMethod] = useState('email'); // 'email' | 'phone'
  const [adminOtpSent, setAdminOtpSent] = useState(false);
  const [adminOtp, setAdminOtp] = useState('');
  const [adminIsVerifying, setAdminIsVerifying] = useState(false);
  const [adminRecaptchaVerifier, setAdminRecaptchaVerifier] = useState(null);
  const [adminConfirmationResult, setAdminConfirmationResult] = useState(null);

  const validateAdminForm = () => {
    const e = {};
    if (!adminForm.firstName.trim()) e.firstName = 'First name is required';
    if (!adminForm.lastName.trim()) e.lastName = 'Last name is required';
    if (!adminForm.birthdate.trim()) e.birthdate = 'Birth date is required';
    if (!adminForm.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(adminForm.email)) e.email = 'Email is invalid';
    if (!adminForm.contactNumber.trim()) e.contactNumber = 'Phone number is required';
    else if (!/^09\d{9}$/.test(adminForm.contactNumber.replace(/\s/g, ''))) e.contactNumber = 'Use format 09xxxxxxxxx';
    if (!adminForm.password) e.password = 'Password is required';
    else if (adminForm.password.length < 6) e.password = 'At least 6 characters';
    if (!adminForm.confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (adminForm.password !== adminForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!adminForm.role) e.role = 'Role is required';
    setAdminErrors(e);
    return Object.keys(e).length === 0;
  };

  // Admin OTP send
  const sendAdminOtp = async () => {
    if (!validateAdminForm()) return;
    setAdminIsVerifying(true);
    setAdminErrors(prev => ({ ...prev, submit: '' }));
    try {
      // Create a tempId for admin OTP tracking (reuse step1 style)
      const tempId = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('admin_signup_tempId', tempId);
      localStorage.setItem('admin_signup_data', JSON.stringify(adminForm));

      if (adminOtpMethod === 'email') {
        // Server-side OTP storage + email send
        const resp = await fetch('/api/auth/admin-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_email_otp', tempId, email: adminForm.email })
        });
        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || 'Failed to send OTP');
        setAdminOtpSent(true);
      } else {
        // Phone via Firebase (similar to resident)
        if (typeof window !== 'undefined') {
          if (window.adminRecaptchaVerifier) {
            try { window.adminRecaptchaVerifier.clear(); delete window.adminRecaptchaVerifier; } catch {}
          }
          const verifier = new RecaptchaVerifier(auth, 'admin-recaptcha-container', { size: 'invisible' });
          window.adminRecaptchaVerifier = verifier;
          setAdminRecaptchaVerifier(verifier);
          const cleanNumber = adminForm.contactNumber.replace(/\D/g, '');
          if (!/^09\d{9}$/.test(cleanNumber)) throw new Error('Invalid phone number');
          const phoneNumber = '+63' + cleanNumber.substring(1);
          const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
          setAdminConfirmationResult(confirmation);
          setAdminOtpSent(true);
        }
      }
    } catch (error) {
      setAdminErrors(prev => ({ ...prev, submit: error.message || 'Failed to send OTP' }));
    } finally {
      setAdminIsVerifying(false);
    }
  };

  const verifyAdminOtpAndCreate = async () => {
    if (!adminOtp.trim()) {
      setAdminErrors(prev => ({ ...prev, otp: 'Enter the verification code' }));
      return;
    }
    setAdminIsVerifying(true);
    setAdminErrors(prev => ({ ...prev, otp: '', submit: '' }));
    try {
      const tempId = localStorage.getItem('admin_signup_tempId');
      const saved = localStorage.getItem('admin_signup_data');
      if (!tempId || !saved) throw new Error('Session expired. Please restart.');
      const data = JSON.parse(saved);

      if (adminOtpMethod === 'email') {
        // Verify OTP server-side using existing endpoint
        const verifyResp = await fetch('/api/auth/admin-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_email_otp', tempId, otp: adminOtp })
        });
        const verifyRes = await verifyResp.json();
        if (!verifyResp.ok) throw new Error(verifyRes.error || 'Invalid or expired OTP');
      } else {
        // Confirm SMS OTP
        if (!adminConfirmationResult) throw new Error('No verification session found. Resend OTP.');
        await adminConfirmationResult.confirm(adminOtp.trim());
      }

      // On successful OTP, create admin account
      const createResp = await fetch('/api/auth/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          birthdate: data.birthdate,
          email: data.email,
          contactNumber: data.contactNumber,
          password: data.password,
          role: data.role,
        })
      });
      const createRes = await createResp.json();
      if (!createResp.ok) throw new Error(createRes.error || 'Failed to create admin');

      // Cleanup and redirect
      localStorage.removeItem('admin_signup_tempId');
      localStorage.removeItem('admin_signup_data');
      alert('Admin account created successfully. You can now log in.');
      window.location.href = '/login';
    } catch (error) {
      setAdminErrors(prev => ({ ...prev, submit: error.message || 'Verification failed' }));
    } finally {
      setAdminIsVerifying(false);
    }
  };

  // Progress Bar Component
  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => setCurrentStep(step.id)}
            className={`flex flex-col items-center group transition-all duration-300 ${
              index <= currentStep
                ? 'text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 mb-2 ${
                index < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : index === currentStep
                  ? 'bg-white border-green-500 text-green-600'
                  : 'bg-white/20 border-white/30 text-white/50'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <span className="text-lg">{step.icon}</span>
              )}
            </div>
            <span className={`text-sm font-medium transition-all duration-300 ${
              index <= currentStep ? 'text-white' : 'text-white/50'
            }`}>
              {step.label}
            </span>
          </button>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 transition-all duration-300 ${
              index < currentStep ? 'bg-green-500' : 'bg-white/30'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Navigation functions
  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1Account
            data={accountData}
            setData={setAccountData}
            onNext={handleNext}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 1:
        return (
          <Step2OTP
            data={otpData}
            setData={setOtpData}
            onNext={handleNext}
            onBack={handleBack}
            email={accountData.email}
            contactNumber={accountData.contactNumber}
            accountData={accountData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <Step3Personal
            data={personalData}
            setData={setPersonalData}
            onBack={handleBack}
            accountData={accountData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url("/images/bhall.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-28">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/images/brgy_seal2.png"
                alt="Barangay Seal"
                width={80}
                height={80}
                className="rounded-full shadow-lg"
              />
              <div className="ml-4 text-left">
                <h1 className="text-4xl font-bold text-white">B-Sphere</h1>
                <p className="text-white/80">Barangay Information Management System</p>
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-sm">
              <button onClick={()=>setMode('resident')} className={`px-4 py-2 text-sm font-medium ${mode==='resident'?'bg-green-600 text-white':'text-white/80 hover:bg-white/10'}`}>Resident Signup</button>
              <button onClick={()=>setMode('admin')} className={`px-4 py-2 text-sm font-medium ${mode==='admin'?'bg-green-600 text-white':'text-white/80 hover:bg-white/10'}`}>Admin Signup</button>
            </div>
          </div>

          {/* Progress Bar for resident only */}
          {mode==='resident' && <ProgressBar />}

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
            {mode==='resident' ? (
              renderCurrentStep()
            ) : (
              <AdminSignupForm
                adminForm={adminForm}
                setAdminForm={setAdminForm}
                adminErrors={adminErrors}
                adminOtpMethod={adminOtpMethod}
                setAdminOtpMethod={setAdminOtpMethod}
                adminOtpSent={adminOtpSent}
                adminOtp={adminOtp}
                setAdminOtp={setAdminOtp}
                adminIsVerifying={adminIsVerifying}
                sendAdminOtp={sendAdminOtp}
                verifyAdminOtpAndCreate={verifyAdminOtpAndCreate}
              />
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-green-300 hover:text-green-100 transition duration-300 underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Performance Monitor (Development Only) */}
      <EmailPerformanceMonitor isVisible={true} />
    </div>
  );
};

export default SignupPage;
