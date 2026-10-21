import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeTags: 0,
    totalImports: 0,
    totalCountries: 0,
    totalCities: 0,
    totalIndustries: 0,
  });

  const [charts, setCharts] = useState({
    companiesByCountry: [],
    companiesByIndustry: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/company/stats`),
          axios.get(`${import.meta.env.VITE_API_URL}/company/charts`),
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57"];

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Prospect Data Engine
          </h1>
          <p className="text-gray-500 mt-1">
            Manage companies, tags, imports, and exports
          </p>
        </div>

        <button className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition">
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-blue-500">
          <h2 className="text-gray-500 text-sm">Total Companies</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalCompanies.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-green-500">
          <h2 className="text-gray-500 text-sm">Total Imports</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalImports.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-purple-500">
          <h2 className="text-gray-500 text-sm">Total Industries</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalIndustries.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-orange-500">
          <h2 className="text-gray-500 text-sm">Active Tags</h2>
          <p className="text-3xl font-bold mt-2">{stats.activeTags.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Companies by Country</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.companiesByCountry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Companies by Industry</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.companiesByIndustry}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  label
                >
                  {charts.companiesByIndustry.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button className="bg-white shadow rounded-2xl p-6 text-left hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Import Data</h3>
          <p className="text-gray-500">
            Upload CSV or Google Sheets data
          </p>
        </button>

        <button className="bg-white shadow rounded-2xl p-6 text-left hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Manage Companies</h3>
          <p className="text-gray-500">
            View and filter company database
          </p>
        </button>

        <button className="bg-white shadow rounded-2xl p-6 text-left hover:shadow-lg transition">
          <h3 className="text-xl font-semibold mb-2">Export Data</h3>
          <p className="text-gray-500">
            Download structured datasets
          </p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

        <div className="space-y-4">
          <div className="border-b pb-3">
            <p className="font-medium">
              New company imported successfully
            </p>
            <span className="text-sm text-gray-500">
              2 minutes ago
            </span>
          </div>

          <div className="border-b pb-3">
            <p className="font-medium">
              Tag "High Priority" added
            </p>
            <span className="text-sm text-gray-500">
              10 minutes ago
            </span>
          </div>

          <div>
            <p className="font-medium">
              Export completed for 250 companies
            </p>
            <span className="text-sm text-gray-500">
              1 hour ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
