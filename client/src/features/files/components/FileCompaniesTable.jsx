import React, { useState } from 'react';
import Table from '../../../components/ui/Table';
import HoverCard from '../../../components/ui/HoverCard';
import { Circle, FileText, CheckCircle2, XCircle, Clock, Users, Link as LinkIcon } from 'lucide-react';
import { openMailComposer } from '../../../utils/mailUtils';
import { useAuth } from '../../../hooks/useAuth';
import CompanyDetailsModal from '../../companies/components/CompanyDetailsModal';
import CompanyNameHoverCards from '../../companies/components/CompanyNameHoverCards';
import { getLeadStatusIcon } from '../../../utils/statusColors';
import StatusLegendIndicator from '../../../components/ui/StatusLegendIndicator';



const getColumns = (user, onOpenCompany) => [
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
                onClick={(e) => { e.stopPropagation(); onOpenCompany(row._id); }}
                className="font-medium text-gray-900 text-left hover:text-indigo-600"
              >
                {row.company_name}
              </button>
            </div>
          }
        />
      );
    }
  },
  {
    header: 'Website',
    accessor: 'website',
    cell: (row) => row.website ? (
      <a
        href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        Visit
      </a>
    ) : '-'
  },
  {
    header: 'Email',
    accessor: 'email',
    cell: (row) => row.email ? (
          <button
            type="button"
            onClick={() => openMailComposer(row.email, row.company_name, user)}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium select-all text-left cursor-pointer bg-transparent border-none p-0"
          >{row.email}</button>
    ) : '-'
  },
  {
    header: 'Contact No',
    accessor: 'phone',
    cell: (row) => row.phone || '-'
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

      const hasPlatformLinks = (platform) => Array.isArray(social[platform]) ? social[platform].length > 0 : Boolean(social[platform]);
      const hasLinks = ['facebook', 'youtube', 'instagram', 'x', 'linkedin'].some(hasPlatformLinks);

      const isBottom = totalRows && totalRows > 5 && (totalRows - rowIndex) <= 5;

      const renderPlatform = (platform, label, colorClass, hoverClass, textClass) => {
        const value = social[platform];
        if (!value) return null;

        if (Array.isArray(value)) {
          return value.map((link, idx) => {
            const urlRaw = typeof link === 'string' ? link : (link && typeof link.url === 'string' ? link.url : '');
            if (!urlRaw) return null;
            const url = urlRaw.startsWith('http') ? urlRaw : `https://${urlRaw}`;
            const username = typeof link === 'string' ? label : (typeof link.username === 'string' && link.username.trim() ? link.username : label);
            return (
              <a key={`${platform}-${idx}`} href={url} target="_blank" rel="noreferrer" className={`flex flex-col p-2.5 rounded-lg border border-transparent ${hoverClass} transition-all group/link`}>
                <span className={`font-semibold text-gray-700 group-hover/link:${textClass}`}>{String(username)}</span>
                <span className={`text-xs ${colorClass} break-all`}>{String(urlRaw)}</span>
              </a>
            );
          });
        }

        if (typeof value === 'string') {
          const urlRaw = value;
          const url = urlRaw.startsWith('http') ? urlRaw : `https://${urlRaw}`;
          return (
            <a key={`${platform}-single`} href={url} target="_blank" rel="noreferrer" className={`flex flex-col p-2.5 rounded-lg border border-transparent ${hoverClass} transition-all group/link`}>
              <span className={`font-semibold text-gray-700 group-hover/link:${textClass}`}>{label}</span>
              <span className={`text-xs ${colorClass} break-all`}>{urlRaw}</span>
            </a>
          );
        }

        return null;
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
            <div className="space-y-2">
              {renderPlatform('facebook', 'Facebook', 'text-blue-500', 'hover:border-blue-100 hover:bg-blue-50/50', 'text-blue-700')}
              {renderPlatform('youtube', 'YouTube', 'text-red-500', 'hover:border-red-100 hover:bg-red-50/50', 'text-red-700')}
              {renderPlatform('instagram', 'Instagram', 'text-pink-500', 'hover:border-pink-100 hover:bg-pink-50/50', 'text-pink-700')}
              {renderPlatform('x', 'X (Twitter)', 'text-gray-600', 'hover:border-gray-200 hover:bg-gray-50', 'text-gray-900')}
              {renderPlatform('linkedin', 'LinkedIn', 'text-blue-600', 'hover:border-blue-100 hover:bg-blue-50/50', 'text-blue-700')}
            </div>
          )}
        </HoverCard>
      );
    }
  },
  { header: 'City', accessor: 'city', cell: (row) => row.city || '-' },
  { header: 'Country', accessor: 'country', cell: (row) => row.country || '-' },
  { header: 'Industry', accessor: 'industry', cell: (row) => row.industry || '-' },
  {
    header: 'Tags',
    accessor: 'tags',
    cell: (row) => {
      const tags = row.tags || [];
      if (tags.length === 0) return <span className="text-gray-400 text-xs">No tags</span>;
      return (
        <div className="flex flex-nowrap gap-1.5 py-1 overflow-x-auto custom-scrollbar min-w-[120px] max-w-[200px] pb-1">
          {tags.map((t) => (
            <span key={t._id} className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {t.name}
            </span>
          ))}
        </div>
      );
    }
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
            <p className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {row.description}
            </p>
          </div>
        </div>
      );
    }
  }
];

const FileCompaniesTable = ({ data, isLoading, emptyMessage }) => {
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCompany = (companyId) => {
    setSelectedCompanyId(companyId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompanyId(null);
  };

  const columns = getColumns(user, handleOpenCompany);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative w-full">
      <Table columns={columns} data={data} isLoading={isLoading} emptyMessage={emptyMessage} />
      <div className="shrink-0">
        <StatusLegendIndicator />
      </div>
      <CompanyDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        companyId={selectedCompanyId}
        onEditTags={() => {}}
      />
    </div>
  );
};

export default FileCompaniesTable;
