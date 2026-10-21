import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, MessageSquare, PhoneCall, Mail, Users, CheckCircle2, AlertCircle, User as UserIcon } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';

const CompanyTimelineDrawer = ({ isOpen, onClose, companyId, targetListId, targetList }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("Assigned");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  
  const [dealValue, setDealValue] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [holdReason, setHoldReason] = useState("");

  const [drawerWidth, setDrawerWidth] = useState(448);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      let newWidth = window.innerWidth - e.clientX;
      if (newWidth < 350) newWidth = 350; // Minimum width
      if (newWidth > window.innerWidth - 100) newWidth = window.innerWidth - 100; // Maximum width
      setDrawerWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const res = await api.get(`/company/${companyId}`);
      return res.data;
    },
    enabled: !!companyId && isOpen,
  });

  useEffect(() => {
    if (company?.leadStatus?.status && company.leadStatus.status !== "none" && company.leadStatus.status !== "New") {
      setNewStatus(company.leadStatus.status);
    } else {
      setNewStatus("Assigned");
    }
  }, [company]);

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', companyId],
    queryFn: async () => {
      const res = await api.get(`/activities/company/${companyId}`);
      return res.data;
    },
    enabled: !!companyId && isOpen,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data) => api.put(`/company/${companyId}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['company', companyId]);
      queryClient.invalidateQueries(['activities', companyId]);
      queryClient.invalidateQueries(['target-list', targetListId]);
      queryClient.invalidateQueries(['target-list-stats', targetListId]);
      setNewComment("");
      setNextFollowUpDate("");
      toast.success("Activity logged and status updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update")
  });

  const handleUpdate = () => {
    if (!newStatus) return;
    updateStatusMutation.mutate({
      status: newStatus,
      notes: newComment,
      nextFollowUpDate: nextFollowUpDate || undefined,
      targetListId,
      dealValue: dealValue ? Number(dealValue) : undefined,
      closingDate: closingDate || undefined,
      remarks,
      lossReason,
      holdReason
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <PhoneCall className="w-4 h-4 text-blue-500" />;
      case 'Email': return <Mail className="w-4 h-4 text-indigo-500" />;
      case 'Meeting': return <Users className="w-4 h-4 text-purple-500" />;
      case 'Status Change': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Assignment': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    let s = status === 'none' ? 'New' : status;
    switch (s) {
      case 'Assigned': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Contacted': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Meeting Scheduled': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Proposal Sent': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Negotiation': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Won': case 'converted': return 'text-green-700 bg-green-50 border-green-200';
      case 'Lost': case 'dead': return 'text-red-700 bg-red-50 border-red-200';
      case 'On Hold': return 'text-slate-700 bg-slate-100 border-slate-300';
      case 'New': default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  // Assignment logic
  let assignedUsers = [];
  let assignedBy = null;
  let assignmentDate = null;
  const priority = company?.leadDetails?.priority || targetList?.priority || 'Medium';

  if (targetList && targetList.assignments && targetList.assignments.length > 0) {
    assignedUsers = targetList.assignments.map(a => a.user).filter(Boolean);
    assignedBy = targetList.createdBy;
    assignmentDate = targetList.assignments[0].assignedAt || targetList.createdAt;
  }

  const currentStatus = company?.leadStatus?.status && company.leadStatus.status !== 'none' ? company.leadStatus.status : "New";

  const isOptionDisabled = (optionStatus) => {
    const sequence = ["Assigned", "Contacted", "Meeting Scheduled", "Proposal Sent", "Negotiation"];
    const currentIndex = sequence.indexOf(currentStatus);
    const optionIndex = sequence.indexOf(optionStatus);
    
    // If the option we are rendering is one of the sequential ones
    if (optionIndex !== -1) {
      if (currentIndex !== -1) {
        // We are currently in the sequence, so disable previous and current steps
        return optionIndex <= currentIndex;
      } else {
        // We are NOT in the sequence (e.g. Won, Lost, On Hold).
        // Disable all sequential steps since we're past them, unless we are "New"
        return currentStatus !== "New" && currentStatus !== "none";
      }
    }
    
    // Won, Lost, On Hold are never disabled (can always jump between them)
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity" onClick={onClose} />
      <div 
        className="absolute inset-y-0 right-0 bg-white shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300 max-w-full w-full sm:w-auto"
        style={{ width: `min(100vw, ${drawerWidth}px)`, transitionProperty: isResizing ? 'none' : 'transform' }}
      >
        {/* Resize Handle */}
        <div 
          className="hidden sm:block absolute inset-y-0 left-0 w-1.5 cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-50 transition-colors"
          onMouseDown={(e) => {
             e.preventDefault();
             setIsResizing(true);
          }}
        />
        
        {/* Header Section */}
        <div className="px-5 py-3 border-b border-gray-100 flex flex-col gap-2 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{company?.company_name || "Company Details"}</h2>
                {assignedBy && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 mt-0.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Assigned by:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                         {assignedBy.avatar ? (
                           <img src={assignedBy.avatar} alt={assignedBy.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-indigo-700 font-bold text-[8px]">{assignedBy.name?.substring(0,2).toUpperCase() || 'A'}</span>
                         )}
                      </div>
                      <span className="font-semibold text-gray-700">{assignedBy.name}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeColor(currentStatus)}`}>
                  {currentStatus}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition -mt-1 -mr-2 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="col-span-2">
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Assigned To</div>
              {assignedUsers.length > 0 ? (
                <div className="flex flex-row flex-wrap gap-4">
                  {assignedUsers.map((user, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                         {user?.avatar ? (
                           <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-blue-700 font-bold text-xs">{user?.name?.substring(0,2).toUpperCase() || 'U'}</span>
                         )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{user?.name || 'Unknown'}</span>
                        <span className="text-[10px] text-gray-500 capitalize">{user?.role || 'Sales Executive'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                     <span className="text-blue-700 font-bold text-xs">U</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">Unknown</span>
                    <span className="text-[10px] text-gray-500 capitalize">Sales Executive</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-0">
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Assignment Date</div>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {assignmentDate ? new Date(assignmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </div>
            </div>
            <div className="mt-0">
              <div className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Priority</div>
              <div>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' : priority === 'Low' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                  {priority}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 mb-6 text-sm">Activity Timeline</h3>
          
          {activitiesLoading ? (
            <div className="text-center text-sm text-gray-500 py-10">Loading timeline...</div>
          ) : activities?.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-10">No activity logged yet.</div>
          ) : (
            <div className="relative border-l-[3px] border-gray-300 ml-3 space-y-8 pb-4">
              {activities?.map((activity, idx) => {
                const getStatusDotColor = (status) => {
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

                const dotColor = getStatusDotColor(activity.metadata?.newStatus);
                
                return (
                  <div key={activity._id} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${dotColor} shadow-sm`}></div>
                    
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                          <span>{new Date(activity.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(activity.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {activity.metadata?.newStatus && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeColor(activity.metadata.newStatus)}`}>
                            {activity.metadata.newStatus === 'converted' ? 'Won' : activity.metadata.newStatus === 'dead' ? 'Lost' : activity.metadata.newStatus}
                          </span>
                        )}
                      </div>
                      
                      <div className="font-bold text-gray-900 text-sm">
                         {activity.type === "Status Change" && activity.metadata?.oldStatus && activity.metadata?.newStatus 
                           ? `Status changed to ${activity.metadata.newStatus}` 
                           : activity.type === "Note" ? "Note Added" : activity.type}
                      </div>
                      
                      {activity.notes && (
                        <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm mt-1">
                          {activity.notes}
                        </div>
                      )}

                      {/* Extra Status Metadata */}
                      {(activity.metadata?.dealValue || activity.metadata?.lossReason || activity.metadata?.holdReason) && (
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-1 space-y-1.5 text-sm shadow-sm">
                          {activity.metadata?.dealValue && (
                            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                              <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Deal Value</span>
                              <span className="text-green-600 font-bold">${Number(activity.metadata.dealValue).toLocaleString()}</span>
                            </div>
                          )}
                          {activity.metadata?.closingDate && (
                            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                              <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Closing Date</span>
                              <span className="text-gray-900 font-semibold">{new Date(activity.metadata.closingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          )}
                          {activity.metadata?.remarks && (
                            <div className="pt-1">
                              <span className="text-gray-500 font-bold text-xs uppercase tracking-wider block mb-1">Remarks</span>
                              <span className="text-gray-700 text-xs">{activity.metadata.remarks}</span>
                            </div>
                          )}
                          {activity.metadata?.lossReason && (
                            <div className="pt-1">
                              <span className="text-gray-500 font-bold text-xs uppercase tracking-wider block mb-1">Reason for Loss</span>
                              <span className="text-red-600 font-medium text-sm">{activity.metadata.lossReason}</span>
                            </div>
                          )}
                          {activity.metadata?.holdReason && (
                            <div className="pt-1">
                              <span className="text-gray-500 font-bold text-xs uppercase tracking-wider block mb-1">Hold Reason</span>
                              <span className="text-orange-600 font-medium text-sm">{activity.metadata.holdReason}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {activity.metadata?.nextFollowUpDate && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded w-max border border-blue-100">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Next Follow-up: {new Date(activity.metadata.nextFollowUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(activity.metadata.nextFollowUpDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {activity.createdBy?.avatar ? (
                            <img src={activity.createdBy.avatar} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-gray-500">By {activity.createdBy?.name || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Footer - Unified Form */}
        <div className="bg-gray-50/50 border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <div className="flex-1">
               <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Status</label>
               <select 
                 value={newStatus} 
                 onChange={(e) => setNewStatus(e.target.value)}
                 className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
               >
                 <option value="Assigned" disabled={isOptionDisabled("Assigned")}>Assigned</option>
                 <option value="Contacted" disabled={isOptionDisabled("Contacted")}>Contacted</option>
                 <option value="Meeting Scheduled" disabled={isOptionDisabled("Meeting Scheduled")}>Meeting Scheduled</option>
                 <option value="Proposal Sent" disabled={isOptionDisabled("Proposal Sent")}>Proposal Sent</option>
                 <option value="Negotiation" disabled={isOptionDisabled("Negotiation")}>Negotiation</option>
                 <option value="Won" disabled={isOptionDisabled("Won")}>Won</option>
                 <option value="Lost" disabled={isOptionDisabled("Lost")}>Lost</option>
                 <option value="On Hold" disabled={isOptionDisabled("On Hold")}>On Hold</option>
               </select>
            </div>
            
            <div className="flex-1">
               <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Next Follow-up</label>
               <input 
                 type="datetime-local" 
                 value={nextFollowUpDate}
                 onChange={(e) => setNextFollowUpDate(e.target.value)}
                 className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
               />
            </div>
          </div>

          <div className="space-y-2 mb-2">
             {newStatus === "Won" && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 <div className="flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Deal Value</label>
                   <input type="number" placeholder="e.g. 50000" value={dealValue} onChange={(e) => setDealValue(e.target.value)} className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors shadow-sm" />
                 </div>
                 <div className="flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Closing Date</label>
                   <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors shadow-sm" />
                 </div>
                 <div className="col-span-2 flex flex-col">
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Remarks</label>
                   <input type="text" placeholder="Add any remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors shadow-sm" />
                 </div>
               </div>
             )}
             {newStatus === "Lost" && (
               <input type="text" placeholder="Reason for Loss (Mandatory)" value={lossReason} onChange={(e) => setLossReason(e.target.value)} className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 shadow-sm" />
             )}
             {newStatus === "On Hold" && (
               <input type="text" placeholder="Hold Reason (Mandatory)" value={holdReason} onChange={(e) => setHoldReason(e.target.value)} className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 shadow-sm" />
             )}
          </div>

          <div>
             <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Add Comment</label>
             <textarea
               className="w-full border border-gray-300 rounded-md px-2.5 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-sm"
               rows={2}
               placeholder="Enter update or comment..."
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
             />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={onClose} className="px-4 py-1.5 text-xs h-8">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateStatusMutation.isLoading} className="px-4 py-1.5 text-xs h-8 bg-blue-600 hover:bg-blue-700">
              {updateStatusMutation.isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
               Save Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyTimelineDrawer;
