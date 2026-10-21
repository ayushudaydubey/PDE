import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { User, Mail, Calendar, Shield, Copy, Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../../api/axios";

const ProfilePage = () => {
  const { user } = useAuth();
  
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      toast.success("Email copied");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.oldPassword || !passwords.newPassword) {
      return toast.error("Please fill in both password fields");
    }
    
    try {
      setIsUpdating(true);
      await api.put('/auth/update-password', passwords);
      toast.success("Password updated successfully");
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900">Profile</h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage your account information
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 shadow-xl shadow-gray-400/50 rounded-2xl overflow-hidden">
        {/* Top Section */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-lg font-medium">
            {getInitials(user?.name)}
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-gray-900">
              {user?.name || "Unknown User"}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-normal">
                <Shield className="w-4 h-4" />
                {user?.role || "User"}
              </div>

              <div className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm font-normal">
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="divide-y divide-gray-100">
          {/* Name */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />

              <div>
                <p className="text-sm text-gray-500">Full Name</p>

                <p className="text-sm font-normal text-gray-900 mt-1">
                  {user?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />

              <div>
                <p className="text-sm text-gray-500">Email Address</p>

                <p className="text-sm font-normal text-gray-900 mt-1 break-all">
                  {user?.email || "N/A"}
                </p>
              </div>
            </div>

            {user?.email && (
              <button
                onClick={handleCopyEmail}
                className="h-9 px-4 border border-gray-200 rounded-lg text-sm font-normal text-gray-700 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy
                </div>
              </button>
            )}
          </div>

          {/* Member Since */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />

              <div>
                <p className="text-sm text-gray-500">Member Since</p>

                <p className="text-sm font-normal text-gray-900 mt-1">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
          
          {/* Update Password */}
          <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4 bg-gray-50/50">
            <div className="flex items-center gap-3 sm:w-1/3 pt-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-900 font-medium">Update Password</p>
                <p className="text-xs text-gray-500 mt-0.5">Change your account password securely.</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="flex-1 space-y-3 max-w-sm">
              <div>
                <input
                  type="password"
                  placeholder="Old Password"
                  value={passwords.oldPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="h-10 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
