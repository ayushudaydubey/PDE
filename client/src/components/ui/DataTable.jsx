import React from 'react';
import Spinner from './Spinner';

const DataTable = ({ columns = [], data = [], isLoading = false, emptyMessage = 'No data available', stickyHeader = true }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className={`${stickyHeader ? 'sticky top-0 bg-white/90 backdrop-blur-sm z-10' : ''}`}>
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <Spinner />
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm text-gray-900 align-top border-b border-gray-50">
                      {col.cell ? col.cell(row) : (row[col.accessor] ?? 'N/A')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
