import React, { useRef, useEffect, useState } from 'react';

const Table = ({ columns, data, isLoading, emptyMessage = 'No data available' }) => {
  const tableContainerRef = useRef(null);
  const topScrollRef = useRef(null);
  const [tableWidth, setTableWidth] = useState('100%');
  const isSyncingTop = useRef(false);
  const isSyncingTable = useRef(false);

  const handleTopScroll = (e) => {
    if (isSyncingTable.current) return;
    isSyncingTop.current = true;
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = e.target.scrollLeft;
    }
    requestAnimationFrame(() => { isSyncingTop.current = false; });
  };

  const handleTableScroll = (e) => {
    if (isSyncingTop.current) return;
    isSyncingTable.current = true;
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
    requestAnimationFrame(() => { isSyncingTable.current = false; });
  };

  useEffect(() => {
    const updateWidth = () => {
      if (tableContainerRef.current) {
        setTableWidth(`${tableContainerRef.current.scrollWidth}px`);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (tableContainerRef.current) observer.observe(tableContainerRef.current);
    return () => observer.disconnect();
  }, [data, columns]);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden relative">
      {/* Top Synced Horizontal Scrollbar - Fixed at top of table */}
      <div
        ref={topScrollRef}
        onScroll={handleTopScroll}
        className="overflow-x-auto bg-slate-100 border-b border-gray-200 shrink-0 custom-scrollbar cursor-pointer"
      >
        <div style={{ width: tableWidth, height: '1px' }} />
      </div>

      {/* Main Table Scroll Container */}
      <div
        ref={tableContainerRef}
        onScroll={handleTableScroll}
        className="overflow-auto flex-1 min-h-0 custom-scrollbar w-full relative"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50 border-b border-gray-200"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 overflow-visible">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 font-medium">
                  Loading...
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-indigo-50/40 transition-colors relative z-0">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 relative overflow-visible">
                      {col.cell ? col.cell(row, rowIndex, data.length) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
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

export default Table;
