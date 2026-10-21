import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Search, ArrowLeft, RefreshCw, CheckCircle2, Clock, XCircle, Circle, Link as LinkIcon, FileText, Users, Plus, MoreVertical, Calendar, Flag, User as UserIcon } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import Table from '../../../components/ui/Table';
import HoverCard from '../../../components/ui/HoverCard';
import Button from '../../../components/ui/Button';
import { openMailComposer } from '../../../utils/mailUtils';
import CompanyDetailsModal from '../../companies/components/CompanyDetailsModal';
import CompanyNameHoverCards from '../../companies/components/CompanyNameHoverCards';
import CompanyTimelineDrawer from '../../companies/components/CompanyTimelineDrawer';
import { getLeadStatusIcon } from '../../../utils/statusColors';
import StatusLegendIndicator from '../../../components/ui/StatusLegendIndicator';

const TargetListDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [filterStat, setFilterStat] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['target-list', id, page, limitPerPage, filterStat],
    queryFn: async () => {
      let url = `/target-lists/${id}?page=${page}&limit=${limitPerPage}`;
      if (filterStat) {
        url += `&filterStat=${filterStat}`;
      }
      const res = await api.get(url);
      return res.data;
    }
  });

  const repopulateMutation = useMutation({
    mutationFn: () => api.post(`/target-lists/${id}/repopulate`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['target-list', id]);
      queryClient.invalidateQueries(['target-list-stats', id]);
    },
    onError: () => toast.error("Failed to repopulate target list")
  });

  const { data: statsData } = useQuery({
    queryKey: ['target-list-stats', id],
    queryFn: async () => {
      const res = await api.get(`/target-lists/${id}/stats`);
      return res.data;
    }
  });

  const targetList = data?.targetList;
  const companiesData = data?.companies;
  const companies = companiesData?.data || [];
  const total = companiesData?.total || 0;
  const totalPages = Math.ceil(total / limitPerPage) || 1;

  const handleOpenDetails = (companyId) => {
    setSelectedCompanyId(companyId);
    setIsDetailsOpen(true);
  };

  const columns = [
    {
      header: 'COMPANY NAME',
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
      header: 'ASSIGNMENT STATUS',
      accessor: 'status',
      cell: (row) => {
        let status = row.leadStatus?.status || 'New';
        if (status === 'none') status = 'New';
        
        let colorClass = 'bg-gray-100 text-gray-700 border-gray-200';
        if (status === 'Assigned') colorClass = 'bg-blue-100 text-blue-700 border-blue-200';
        else if (status === 'Contacted') colorClass = 'bg-amber-100 text-amber-700 border-amber-200';
        else if (status === 'Meeting Scheduled') colorClass = 'bg-purple-100 text-purple-700 border-purple-200';
        else if (status === 'Proposal Sent') colorClass = 'bg-indigo-100 text-indigo-700 border-indigo-200';
        else if (status === 'Negotiation') colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        else if (status === 'Won' || status === 'converted') colorClass = 'bg-green-100 text-green-700 border-green-200';
        else if (status === 'Lost' || status === 'dead') colorClass = 'bg-red-100 text-red-700 border-red-200';
        else if (status === 'On Hold') colorClass = 'bg-slate-200 text-slate-700 border-slate-300';
        
        return <span className={`px-2 py-1 rounded text-[10px] font-bold border ${colorClass}`}>{status === 'converted' ? 'Won' : status === 'dead' ? 'Lost' : status}</span>;
      }
    },
    {
      header: 'LATEST ACTIVITY',
      accessor: 'latestActivity',
      cell: (row) => {
        if (!row.latestActivity || !row.latestActivity.date) return <span className="text-gray-400 text-xs">-</span>;
        return (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-[12px] font-bold text-[#1e3a8a]">{new Date(row.latestActivity.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="text-[11px] text-gray-500 truncate max-w-[180px] block" title={row.latestActivity.notes}>{row.latestActivity.notes}</span>
          </div>
        );
      }
    },
    {
      header: 'NEXT FOLLOW-UP',
      accessor: 'nextFollowUp',
      cell: (row) => {
        if (!row.nextFollowUp || !row.nextFollowUp.date) return <span className="text-gray-400 text-xs">-</span>;
        
        const followUpDate = new Date(row.nextFollowUp.date);
        
        let status = row.leadStatus?.status || 'New';
        if (status === 'none') status = 'New';
        
        let colorClass = 'text-gray-700 bg-gray-50 border border-gray-200';
        if (status === 'Assigned') colorClass = 'text-blue-700 bg-blue-50 border border-blue-200';
        else if (status === 'Contacted') colorClass = 'text-amber-700 bg-amber-50 border border-amber-200';
        else if (status === 'Meeting Scheduled') colorClass = 'text-purple-700 bg-purple-50 border border-purple-200';
        else if (status === 'Proposal Sent') colorClass = 'text-indigo-700 bg-indigo-50 border border-indigo-200';
        else if (status === 'Negotiation') colorClass = 'text-yellow-700 bg-yellow-50 border border-yellow-200';
        else if (status === 'Won' || status === 'converted') colorClass = 'text-green-700 bg-green-50 border border-green-200';
        else if (status === 'Lost' || status === 'dead') colorClass = 'text-red-700 bg-red-50 border border-red-200';
        else if (status === 'On Hold') colorClass = 'text-slate-700 bg-slate-100 border border-slate-300';
        
        return (
          <div className={`inline-flex flex-col items-start justify-center gap-0.5 px-2.5 py-1.5 rounded-lg ${colorClass}`}>
            <div className="flex items-center gap-1.5 font-bold text-[11px]">
               <Calendar className="w-3.5 h-3.5 opacity-80" />
               {followUpDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <span className="text-[10px] font-medium opacity-80 ml-5">
               {followUpDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      }
    },
    {
      header: 'EMAIL',
      accessor: 'email',
      cell: (row) =>
        row.email ? (
          <button
            type="button"
            onClick={() => openMailComposer(row.email, row.company_name, user)}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium select-all text-left cursor-pointer bg-transparent border-none p-0 text-xs"
          >
            {row.email}
          </button>
        ) : '-',
    },
    {
      header: 'CONTACT NO',
      accessor: 'phone',
      cell: (row) => <span className="text-xs">{row.phone || '-'}</span>,
    },
    {
      header: 'CONTACT EMPLOYEES',
      accessor: 'contacts',
      cell: (row, rowIndex, totalRows) => {
        const rawContacts = row.contacts || [];
        const contacts = rawContacts.filter(c => {
          const nameMatch = c.name && row.company_name && c.name.trim().toLowerCase() === row.company_name.trim().toLowerCase();
          const phoneMatch = c.contactNumber && row.phone && c.contactNumber.trim() === row.phone.trim();
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
                <Users className="w-3.5 h-3.5" /> {contacts.length > 0 ? `${contacts.length} View Contacts` : 'View Contacts'}
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
    { header: 'CITY', accessor: 'city', cell: (row) => row.city || '-' },
    { header: 'COUNTRY', accessor: 'country', cell: (row) => row.country || '-' },
    { header: 'INDUSTRY', accessor: 'industry', cell: (row) => row.industry || '-' },
    {
      header: 'TAGS',
      accessor: 'tags',
      cell: (row) => {
        const tags = row.tags || [];
        return (
          <div className="flex items-center gap-2 min-w-[150px] max-w-[250px]">
            {tags.length === 0 ? <span className="text-gray-400 text-xs italic">-</span> : (
              <div className="flex flex-nowrap gap-1.5 py-1 overflow-x-auto custom-scrollbar flex-1 pb-1">
                {tags.map((t) => (
                  <span key={t._id} className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">{t.name}</span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const formatFilters = (filters) => {
    if (!filters || Object.keys(filters).length === 0) return "All Companies";
    const parts = [];
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (filters.industry) parts.push(`Industry: ${filters.industry}`);
    if (filters.city) parts.push(`City: ${filters.city}`);
    if (filters.country) parts.push(`Country: ${filters.country}`);
    if (filters.tag) parts.push(`Tag: ${filters.tag}`);
    return parts.join(' • ') || "All Companies";
  };

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-6.5rem)] min-h-[calc(100vh-6.5rem)] space-y-4">
      {/* Top Fixed Section */}
      <div className="shrink-0 space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col xl:flex-row items-start justify-between gap-6 w-full">
          
          {/* Left Side: Title */}
          <div className="flex items-start gap-4 shrink-0">
            <button 
              onClick={() => navigate('/target-lists')}
              className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors mt-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="pt-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                {targetList?.name || 'Loading...'}
              </h1>
            </div>
          </div>
          
          {/* Center: Meta Data Professional Section */}
          <div className="flex-1 flex flex-wrap items-center justify-start xl:justify-center gap-4 text-sm w-full">
            {/* Created By & Date */}
            <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span>
                Created by <span className="font-semibold text-gray-900">{targetList?.createdBy?.name || 'Unknown'}</span>
                <span className="mx-2 text-gray-400">|</span>
                {targetList?.createdAt ? new Date(targetList.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
              </span>
            </div>

            {/* Assignments */}
            {targetList?.assignments && targetList.assignments.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <div className="flex items-center gap-1">
                  <span className="font-medium mr-1">Assigned:</span>
                  {targetList.assignments.map((assignment, idx) => (
                    <span key={idx} className="font-semibold">
                      {assignment.user?.name || 'Unknown'}
                      <span className="text-blue-500 capitalize ml-1 font-normal">({assignment.user?.role || 'user'})</span>
                      {idx < targetList.assignments.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Priority */}
            <div className="flex items-center gap-2 bg-orange-50 text-orange-800 px-3 py-2 rounded-lg border border-orange-200 shadow-sm">
              <Flag className="w-4 h-4 text-orange-500" />
              <span>Priority: <span className="font-semibold">{targetList?.priority || 'Medium'}</span></span>
            </div>

            {/* Filters */}
            <div className="w-full mt-1">
              <div className="flex items-start gap-2 bg-green-50 text-green-800 px-3 py-2.5 rounded-lg border border-green-200 shadow-sm">
                <Search className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="break-words leading-relaxed text-sm">
                  <span className="font-medium mr-1">Filters:</span> 
                  {formatFilters(targetList?.filters)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Side: Repopulate Button */}
          <div className="shrink-0 flex items-start pt-1">
            <Button
              onClick={() => repopulateMutation.mutate()}
              disabled={repopulateMutation.isLoading}
              className="shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${repopulateMutation.isLoading ? 'animate-spin' : ''}`} />
              Repopulate
            </Button>
          </div>
        </div>

        {statsData && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div 
              onClick={() => setFilterStat('')}
              className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow ${filterStat === '' ? 'ring-2 ring-zinc-400 border-transparent' : 'border-gray-100'}`}
            >
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Targets</span>
              <span className="text-2xl font-bold text-gray-900">{statsData.totalTargets}</span>
            </div>
            <div 
              onClick={() => setFilterStat('assigned')}
              className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow ${filterStat === 'assigned' ? 'ring-2 ring-blue-600 border-transparent' : 'border-gray-100'}`}
            >
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Assigned Leads</span>
              <span className="text-2xl font-bold text-blue-600">{statsData.assignedLeads}</span>
            </div>
            <div 
              onClick={() => setFilterStat('unassigned')}
              className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow ${filterStat === 'unassigned' ? 'ring-2 ring-orange-500 border-transparent' : 'border-gray-100'}`}
            >
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Unassigned</span>
              <span className="text-2xl font-bold text-orange-500">{statsData.unassignedLeads}</span>
            </div>
            <div 
              onClick={() => setFilterStat('active_followups')}
              className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow ${filterStat === 'active_followups' ? 'ring-2 ring-purple-600 border-transparent' : 'border-gray-100'}`}
            >
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Follow-ups</span>
              <span className="text-2xl font-bold text-purple-600">{statsData.activeFollowUps}</span>
            </div>
            <div 
              onClick={() => setFilterStat('won')}
              className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow ${filterStat === 'won' ? 'ring-2 ring-green-500 border-transparent' : 'border-gray-100'}`}
            >
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Won Opps</span>
              <span className="text-2xl font-bold text-green-500">{statsData.wonOpportunities}</span>
            </div>
            <div 
              onClick={() => setFilterStat('lost')}
              className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow ${filterStat === 'lost' ? 'ring-2 ring-red-500 border-transparent' : 'border-gray-100'}`}
            >
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Lost Opps</span>
              <span className="text-2xl font-bold text-red-500">{statsData.lostOpportunities}</span>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="flex-1 min-h-[550px] lg:min-h-0 flex flex-col bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="shrink-0 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-gray-700">Rows per page:</span>
            <select
              value={limitPerPage}
              onChange={(e) => {
                setLimitPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No companies found</h3>
            <p className="mt-1">Try clicking 'Repopulate' to run the filters again.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative w-full">
            <Table columns={columns} data={companies} isLoading={isLoading} />
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="shrink-0 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50">
                <div className="text-sm text-gray-700 font-medium">
                  Showing <span className="font-bold text-gray-900">{((page - 1) * limitPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limitPerPage, total)}</span> of <span className="font-bold text-gray-900">{total}</span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${page === 1 ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}>Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => {
                    if (i > 0 && arr[i - 1] !== p - 1) return <span key={`ellipsis-${p}`} className="px-1 text-gray-400">...</span>;
                    return (
                      <button key={p} onClick={() => setPage(p)} className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition border ${page === p ? "bg-blue-600 text-white" : "bg-white"}`}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${page === totalPages ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}>Next</button>
                </div>
              </div>
            )}
            
            <div className="shrink-0">
              <StatusLegendIndicator />
            </div>
          </div>
        )}
      </div>

      <CompanyTimelineDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        companyId={selectedCompanyId}
        targetListId={id}
        targetList={targetList}
      />
    </div>
  );
};

export default TargetListDetailsPage;
