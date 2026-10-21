import React from 'react';

export const getLeadStatusColor = (status) => {
  let s = status === 'none' ? 'New' : status;
  switch (s) {
    case 'Assigned': return 'bg-[#3b82f6]'; // blue-500
    case 'Contacted': return 'bg-[#f97316]'; // orange-500
    case 'Meeting Scheduled': return 'bg-[#a855f7]'; // purple-500
    case 'Proposal Sent': return 'bg-[#6366f1]'; // indigo-500
    case 'Negotiation': return 'bg-[#eab308]'; // yellow-500
    case 'Won': case 'converted': return 'bg-[#22c55e]'; // green-500
    case 'Lost': case 'dead': return 'bg-[#ef4444]'; // red-500
    case 'On Hold': return 'bg-[#475569]'; // slate-600
    case 'New': default: return 'bg-[#cbd5e1]'; // slate-300
  }
};

export const getLeadStatusIcon = (status) => {
  const colorClass = getLeadStatusColor(status);
  return <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>;
};

export const getLeadStatusLabel = (status) => {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'converted': return 'Converted';
    case 'dead': return 'Dead';
    default: return 'None';
  }
};
