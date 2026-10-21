import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FilterSidebar = ({ cities, industries, countries = [], tagsList = [], filters, setFilters, onReset, onExport, isExporting, canExport }) => {
  const selectClassName = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="w-full bg-white rounded-xl p-5 border border-gray-100 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Filters</h3>
          <p className="text-xs text-gray-500">Filter companies by country, city, industry, or search query.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onReset} size="sm">Reset</Button>
          {canExport && (
            <Button variant="primary" onClick={onExport} disabled={isExporting} size="sm">
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Country</label>
          <select
            value={filters.country || ''}
            onChange={(e) => setFilters({ ...filters, country: e.target.value, page: 1 })}
            className={selectClassName}
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
          <select
            value={filters.city || ''}
            onChange={(e) => setFilters({ ...filters, city: e.target.value, page: 1 })}
            className={selectClassName}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Industry</label>
          <select
            value={filters.industry || ''}
            onChange={(e) => setFilters({ ...filters, industry: e.target.value, page: 1 })}
            className={selectClassName}
          >
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tag</label>
          <select
            value={filters.tag || ''}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value, page: 1 })}
            className={selectClassName}
          >
            <option value="">All tags</option>
            {tagsList.map((t) => (
              <option key={t._id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
          <Input
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Search companies..."
          />
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
