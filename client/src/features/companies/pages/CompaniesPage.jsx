import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Tag, Circle, FileText, CheckCircle2, XCircle, Clock, Users, Link as LinkIcon, Target } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../hooks/useAuth';
import Table from '../../../components/ui/Table';
import HoverCard from '../../../components/ui/HoverCard';
import Button from '../../../components/ui/Button';
import CreateCompanyModal from '../components/CreateCompanyModal';
import TagAssignmentModal from '../components/TagAssignmentModal';
import CompanyDetailsModal from '../components/CompanyDetailsModal';
import CompanyNameHoverCards from '../components/CompanyNameHoverCards';
import ExportConfigModal from '../../../components/ui/ExportConfigModal';
import CreateTargetListModal from '../../targetLists/components/CreateTargetListModal';
import { toast } from 'react-toastify';
import { openMailComposer } from '../../../utils/mailUtils';
import { getLeadStatusIcon } from '../../../utils/statusColors';
import StatusLegendIndicator from '../../../components/ui/StatusLegendIndicator';

const fetchCompanies = async (searchParams, page = 1, limit = 10) => {
  const query = new URLSearchParams();

  if (searchParams.city) query.append('city', searchParams.city);
  if (searchParams.industry) query.append('industry', searchParams.industry);
  if (searchParams.country) query.append('country', searchParams.country);
  if (searchParams.tag) query.append('tag', searchParams.tag);
  if (searchParams.search) query.append('search', searchParams.search);
  if (searchParams.leadStatus) query.append('leadStatus', searchParams.leadStatus);
  query.append('page', page);
  query.append('limit', limit);

  const response = await api.get(`/company?${query.toString()}`);

  return response.data;
};

const CompaniesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = user?.role || 'sales';

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Tag Assignment Modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [taggingCompanyIds, setTaggingCompanyIds] = useState([]);
  const [taggingInitialTags, setTaggingInitialTags] = useState([]);

  // Details Modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    city: '',
    industry: '',
    country: '',
    tag: '',
    leadStatus: '',
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [isTargetListModalOpen, setIsTargetListModalOpen] = useState(false);

  const handleOpenDetails = (id) => {
    setSelectedCompanyId(id);
    setIsDetailsOpen(true);
  };

  const handleOpenTagAssignment = (companyIdsArray, initialTagsArray = []) => {
    setTaggingCompanyIds(companyIdsArray);
    setTaggingInitialTags(initialTagsArray);
    setIsTagModalOpen(true);
  };

  // =========================
  // Fetch Tags
  // =========================
  const { data: tagsList = [] } = useQuery({
    queryKey: ['filters', 'tags', filters.industry, filters.city, filters.country, filters.leadStatus],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.leadStatus) queryParams.append('leadStatus', filters.leadStatus);
      const res = await api.get(`/filters/tags?${queryParams.toString()}`);
      return res.data.data;
    },
  });

  // =========================
  // Fetch Countries
  // =========================
  const { data: countriesList = [] } = useQuery({
    queryKey: ['filters', 'countries', filters.industry, filters.city, filters.tag, filters.leadStatus],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.tag) queryParams.append('tag', filters.tag);
      if (filters.leadStatus) queryParams.append('leadStatus', filters.leadStatus);
      const res = await api.get(`/filters/countries?${queryParams.toString()}`);
      return res.data.data;
    },
  });

  // =========================
  // Fetch Cities
  // =========================
  const { data: citiesList = [] } = useQuery({
    queryKey: ['filters', 'cities', filters.country, filters.industry, filters.tag, filters.leadStatus],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.tag) queryParams.append('tag', filters.tag);
      if (filters.leadStatus) queryParams.append('leadStatus', filters.leadStatus);
      const res = await api.get(`/filters/cities?${queryParams.toString()}`);
      return res.data.data;
    },
  });

  // =========================
  // Fetch Industries
  // =========================
  const { data: industriesList = [] } = useQuery({
    queryKey: ['filters', 'industries', filters.country, filters.city, filters.tag, filters.leadStatus],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.tag) queryParams.append('tag', filters.tag);
      if (filters.leadStatus) queryParams.append('leadStatus', filters.leadStatus);
      const res = await api.get(`/filters/industries?${queryParams.toString()}`);
      return res.data.data;
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

  // =========================
  // Fetch Companies
  // =========================
  const [page, setPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);

  // Hover state for company name tooltip (use explicit state + small hide delay to avoid flicker)
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const hoverTimeoutsRef = useRef({}); // Per-row timeouts to prevent overlap

  // Reset page and selection when search filters change immediately
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
  }, [filters]);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', filters, page, limitPerPage],
    queryFn: () => fetchCompanies(filters, page, limitPerPage),
  });

  const companies = data?.companies || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const limit = data?.limit || 10;

  // =========================
  // Export Handler
  // =========================
  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = async (selectedColumns, format) => {
    try {
      setIsExporting(true);
      const query = new URLSearchParams();
      if (filters.city) query.append('city', filters.city);
      if (filters.industry) query.append('industry', filters.industry);
      if (filters.country) query.append('country', filters.country);
      if (filters.tag) query.append('tag', filters.tag);
      if (filters.search) query.append('search', filters.search);
      if (filters.leadStatus) query.append('leadStatus', filters.leadStatus);
      query.append('columns', selectedColumns.join(','));
      query.append('format', format);
      query.append('_t', Date.now().toString());

      const response = await api.get(`/export/companies?${query.toString()}`, {
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

      setIsExportModalOpen(false);
      toast.success('Export Successful');
    } catch (error) {
      console.error(error);
      toast.error('Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  // =========================
  // Table Columns
  // =========================

  const columns = [
    ...(role === 'admin' || role === 'sales'
      ? [
        {
          header: (
            <input
              type="checkbox"
              checked={companies.length > 0 && selectedIds.length === companies.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(companies.map((c) => c._id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          ),
          accessor: 'selection',
          cell: (row) => (
            <input
              type="checkbox"
              checked={selectedIds.includes(row._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds([...selectedIds, row._id]);
                } else {
                  setSelectedIds(selectedIds.filter((id) => id !== row._id));
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          ),
        },
      ]
      : []),

    {
      header: 'Company Name',
      accessor: 'company_name',
      cell: (row) => {
        const status = row.leadStatus?.status || 'none';
        const updatedBy = row.leadStatus?.updatedBy?.name || 'Unknown';
        return (
          <CompanyNameHoverCards
            status={status}
            updatedBy={updatedBy}
            contactPages={row.contactPages}
            trigger={
              <div className="flex items-center gap-2 group">
                <div className="cursor-help flex items-center">
                  {getLeadStatusIcon(status)}
                </div>
                <button
                  onClick={() => handleOpenDetails(row._id)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-left focus:outline-none transition-colors"
                >
                  {row.company_name}
                </button>
              </div>
            }
          />
        );
      },
    },

    {
      header: 'Website',
      accessor: 'website',
      cell: (row) =>
        row.website ? (
          <a
            href={
              row.website.startsWith('http')
                ? row.website
                : `https://${row.website}`
            }
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Visit
          </a>
        ) : (
          '-'
        ),
    },

    {
      header: 'Email',
      accessor: 'email',
      cell: (row) =>
        row.email ? (
          <button
            type="button"
            onClick={() => openMailComposer(row.email, row.company_name, user)}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium select-all text-left cursor-pointer bg-transparent border-none p-0"
          >
            {row.email}
          </button>
        ) : (
          '-'
        ),
    },

    {
      header: 'Contact No',
      accessor: 'phone',
      cell: (row) => row.phone || '-',
    },

    {
      header: 'Contact Employees',
      accessor: 'contacts',
      cell: (row, rowIndex, totalRows) => {
        const rawContacts = row.contacts || [];
        // Filter out contacts that are actually the company's own data
        const contacts = rawContacts.filter(c => {
          const nameMatch = c.name && row.company_name && c.name.trim().toLowerCase() === row.company_name.trim().toLowerCase();
          const phoneMatch = c.contactNumber && row.phone && c.contactNumber.trim() === row.phone.trim();
          // Exclude if name matches company name OR phone matches company phone (and no other unique info)
          if (nameMatch && !c.email && (!c.position || c.position === '')) return false;
          if (phoneMatch && !c.name) return false;
          if (nameMatch && phoneMatch) return false;
          return true;
        });

        const isBottom = totalRows && totalRows > 5 && (totalRows - rowIndex) <= 5;

        return (
          <HoverCard
            preferTop={isBottom}
            width="w-[26rem]"
            trigger={
              <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition">
                <Users className="w-3.5 h-3.5" /> {contacts.length > 0 ? `View ${contacts.length} Contacts` : 'Contact Employees'}
              </button>
            }
          >
            <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Employee Contacts</h4>
            {contacts.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500 font-medium">No employee contacts available</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {contacts.map((contact, i) => (
                  <div key={i} className="flex justify-between items-start text-xs p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors shadow-sm">
                    <div className="flex flex-col gap-1 max-w-[50%]">
                      <span className="font-bold text-gray-900 text-sm truncate" title={contact.name}>{contact.name || "Unknown Name"}</span>
                      <span className="text-gray-500 font-medium truncate" title={contact.position}>{contact.position || "No position"}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right max-w-[50%]">
                      {contact.email ? <button type="button" onClick={() => openMailComposer(contact.email, row.company_name, user)} className="text-blue-600 font-medium hover:underline truncate w-full text-right cursor-pointer bg-transparent border-none p-0" title={contact.email}>{contact.email}</button> : <span className="text-gray-400">No Email</span>}
                      {contact.contactNumber ? <span className="text-gray-700 font-medium truncate w-full" title={contact.contactNumber}>{contact.contactNumber}</span> : <span className="text-gray-400">No Phone</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HoverCard>
        );
      }
    },

    {
      header: 'Social Media Links',
      accessor: 'socialMedia',
      cell: (row, rowIndex, totalRows) => {
        const social = row.socialMedia || {};
        
        // Helper to check if any links exist in array
        const hasPlatformLinks = (platform) => Array.isArray(social[platform]) && social[platform].length > 0;
        const hasLinks = ['facebook', 'youtube', 'instagram', 'x', 'linkedin'].some(hasPlatformLinks);

        const isBottom = totalRows && totalRows > 5 && (totalRows - rowIndex) <= 5;

        const renderLinks = (platform, label, urlPrefix, colorClass, hoverClass, borderClass, textClass) => {
          if (!hasPlatformLinks(platform)) return null;
          return social[platform].map((link, idx) => {
            const urlRaw = typeof link === 'string'
              ? link
              : (link && (typeof link.url === 'string' ? link.url : (typeof link.link === 'string' ? link.link : '')));
            if (!urlRaw || typeof urlRaw !== 'string') return null;
            const url = urlRaw.startsWith('http') ? urlRaw : `https://${urlRaw}`;
            const username = typeof link === 'string' ? label : (typeof link.username === 'string' && link.username.trim() ? link.username : label);

            return (
              <a key={`${platform}-${idx}`} href={url} target="_blank" rel="noreferrer" className={`flex flex-col p-2.5 rounded-lg border border-transparent ${hoverClass} transition-all group/link`}>
                <span className={`font-semibold text-gray-700 group-hover/link:${textClass}`}>
                  {String(username)}
                </span>
                <span className={`text-xs ${colorClass} break-all`}>{String(urlRaw)}</span>
              </a>
            );
          });
        };

        return (
          <HoverCard
            preferTop={isBottom}
            width="w-[26rem]"
            trigger={
              <button className="flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded transition">
                <LinkIcon className="w-3.5 h-3.5" /> Connect on Social
              </button>
            }
          >
            <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Social Media Links</h4>
            {!hasLinks ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500 font-medium">No links available</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {renderLinks('facebook', 'Facebook', '', 'text-blue-500', 'hover:border-blue-100 hover:bg-blue-50/50', '', 'text-blue-700')}
                {renderLinks('youtube', 'YouTube', '', 'text-red-500', 'hover:border-red-100 hover:bg-red-50/50', '', 'text-red-700')}
                {renderLinks('instagram', 'Instagram', '', 'text-pink-500', 'hover:border-pink-100 hover:bg-pink-50/50', '', 'text-pink-700')}
                {renderLinks('x', 'X (Twitter)', '', 'text-gray-600', 'hover:border-gray-200 hover:bg-gray-50', '', 'text-gray-900')}
                {renderLinks('linkedin', 'LinkedIn', '', 'text-blue-600', 'hover:border-blue-100 hover:bg-blue-50/50', '', 'text-blue-700')}
              </div>
            )}
          </HoverCard>
        );
      }
    },

    {
      header: 'City',
      accessor: 'city',
      cell: (row) => row.city || '-',
    },

    {
      header: 'Country',
      accessor: 'country',
      cell: (row) => row.country || '-',
    },

    {
      header: 'Industry',
      accessor: 'industry',
      cell: (row) => row.industry || '-',
    },

    {
      header: 'Tags',
      accessor: 'tags',
      cell: (row) => {
        const tags = row.tags || [];
        return (
          <div className="flex items-center gap-2 min-w-[150px] max-w-[250px]">
            {tags.length === 0 ? (
              <span className="text-gray-400 text-xs italic">No tags</span>
            ) : (
              <div className="flex flex-nowrap gap-1.5 py-1 overflow-x-auto custom-scrollbar flex-1 pb-1">
                {tags.map((t) => (
                  <span key={t._id} className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {t.name}
                  </span>
                ))}
              </div>
            )}

            {(role === 'admin' || role === 'sales') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTagAssignment([row._id], row.tags);
                }}
                className="p-1 hover:bg-indigo-50 rounded-full text-gray-400 hover:text-indigo-600 transition shrink-0"
                title="Manage tags for this company"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },

    {
      header: 'Description',
      accessor: 'description',
      cell: (row) => {
        if (!row.description) return <span className="text-gray-400 text-xs">-</span>;
        return (
          <div className="relative group inline-block">
            <button className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition">
              <FileText className="w-3.5 h-3.5" /> Watch description
            </button>

            <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3">
              <h4 className="text-xs font-bold text-gray-800 mb-1 border-b pb-1">Description</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                {row.description}
              </p>
            </div>
          </div>
        );
      }
    },

    {
      header: 'Source',
      accessor: 'source',
      cell: (row) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
          {row.source?.replace('_', ' ') || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-6.5rem)] min-h-[calc(100vh-6.5rem)] space-y-4">
      {/* Top Fixed Controls Section */}
      <div className="shrink-0 space-y-4">
        {/* =========================
            Header
        ========================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Companies
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage your centralized company database.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            {(role === 'admin' || role === 'marketing') && (
              <Button
                onClick={handleExport}
                variant="secondary"
                className="flex-1 sm:flex-none justify-center whitespace-nowrap text-xs sm:text-sm px-2.5 py-2"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
                Export Excel
              </Button>
            )}

            {role === 'admin' && (
              <Button
                onClick={() => setIsTargetListModalOpen(true)}
                variant="secondary"
                className="flex-1 sm:flex-none justify-center whitespace-nowrap text-xs sm:text-sm px-2.5 py-2"
              >
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
                Target List
              </Button>
            )}

            {(role === 'admin' || role === 'sales') && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto sm:flex-none justify-center whitespace-nowrap text-xs sm:text-sm px-3 py-2"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0" />
                Add Company
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
          {/* Top Controls: Search, Lead Status Filter, and Limit */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1 w-full sm:w-auto items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                  placeholder="Search companies by name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              {/* Lead Status Filter right next to Search Bar */}
              <div className="w-full sm:w-auto min-w-[170px]">
                <select
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm bg-white cursor-pointer font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-400"
                  value={filters.leadStatus || ''}
                  onChange={(e) => setFilters({ ...filters, leadStatus: e.target.value })}
                >
                  <option value="">All Lead Statuses</option>
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Rows per page:</span>
              <select
                className="border border-gray-300 rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer"
                value={limitPerPage}
                onChange={(e) => {
                  setLimitPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={150}>150</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 items-end">
            {/* Tag */}
            <div className="col-span-1 sm:w-auto flex-1 min-w-[130px]">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tag</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500 text-xs sm:text-sm"
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              >
                <option value="">All Tags</option>
                {tagsList.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
              </select>
            </div>

            {/* Country */}
            <div className="col-span-1 sm:w-auto flex-1 min-w-[130px]">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Country</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500 text-xs sm:text-sm"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value, city: '', industry: '' })}
              >
                <option value="">All Countries</option>
                {countriesList.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
            </div>

            {/* City */}
            <div className="col-span-1 sm:w-auto flex-1 min-w-[130px]">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">City</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500 text-xs sm:text-sm"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              >
                <option value="">All Cities</option>
                {citiesList.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* Industry */}
            <div className="col-span-1 sm:w-auto flex-1 min-w-[130px]">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Industry</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500 text-xs sm:text-sm"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              >
                <option value="">All Industries</option>
                {industriesList.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
              </select>
            </div>

            {/* Reset Button */}
            <Button
              type="button"
              onClick={() => setFilters({ search: '', city: '', industry: '', country: '', tag: '', leadStatus: '' })}
              variant="secondary"
              className="col-span-2 sm:col-span-1 w-full sm:w-auto shrink-0 py-2 text-xs sm:text-sm"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* =========================
            Bulk Selection Banner
        ========================== */}
        {(role === 'admin' || role === 'sales') && selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm animate-pulse-subtle">
            <div className="flex items-center gap-2 text-indigo-950 font-semibold text-sm">
              <span>{selectedIds.length} {selectedIds.length === 1 ? "company" : "companies"} selected</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => handleOpenTagAssignment(selectedIds, [])}
                className="bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-600"
              >
                <Tag className="w-4 h-4 mr-2" /> Assign Tags
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedIds([])}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-100/50"
              >
                Deselect All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          Companies Table
      ========================== */}
      <div className="flex-1 min-h-[550px] lg:min-h-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        <Table
          columns={columns}
          data={companies}
          isLoading={isLoading}
          emptyMessage="No companies found."
        />

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                Showing <span className="font-semibold text-gray-700">{limit === 'all' ? 1 : Math.min((page - 1) * limit + 1, total)}</span> to{" "}
                <span className="font-semibold text-gray-700">{limit === 'all' ? total : Math.min(page * limit, total)}</span> of{" "}
                <span className="font-semibold text-gray-700">{total}</span> companies
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${page === 1
                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                  }`}
              >
                Previous
              </button>

              {/* Dynamic Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (
                  totalPages > 5 &&
                  p !== 1 &&
                  p !== totalPages &&
                  Math.abs(p - page) > 1
                ) {
                  if (p === 2 && page > 3) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  return null;
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition border ${page === p
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
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${page === totalPages
                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="shrink-0">
          <StatusLegendIndicator />
        </div>
      </div>

      {/* =========================
          Create Company Modal
      ========================== */}
      <CreateCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* =========================
          Tag Assignment Modal
      ========================== */}
      <TagAssignmentModal
        isOpen={isTagModalOpen}
        onClose={() => {
          setIsTagModalOpen(false);
          setSelectedIds([]); // Clear selections after assigning
        }}
        companyIds={taggingCompanyIds}
        initialTags={taggingInitialTags}
      />

      {/* =========================
          Company Details Modal
      ========================== */}
      <CompanyDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCompanyId(null);
        }}
        companyId={selectedCompanyId}
        onEditTags={(company) => {
          setIsDetailsOpen(false);
          handleOpenTagAssignment([company._id], company.tags);
        }}
      />

      {/* =========================
          Export Column Select Modal
      ========================== */}
      <ExportConfigModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleConfirmExport}
        isExporting={isExporting}
        defaultFormat="xlsx"
      />

      <CreateTargetListModal
        isOpen={isTargetListModalOpen}
        onClose={() => setIsTargetListModalOpen(false)}
        filters={filters}
        onSuccess={(newList) => {
          toast.success('Target list created successfully');
          queryClient.invalidateQueries(['target-lists']);
          navigate(`/target-lists`);
        }}
      />
    </div>
  );
};

export default CompaniesPage;