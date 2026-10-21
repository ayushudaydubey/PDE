import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useFileCompanies } from '../hooks/useFileCompanies';
import { useCities } from '../hooks/useCities';
import { useIndustries } from '../hooks/useIndustries';
import { useCountries } from '../hooks/useCountries';
import { useExport } from '../hooks/useExport';
import { useAuth } from '../../../hooks/useAuth';
import FilterSidebar from '../components/FilterSidebar';
import FileCompaniesTable from '../components/FileCompaniesTable';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import ExportConfigModal from '../../../components/ui/ExportConfigModal';

const FileDetailsPage = () => {
  const { fileId } = useParams();
  const { user } = useAuth();

  const role = user?.role || 'sales';
  const canExport = role === 'admin' || role === 'marketing';

  const [filters, setFilters] = useState({ page: 1, limit: 25, city: '', industry: '', country: '', search: '', tag: '' });

  const { data: citiesData } = useCities(fileId, { country: filters.country, industry: filters.industry, tag: filters.tag });
  const cities = citiesData || [];

  const { data: industriesData } = useIndustries(fileId, { country: filters.country, city: filters.city, tag: filters.tag });
  const industries = industriesData || [];

  const { data: countriesData } = useCountries(fileId, { industry: filters.industry, city: filters.city, tag: filters.tag });
  const countries = countriesData || [];

  const { data: tagsList = [] } = useQuery({
    queryKey: ['fileTags', fileId, filters.industry, filters.city, filters.country],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.country) queryParams.append('country', filters.country);
      const res = await api.get(`/files/${fileId}/tags?${queryParams.toString()}`);
      return res.data.data;
    },
  });
  

  const { data, isLoading, refetch } = useFileCompanies(fileId, filters);

  useEffect(() => {
    refetch();
  }, [filters]);

  useEffect(() => {
    if (filters.country && countries.length > 0 && !countries.includes(filters.country)) {
      setFilters(f => ({ ...f, country: '', page: 1 }));
    }
  }, [countries, filters.country]);

  useEffect(() => {
    if (filters.city && cities.length > 0 && !cities.includes(filters.city)) {
      setFilters(f => ({ ...f, city: '', page: 1 }));
    }
  }, [cities, filters.city]);

  useEffect(() => {
    if (filters.industry && industries.length > 0 && !industries.includes(filters.industry)) {
      setFilters(f => ({ ...f, industry: '', page: 1 }));
    }
  }, [industries, filters.industry]);

  useEffect(() => {
    if (filters.tag && tagsList.length > 0 && !tagsList.some(t => t.name === filters.tag)) {
      setFilters(f => ({ ...f, tag: '', page: 1 }));
    }
  }, [tagsList, filters.tag]);

  const exportMutation = useExport();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleReset = () => setFilters({ page: 1, limit: 25, city: '', industry: '', country: '', search: '', tag: '' });

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = async (selectedColumns, format) => {
    try {
      setIsExporting(true);
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.industry) params.industry = filters.industry;
      if (filters.country) params.country = filters.country;
      if (filters.search) params.search = filters.search;
      if (filters.tag) params.tag = filters.tag;
      params.format = format;
      params.columns = selectedColumns.join(',');

      const res = await api.get(`/files/${fileId}/export?${new URLSearchParams(params).toString()}`, { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${fileId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
      toast.success(`${format === 'csv' ? 'CSV' : 'Excel'} Export Successful`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-6.5rem)] min-h-[calc(100vh-6.5rem)] space-y-4 w-full">
      {/* Top Fixed Section */}
      <div className="shrink-0 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">File Details</h1>
          <p className="text-sm text-gray-500 mt-1">Browse companies from this uploaded file.</p>
        </div>

        <div className="w-full">
          <FilterSidebar
            cities={cities}
            industries={industries}
            countries={countries}
            tagsList={tagsList}
            filters={filters}
            setFilters={setFilters}
            onReset={handleReset}
            onExport={handleExport}
            isExporting={isExporting}
            canExport={canExport}
          />
        </div>

        <div className="flex items-center justify-end">
          <label className="text-sm text-gray-600 mr-2">Rows per page:</label>
          <select
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}
            className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Table Card Wrapper */}
      <div className="flex-1 min-h-[550px] lg:min-h-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative w-full">
        <FileCompaniesTable data={data?.data || []} isLoading={isLoading} emptyMessage="No companies found for this file." />

        <div className="shrink-0 flex items-center justify-between p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="text-sm text-gray-600">Total: {data?.total || 0}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 disabled:opacity-50 transition shadow-sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            >
              Prev
            </button>
            <div className="px-3 py-1 text-sm font-medium">Page {filters.page}</div>
            <button
              className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 disabled:opacity-50 transition shadow-sm"
              disabled={data && filters.page * filters.limit >= (data.total || 0)}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ExportConfigModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleConfirmExport}
        isExporting={isExporting}
        defaultFormat="csv"
      />
    </div>
  );
};

export default FileDetailsPage;
