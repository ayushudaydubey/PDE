import React, { useState, useRef, useEffect } from 'react';
import { Bell, Target, CheckCircle2, ArrowRight, BellOff, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
    refetchInterval: 2500, // Fast real-time polling every 2.5s
  });

  // Real-time Server-Sent Events (SSE) listener
  useEffect(() => {
    const baseUrl = api.defaults.baseURL || 'http://localhost:3000/api';
    const sseUrl = `${baseUrl}/notifications/stream`;

    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'new_notification') {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          toast.info(`🎯 ${data.notification?.title || 'New Task'}: ${data.notification?.message || 'A target list was assigned to you.'}`, {
            autoClose: 6000,
          });
        }
      } catch (e) {
        // Heartbeat or non-json message
      }
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/mark-read');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousData = queryClient.getQueryData(['notifications']);
      if (previousData) {
        queryClient.setQueryData(['notifications'], {
          ...previousData,
          unreadCount: 0,
          notifications: previousData.notifications.map((n) => ({ ...n, isRead: true })),
        });
      }
      return { previousData };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['notifications'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // Hide unread count immediately upon opening when count > 0
    if (nextState && unreadCount > 0) {
      markReadMutation.mutate();
    }
  };

  const handleNotificationClick = (notification) => {
    setIsOpen(false);
    if (notification.targetListId) {
      navigate(`/target-lists`);
    } else {
      navigate('/target-lists');
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="
          relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl
          bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 hover:text-indigo-600
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer
          shadow-sm hover:shadow
        "
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-105" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="
            absolute -top-1.5 -right-1.5 flex items-center justify-center
            min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white
            bg-rose-500 rounded-full border-2 border-white shadow-sm
            animate-pulse
          ">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="
          absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-xl
          shadow-2xl border border-slate-200/80 z-50 overflow-hidden
          animate-in fade-in slide-in-from-top-2 duration-200
        ">
          {/* Dropdown Header */}
          <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide uppercase">Notifications</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-semibold">
                {notifications.length} Total
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <BellOff className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  When target lists or tasks are assigned to you, messages will appear right here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`
                      p-3.5 sm:p-4 transition-colors cursor-pointer flex gap-3 items-start
                      ${isUnread ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50'}
                    `}
                  >
                    <div className={`
                      h-8 w-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 shadow-sm
                      ${isUnread ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}
                    `}>
                      <Target className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {notif.title || 'Target List Assigned'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {notif.message}
                      </p>

                      {notif.targetListId && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800">
                          <span>View Target List</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/target-lists');
                }}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 w-full py-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              >
                <span>Go to Target Lists</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
