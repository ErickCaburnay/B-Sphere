"use client";

import React, { useEffect, useState } from 'react';
import { Mail, Phone, X } from 'lucide-react';
import { User, Calendar, Key, CheckCircle } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AddAdminModal({ isOpen = false, onClose, onCreated }) {
  const [form, setForm] = useState({
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
  const [errors, setErrors] = useState({});
  const [otpMethod, setOtpMethod] = useState('email');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setForm({ firstName: '', middleName: '', lastName: '', birthdate: '', email: '', contactNumber: '', password: '', confirmPassword: '', role: 'admin' });
      setErrors({});
      setOtp('');
      setOtpSent(false);
      setOtpMethod('email');
      setConfirmationResult(null);
    }
  }, [isOpen]);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.birthdate.trim()) e.birthdate = 'Birth date is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.contactNumber.trim()) e.contactNumber = 'Phone number is required';
    else if (!/^09\d{9}$/.test(form.contactNumber.replace(/\s/g, ''))) e.contactNumber = 'Use format 09xxxxxxxxx';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.role) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validate()) return;
    setIsBusy(true);
    setErrors(prev => ({ ...prev, submit: '' }));
    try {
      const tempId = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('admin_signup_tempId', tempId);
      localStorage.setItem('admin_signup_data', JSON.stringify(form));

      if (otpMethod === 'email') {
        const resp = await fetch('/api/auth/admin-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_email_otp', tempId, email: form.email })
        });
        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || 'Failed to send OTP');
        setOtpSent(true);
      } else {
        // phone
        if (typeof window !== 'undefined') {
          if (window.adminMgmtRecaptcha) {
            try { window.adminMgmtRecaptcha.clear(); delete window.adminMgmtRecaptcha; } catch {}
          }
          const verifier = new RecaptchaVerifier(auth, 'admin-mgmt-recaptcha', { size: 'invisible' });
          window.adminMgmtRecaptcha = verifier;
          const clean = form.contactNumber.replace(/\D/g, '');
          if (!/^09\d{9}$/.test(clean)) throw new Error('Invalid phone number');
          const phone = '+63' + clean.substring(1);
          const conf = await signInWithPhoneNumber(auth, phone, verifier);
          setConfirmationResult(conf);
          setOtpSent(true);
        }
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Failed to send OTP' }));
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'Enter the verification code' }));
      return;
    }
    setIsBusy(true);
    setErrors(prev => ({ ...prev, otp: '', submit: '' }));
    try {
      const tempId = localStorage.getItem('admin_signup_tempId');
      const saved = localStorage.getItem('admin_signup_data');
      if (!tempId || !saved) throw new Error('Session expired. Please restart.');
      const data = JSON.parse(saved);

      if (otpMethod === 'email') {
        const verifyResp = await fetch('/api/auth/admin-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_email_otp', tempId, otp })
        });
        const vr = await verifyResp.json();
        if (!verifyResp.ok) throw new Error(vr.error || 'Invalid or expired OTP');
      } else {
        if (!confirmationResult) throw new Error('No verification session found. Resend OTP.');
        await confirmationResult.confirm(otp.trim());
      }

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
      const cr = await createResp.json();
      if (!createResp.ok) throw new Error(cr.error || 'Failed to create admin');

      localStorage.removeItem('admin_signup_tempId');
      localStorage.removeItem('admin_signup_data');
      if (onCreated) onCreated(cr.user);
      onClose?.();
    } catch (err) {
      setErrors(prev => ({ ...prev, submit: err.message || 'Verification failed' }));
    } finally {
      setIsBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20"></div>
          <div className="relative flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">Add Admin</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-green-100 rounded-full p-2">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">First Name <span className="text-red-500">*</span></label>
                <input value={form.firstName} onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Middle Name</label>
                <input value={form.middleName} onChange={e=>setForm(p=>({...p,middleName:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" placeholder="Enter middle name" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Last Name <span className="text-red-500">*</span></label>
                <input value={form.lastName} onChange={e=>setForm(p=>({...p,lastName:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" placeholder="Enter last name" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Role <span className="text-red-500">*</span></label>
                <div className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white shadow-sm">
                  <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} className="w-full px-1 py-2 bg-transparent focus:outline-none">
                    <option value="admin">Admin</option>
                    <option value="sub-admin1">Sub-Admin1</option>
                    <option value="sub-admin2">Sub-Admin2</option>
                    <option value="sub-admin3">Sub-Admin3</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-green-100 rounded-full p-2">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Basic Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Birthdate <span className="text-red-500">*</span></label>
                <input type="date" value={form.birthdate} onChange={e=>setForm(p=>({...p,birthdate:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" placeholder="Enter email" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Contact Number <span className="text-red-500">*</span></label>
                <input type="tel" value={form.contactNumber} onChange={e=>setForm(p=>({...p,contactNumber:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" placeholder="09xxxxxxxxx" />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-green-100 rounded-full p-2">
                <Key className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Password <span className="text-red-500">*</span></label>
                <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" placeholder="Enter password" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-left">Confirm Password <span className="text-red-500">*</span></label>
                <input type="password" value={form.confirmPassword} onChange={e=>setForm(p=>({...p,confirmPassword:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white shadow-sm hover:shadow-md" placeholder="Re-enter password" />
              </div>
            </div>
          </div>

          {/* OTP Actions */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">{errors.submit}</div>
          )}

          {!otpSent ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={()=>setOtpMethod('email')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${otpMethod==='email'?'border-green-500 bg-green-50 text-green-700':'border-gray-300 bg-white text-gray-700'}`}>
                  <Mail className="w-4 h-4" /> Email OTP
                </button>
                <button type="button" onClick={()=>setOtpMethod('phone')} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${otpMethod==='phone'?'border-green-500 bg-green-50 text-green-700':'border-gray-300 bg-white text-gray-700'}`}>
                  <Phone className="w-4 h-4" /> SMS OTP
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={()=>setForm({ firstName:'', middleName:'', lastName:'', birthdate:'', email:'', contactNumber:'', password:'', confirmPassword:'', role:'admin' })} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <X className="h-4 w-4" /> Clear Form
                </button>
                <button type="button" onClick={handleSendOtp} disabled={isBusy} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white shadow ${isBusy?'bg-gray-500 cursor-wait':'bg-green-600 hover:bg-green-700'}`}>
                  <CheckCircle className="h-4 w-4" /> {isBusy ? 'Sending...' : (otpMethod==='email' ? 'Send Email OTP' : 'Send SMS OTP')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} placeholder="Enter 6-digit code" className="w-full md:w-auto flex-1 px-4 py-3 text-center text-xl font-mono rounded-xl border border-gray-200 bg-white text-gray-900" />
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleVerifyAndCreate} disabled={isBusy || !otp.trim()} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white shadow ${isBusy||!otp.trim()?'bg-gray-500 cursor-not-allowed':'bg-green-600 hover:bg-green-700'}`}>
                  <CheckCircle className="h-4 w-4" /> {isBusy?'Verifying...':'Verify & Create Admin'}
                </button>
                <button type="button" onClick={()=>{ setOtp(''); handleSendOtp(); }} disabled={isBusy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Resend OTP</button>
                <button type="button" onClick={()=>setOtpSent(false)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">Change Method</button>
              </div>
            </div>
          )}
          {otpMethod==='phone' && <div id="admin-mgmt-recaptcha" className="mt-2" />}
        </div>
      </div>
    </div>
  );
} 