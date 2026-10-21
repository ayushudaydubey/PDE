import React from 'react';

const Pagination = ({ page = 1, limit = 25, total = 0, onPageChange = () => {}, onLimitChange = () => {} }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-between py-3 px-2">
      <div className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-800">{Math.min((page - 1) * limit + 1, total || 0)}</span> to <span className="font-semibold text-gray-800">{Math.min(page * limit, total || 0)}</span> of <span className="font-semibold text-gray-800">{total}</span></div>

      <div className="flex items-center gap-2">
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="border border-gray-200 rounded-md p-1 text-sm">
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>

        <button disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))} className={`px-3 py-1 rounded-md border ${page <= 1 ? 'text-gray-300 border-gray-100' : 'bg-white hover:shadow-sm'}`}>
          Prev
        </button>

        <div className="px-3 py-1 text-sm">Page {page} / {totalPages}</div>

        <button disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))} className={`px-3 py-1 rounded-md border ${page >= totalPages ? 'text-gray-300 border-gray-100' : 'bg-white hover:shadow-sm'}`}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
