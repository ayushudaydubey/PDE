import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, Database, ArrowRight, ArrowLeft, Mail, KeyRound, Lock } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import api from '../../../api/axios';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Step 1: Email Form
  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  // Step 2: OTP Form
  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm({
    resolver: zodResolver(otpSchema),
  });

  // Step 3: Password Form
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Mutations
  const forgotPasswordMutation = useMutation({
    mutationFn: (data) => api.post('/auth/forgot-password', data),
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setStep(2);
      toast.success('OTP sent to your email');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to send OTP'),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data) => api.post('/auth/verify-otp', { email, otp: data.otp }),
    onSuccess: (_, variables) => {
      setOtp(variables.otp);
      setStep(3);
      toast.success('OTP verified successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Invalid or expired OTP'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data) => api.post('/auth/reset-password', { email, otp, newPassword: data.newPassword }),
    onSuccess: () => {
      toast.success('Password reset successfully');
      navigate('/login');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to reset password'),
  });

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SECTION */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop"
          alt="PDE Dashboard"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col justify-between h-full p-14 text-white">
          <div className="flex items-center gap-3">
            <img src="/img.png" alt="Gnosys Digital Logo" className="h-12 w-auto object-contain shrink-0" />
            <div>
              <h1 className="text-2xl font-semibold">PDE</h1>
              <p className="text-sm text-white/70">Gnosys Digital - Prospect Data Engine</p>
            </div>
          </div>
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Secure Password Recovery
            </div>
            <h2 className="text-5xl font-semibold leading-tight">
              Regain access to your workspace securely.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              We ensure your account remains protected with secure OTP verification. Follow the simple steps to reset your password and get back to managing your sales pipelines seamlessly.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>&copy; {new Date().getFullYear()} Dwarkadhish NeuralStack Limited</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 lg:px-16 bg-white">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-10">
            <img src="/img.png" alt="PDE Logo" className="h-11 w-auto object-contain shrink-0" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">PDE</h1>
              <p className="text-sm text-gray-500">Prospect Data Engine</p>
            </div>
          </div>

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black font-medium mb-8 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>

          {step === 1 && (
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                  <Mail className="w-6 h-6 text-gray-700" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900">Forgot Password?</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  No worries, we'll send you reset instructions.
                </p>
              </div>
              <form onSubmit={handleEmailSubmit((data) => forgotPasswordMutation.mutate(data))} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    {...registerEmail('email')}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
                  />
                  {emailErrors.email && <p className="text-red-500 text-xs mt-2">{emailErrors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={forgotPasswordMutation.isLoading}
                  className="w-full h-12 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {forgotPasswordMutation.isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                  {!forgotPasswordMutation.isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                  <KeyRound className="w-6 h-6 text-gray-700" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900">Enter OTP</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  We sent a code to <span className="font-semibold text-gray-900">{email}</span>.
                </p>
                <div className="mt-4 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex gap-3 items-start text-left">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    i
                  </div>
                  <p className="text-xs text-blue-900 leading-relaxed font-medium">
                    A one-time verification code has been sent to your email address. If it does not appear in your inbox within a few moments, please ensure you check your <span className="font-semibold underline">Spam or Junk folder</span>.
                  </p>
                </div>
              </div>
              <form onSubmit={handleOtpSubmit((data) => verifyOtpMutation.mutate(data))} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">6-Digit Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    {...registerOtp('otp')}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition tracking-widest text-center text-lg font-semibold"
                  />
                  {otpErrors.otp && <p className="text-red-500 text-xs mt-2">{otpErrors.otp.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={verifyOtpMutation.isLoading}
                  className="w-full h-12 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {verifyOtpMutation.isLoading ? 'Verifying...' : 'Verify OTP'}
                  {!verifyOtpMutation.isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive the email?{' '}
                  <button onClick={() => forgotPasswordMutation.mutate({ email })} className="text-black font-medium hover:underline focus:outline-none">
                    Click to resend
                  </button>
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                  <Lock className="w-6 h-6 text-gray-700" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-900">Set new password</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  Your new password must be different to previously used passwords.
                </p>
              </div>
              <form onSubmit={handlePasswordSubmit((data) => resetPasswordMutation.mutate(data))} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    {...registerPassword('newPassword')}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
                  />
                  {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-2">{passwordErrors.newPassword.message}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    {...registerPassword('confirmPassword')}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
                  />
                  {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-2">{passwordErrors.confirmPassword.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isLoading}
                  className="w-full h-12 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  {resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset Password'}
                  {!resetPasswordMutation.isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
