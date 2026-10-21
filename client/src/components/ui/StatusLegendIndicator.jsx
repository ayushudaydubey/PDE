import React from 'react';

const StatusLegendIndicator = () => {
  return (
    <div className="px-4 sm:px-6 py-5 border-t border-gray-200 bg-white rounded-b-xl">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 bg-gray-50/50 border border-gray-100 rounded-lg p-3">
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]"></div><span className="text-[11px] font-bold text-gray-600">New</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div><span className="text-[11px] font-bold text-gray-600">Assigned</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></div><span className="text-[11px] font-bold text-gray-600">Contacted</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></div><span className="text-[11px] font-bold text-gray-600">Meeting Scheduled</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></div><span className="text-[11px] font-bold text-gray-600">Proposal Sent</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div><span className="text-[11px] font-bold text-gray-600">Negotiation</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div><span className="text-[11px] font-bold text-gray-600">Won</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div><span className="text-[11px] font-bold text-gray-600">Lost</span></div>
        <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#475569]"></div><span className="text-[11px] font-bold text-gray-600">On Hold</span></div>
      </div>
    </div>
  );
};

export default StatusLegendIndicator;
