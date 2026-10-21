import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import {
  Database,
  ShieldCheck,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

import api from '../../../api/axios';
import { queryClient } from '../../../api/queryClient';

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters'),

  email: z
    .string()
    .email('Invalid email address'),

  mobile: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits'),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),

  role: z.enum([
    'admin',
    'sales',
    'marketing',
    'cold_mail',
  ]),
});

const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      role: 'sales',
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data) =>
      api.post('/auth/register', data),

    onSuccess: (response) => {
      queryClient.setQueryData(
        ['authUser'],
        response.data.user
      );

      toast.success('Registration successful');

      navigate('/');
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
        'Registration failed'
      );
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* LEFT SECTION */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">

        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop"
          alt="PDE Register"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-14 text-white">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/img.png" alt="PDE Logo" className="h-12 w-auto object-contain shrink-0" />

            <div>
              <h1 className="text-2xl font-semibold">
                PDE
              </h1>

              <p className="text-sm text-white/70">
                Prospect Data Engine
              </p>
            </div>

          </div>

          {/* Center Content */}
          <div className="max-w-xl space-y-6">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Centralized Business Data Platform
            </div>

            <h2 className="text-5xl font-semibold leading-tight">
              Create your workspace and manage data smarter
            </h2>

            <p className="text-white/70 text-lg leading-relaxed">
              PDE helps teams organize company
              records, manage uploads, track exports,
              and centralize workflows through a clean
              and professional data management system.
            </p>

          </div>

          {/* Footer */}
          <div className="text-sm text-white/60">
            Secure • Fast • Centralized
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
              <h1 className="text-xl font-semibold text-gray-900">
                PDE
              </h1>

              <p className="text-sm text-gray-500">
                Prospect Data Engine
              </p>
            </div>

          </div>

          {/* Heading */}
          <div className="mb-8">

            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <UserPlus className="w-6 h-6 text-gray-800" />
            </div>

            <h2 className="text-4xl font-semibold text-gray-900">
              Create account
            </h2>

            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Register to access your centralized
              business data workspace.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Full Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                {...register('name')}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
              />

              {errors.name && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
              />

              {errors.email && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Mobile Number
              </label>

              <input
                type="tel"
                placeholder="Enter mobile number"
                {...register('mobile')}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
              />

              {errors.mobile && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Create password"
                {...register('password')}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
              />

              {errors.password && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Select Role
              </label>

              <select
                {...register('role')}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-gray-400 transition"
              >
                <option value="sales">
                  Sales
                </option>

                <option value="marketing">
                  Marketing
                </option>

                <option value="admin">
                  Admin
                </option>

                <option value="cold_mail">
                  Cold Mail
                </option>

              </select>

              {errors.role && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {registerMutation.isPending
                ? 'Creating account...'
                : 'Create Account'}

              {!registerMutation.isPending && (
                <ArrowRight className="w-4 h-4" />
              )}

            </button>

          </form>

          {/* Footer */}
          <div className="mt-8 text-center">

            <p className="text-sm text-gray-500">
              Already have an account?{' '}

              <Link
                to="/login"
                className="text-black font-medium hover:underline"
              >
                Sign In
              </Link>

            </p>

          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;