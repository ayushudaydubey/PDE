import React, { useState } from 'react';
import { RefreshCw, Download, Search } from 'lucide-react';

const SearchFilterBar = ({ countries = [], industries = [], filters = {}, setFilters = () => {}, onRefresh = () => {}, onExport = () => {} }) => {
  const [search, setSearch] = useState(filters.search || '');

  const apply = () => {
    setFilters({ ...filters, search, page: 1 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 w-full sm:w-1/2">
        <div className="relative flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="Search companies, email, phone..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button onClick={apply} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <button onClick={onRefresh} className="px-3 py-2 bg-white rounded-lg border border-gray-200 hover:shadow-sm">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <select value={filters.country || ''} onChange={(e) => setFilters({ ...filters, country: e.target.value, page: 1 })} className="border border-gray-200 rounded-lg p-2 text-sm">
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={filters.industry || ''} onChange={(e) => setFilters({ ...filters, industry: e.target.value, page: 1 })} className="border border-gray-200 rounded-lg p-2 text-sm">
          <option value="">All Industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        <input type="date" value={filters.date || ''} onChange={(e) => setFilters({ ...filters, date: e.target.value, page: 1 })} className="border border-gray-200 rounded-lg p-2 text-sm" />

        <button onClick={() => onExport()} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:shadow-md flex items-center gap-2">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar;
