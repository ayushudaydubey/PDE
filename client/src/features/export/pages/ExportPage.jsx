import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileDown, Calendar, User, Tag, Search, Filter, History, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../api/axios';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';
import ExportConfigModal from '../../../components/ui/ExportConfigModal';
import RegenerateHistoryModal from '../../../components/ui/RegenerateHistoryModal';
import { useAuth } from '../../../hooks/useAuth';

const ExportPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [filters, setFilters] = useState({
    country: '',
    city: '',
    industry: '',
    tag: '',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyUser, setHistoryUser] = useState('');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyModalExportId, setHistoryModalExportId] = useState(null);
  const [historyModalExportData, setHistoryModalExportData] = useState(null);

  const [historyToDelete, setHistoryToDelete] = useState(null);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);

  // Fetch users for filter
  const { data: usersList = [] } = useQuery({
    queryKey: ['filterUsers', 'marketing'],
    queryFn: () => api.get('/users/filter-list?targetRole=marketing').then((res) => res.data.data || []),
  });

  // Fetch tags dynamically based on other filters
  const { data: tagsList = [] } = useQuery({
    queryKey: ['exportFilters', 'tags', filters.industry, filters.city, filters.country],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.country) queryParams.append('country', filters.country);
      return api.get(`/filters/tags?${queryParams.toString()}`).then((res) => res.data.data || []);
    },
  });

  // Fetch countries list for filters
  const { data: countriesList = [] } = useQuery({
    queryKey: ['exportFilters', 'countries', filters.industry, filters.city, filters.tag],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.tag) queryParams.append('tag', filters.tag);
      return api.get(`/filters/countries?${queryParams.toString()}`).then((res) => res.data.data || []);
    },
  });

  // Fetch cities list based on selected filters
  const { data: citiesList = [] } = useQuery({
    queryKey: ['exportFilters', 'cities', filters.country, filters.industry, filters.tag],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.tag) queryParams.append('tag', filters.tag);
      return api.get(`/filters/cities?${queryParams.toString()}`).then((res) => res.data.data || []);
    },
  });

  // Fetch industries list for filters
  const { data: industriesList = [] } = useQuery({
    queryKey: ['exportFilters', 'industries', filters.country, filters.city, filters.tag],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.tag) queryParams.append('tag', filters.tag);
      return api.get(`/filters/industries?${queryParams.toString()}`).then((res) => res.data.data || []);
    },
  });

  // Reset dependent filters if they are no longer present in the updated option lists
  useEffect(() => {
    if (filters.country && countriesList.length > 0 && !countriesList.includes(filters.country)) {
      setFilters(f => ({ ...f, country: '', city: '' }));
    }
  }, [countriesList, filters.country]);

  useEffect(() => {
    if (filters.city && citiesList.length > 0 && !citiesList.includes(filters.city)) {
      setFilters(f => ({ ...f, city: '' }));
    }
  }, [citiesList, filters.city]);

  useEffect(() => {
    if (filters.industry && industriesList.length > 0 && !industriesList.includes(filters.industry)) {
      setFilters(f => ({ ...f, industry: '' }));
    }
  }, [industriesList, filters.industry]);

  useEffect(() => {
    if (filters.tag && tagsList.length > 0 && !tagsList.some(t => t.name === filters.tag)) {
      setFilters(f => ({ ...f, tag: '' }));
    }
  }, [tagsList, filters.tag]);

  // Fetch total records count matching selected filters
  const { data: countData, isLoading: isCountLoading } = useQuery({
    queryKey: ['exportCount', filters],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.tag) queryParams.append('tag', filters.tag);
      queryParams.append('limit', 1);
      return api.get(`/company?${queryParams.toString()}`).then((res) => res.data);
    }
  });

  // Fetch export history list
  const { data: historyResponse, isLoading: isHistoryLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['exportHistory', historyPage, historyLimit, historyUser],
    queryFn: () => api.get(`/export/history?page=${historyPage}&limit=${historyLimit}${historyUser ? `&userId=${historyUser}` : ''}`).then((res) => res.data),
  });

  const historyData = historyResponse?.history || [];
  const historyTotal = historyResponse?.total || 0;
  const historyTotalPages = historyResponse?.totalPages || 1;

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = async (selectedColumns, format) => {
    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.tag) queryParams.append('tag', filters.tag);
      queryParams.append('columns', selectedColumns.join(','));
      queryParams.append('format', format);
      queryParams.append('_t', Date.now().toString());

      const response = await api.get(`/export/companies?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `companies_export_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format === 'csv' ? 'CSV' : 'Excel'} Export Successful`);
      setIsExportModalOpen(false);
      refetchHistory();
    } catch (error) {
      console.error(error);
      toast.error('Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegenerate = async (exportRow) => {
    try {
      setIsExporting(true);
      
      const response = await api.post(`/export/regenerate/${exportRow._id}`, {
        ignoredColumns: []
      }, {
        responseType: 'blob',
      });

      const format = exportRow.fileName?.endsWith('.csv') ? 'csv' : 'xlsx';
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `regenerated_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${format === 'csv' ? 'CSV' : 'Excel'} Regenerate Successful`);
      refetchHistory();
    } catch (error) {
      console.error(error);
      toast.error('Regenerate Failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      country: '',
      city: '',
      industry: '',
      tag: '',
    });
  };

  const confirmDeleteHistory = async () => {
    if (!historyToDelete) return;

    try {
      setIsDeletingHistory(true);
      await api.delete(`/export/history/${historyToDelete._id}`);
      toast.success("Export history deleted successfully");
      setHistoryToDelete(null);
      refetchHistory();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete export history");
    } finally {
      setIsDeletingHistory(false);
    }
  };

  const renderFilters = (exportFilters) => {
    if (!exportFilters || Object.keys(exportFilters).length === 0) {
      return <span className="text-gray-400 text-xs">No filters (All Data)</span>;
    }
    
    // Filter out empty values
    const active = Object.entries(exportFilters).filter(([_, val]) => val);
    if (active.length === 0) {
      return <span className="text-gray-400 text-xs">No filters (All Data)</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {active.map(([key, value]) => (
          <span key={key} className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100/50">
            <span className="capitalize text-indigo-500 mr-1">{key}:</span>
            {value}
          </span>
        ))}
      </div>
    );
  };

  const columns = [
    {
      header: 'Date & Time',
      accessor: 'exportedAt',
      cell: (row) => new Date(row.exportedAt || row.createdAt).toLocaleString()
    },
    {
      header: 'Exported By',
      cell: (row) => (
        <div>
          <span className="font-semibold text-gray-900">{row.exportedBy ? row.exportedBy.name : 'Admin/System'}</span>
          {row.exportedBy?.email && <span className="block text-xs text-gray-500">{row.exportedBy.email}</span>}
        </div>
      )
    },
    {
      header: 'File Name',
      accessor: 'fileName',
      cell: (row) => <span className="font-mono text-xs text-gray-600">{row.fileName}</span>
    },
    {
      header: 'Source',
      accessor: 'exportSource',
      cell: (row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${row.exportSource === 'Centralized DB' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
          {row.exportSource || 'Centralized DB'}
        </span>
      )
    },
    {
      header: 'Filters Applied',
      cell: (row) => renderFilters(row.filters)
    },
    {
      header: 'Records Exported',
      accessor: 'totalRecords',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {row.totalRecords || 0} Records
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleRegenerate(row)}
            disabled={isExporting}
            className="flex items-center gap-1.5 h-9"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </Button>

          <button
            onClick={() => {
              setHistoryModalExportId(row._id);
              setHistoryModalExportData(row);
              setIsHistoryModalOpen(true);
            }}
            className="inline-flex items-center px-3 py-1.5 border border-purple-200 text-xs font-medium rounded-lg shadow-sm text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors h-9"
            title="View Regeneration History"
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
            History
            {row.regenerateCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-800">
                {row.regenerateCount}
              </span>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => setHistoryToDelete(row)}
              className="inline-flex items-center px-3 py-1.5 border border-red-200 text-xs font-medium rounded-lg shadow-sm text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors h-9"
              title="Delete Export History"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 text-red-500" />
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  const exportCount = countData?.total || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="text-sm text-gray-500 mt-1">Download custom filtered prospect data as high-quality Excel sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Filter className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Export Dataset</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value, city: '' })}
              >
                <option value="">All Countries</option>
                {countriesList.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              >
                <option value="">All Cities</option>
                {citiesList.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              >
                <option value="">All Industries</option>
                {industriesList.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              >
                <option value="">All Tags</option>
                {tagsList.map((t) => (
                  <option key={t._id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Status/Export Action Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between text-center relative overflow-hidden">
          {/* Subtle gradient background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
          
          <div className="my-auto space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                <FileDown className="w-10 h-10" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800">Export Summary</h2>
            
            <div>
              {isCountLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-3xl font-extrabold text-indigo-600">{exportCount.toLocaleString()}</p>
                  <p className="text-sm font-medium text-gray-500">Matching records ready to download</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <Button
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={handleExport}
              disabled={isExporting || isCountLoading || exportCount === 0}
              isLoading={isExporting}
            >
              <Download className="w-5 h-5 mr-2" /> 
              Export to Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Export History Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export History</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track when and what filters employees utilized to download data.</p>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <select
              className="border border-gray-300 rounded-lg p-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={historyUser}
              onChange={(e) => {
                setHistoryUser(e.target.value);
                setHistoryPage(1);
              }}
            >
              <option value="">All Users</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
        <Table
          columns={columns}
          data={historyData}
          isLoading={isHistoryLoading}
          emptyMessage="No export logs found."
        />

        {/* Pagination Footer */}
        {historyTotal > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                Showing <span className="font-semibold text-gray-700">{Math.min((historyPage - 1) * historyLimit + 1, historyTotal)}</span> to{" "}
                <span className="font-semibold text-gray-700">{Math.min(historyPage * historyLimit, historyTotal)}</span> of{" "}
                <span className="font-semibold text-gray-700">{historyTotal}</span> logs
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Per page:</span>
                <select
                  className="border border-gray-300 rounded-md p-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer"
                  value={historyLimit}
                  onChange={(e) => {
                    setHistoryLimit(Number(e.target.value));
                    setHistoryPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                disabled={historyPage === 1}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                  historyPage === 1
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map((p) => {
                if (historyTotalPages > 5 && p !== 1 && p !== historyTotalPages && Math.abs(p - historyPage) > 1) {
                  if (p === 2 && historyPage > 3) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  if (p === historyTotalPages - 1 && historyPage < historyTotalPages - 2) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setHistoryPage(p)}
                    className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition border ${
                      historyPage === p
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setHistoryPage(Math.min(historyTotalPages, historyPage + 1))}
                disabled={historyPage === historyTotalPages}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                  historyPage === historyTotalPages
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ExportConfigModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleConfirmExport}
        isExporting={isExporting}
        defaultFormat="xlsx"
      />

      <RegenerateHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        exportId={historyModalExportId}
        exportData={historyModalExportData}
      />

      {/* Delete Confirmation Modal */}
      {historyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-full text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Export History</h3>
                <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete the export record <span className="font-semibold text-slate-900">"{historyToDelete.fileName}"</span> and the generated file on the server?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setHistoryToDelete(null)}
                disabled={isDeletingHistory}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHistory}
                disabled={isDeletingHistory}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-all disabled:opacity-50"
              >
                {isDeletingHistory ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPage;