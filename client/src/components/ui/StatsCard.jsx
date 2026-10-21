import React from 'react';

const StatsCard = ({ title, value, icon, className = '' }) => {
  return (
    <div className={`bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 dark:text-slate-300">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
        </div>
        <div className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
