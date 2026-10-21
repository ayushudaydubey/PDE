import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { Users, Trash2, ShieldAlert, UserPlus } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const UsersPage = () => {
  const { user: authUser } = useAuth();

  const isAdmin = authUser?.role === 'admin';

  // Fetch Users
  const {
    data: users = [],
    isLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      api.get('/users').then((res) => res.data.data || []),
    enabled: isAdmin,
  });

  // Update Role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });

      toast.success('User role updated');

      refetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to update role'
      );
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    if (userId === authUser?._id) {
      toast.error('You cannot delete yourself');
      return;
    }

    if (!window.confirm('Delete this user?')) return;

    try {
      await api.delete(`/users/${userId}`);

      toast.success('User deleted');

      refetchUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to delete user'
      );
    }
  };

  // User Initials
  const getInitials = (name) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Access Denied
  if (!isAdmin) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-gray-600" />
        </div>

        <h2 className="text-xl font-medium text-gray-900">
          Access Denied
        </h2>

        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Only administrators can access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-gray-700" />
            Users
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage platform users and roles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600">
            Total Users : {isLoading ? '...' : users.length}
          </div>
          
          <Link
            to="/register"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create New User
          </Link>
        </div>

      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full">

              {/* Table Head */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">

                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 transition"
                  >

                    {/* User */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                          {getInitials(u.name)}
                        </div>

                        <div>
                          <p className="text-sm font-normal text-gray-900">
                            {u.name || 'Unnamed'}
                          </p>

                          {u._id === authUser?._id && (
                            <span className="text-xs text-gray-500">
                              You
                            </span>
                          )}
                        </div>

                      </div>

                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">

                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleUpdateRole(
                            u._id,
                            e.target.value
                          )
                        }
                        disabled={u.role === 'admin' && u._id !== authUser?._id}
                        className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                      >
                        <option value="admin">
                          Admin
                        </option>

                        <option value="sales">
                          Sales
                        </option>

                        <option value="marketing">
                          Marketing
                        </option>

                        <option value="cold_mail">
                          Cold Mail
                        </option>
                      </select>

                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(
                        u.createdAt
                      ).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() =>
                          handleDeleteUser(u._id)
                        }
                        disabled={u._id === authUser?._id}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
};

export default UsersPage;