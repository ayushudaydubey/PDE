import React from 'react';
import { LogOut, User as UserIcon, Terminal, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { queryClient } from '../api/queryClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import NotificationBell from '../components/notifications/NotificationBell';

const Navbar = ({ onToggleSidebar, showMenuButton }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route path parsing for clean visibility breadcrumb
  const currentPath = location.pathname.split('/').filter(Boolean)[0] || 'overview';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      queryClient.setQueryData(['authUser'], null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className={`absolute top-0 left-0 right-0 z-50 flex shrink-0 items-center justify-between transition-all select-none bg-white/80 backdrop-blur-xl border-b border-slate-100/60 ${!isAuthenticated ? 'min-h-[4.5rem] py-2 sm:py-0 px-3 sm:px-8 lg:px-16 xl:px-20' : 'min-h-[4rem] py-1.5 sm:py-0 px-3 sm:px-8 lg:px-16 xl:px-20'}`}>

      {/* Brand Logo & Navigation Trace */}
      {isAuthenticated ? (
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 mr-2">
          {showMenuButton && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 sm:gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity min-w-0"
          >
            <img src="/img.png" alt="PDE Logo" className="h-6 sm:h-8 w-auto object-contain shrink-0" />
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <span className="font-extrabold bg-gradient-to-r from-zinc-950 to-zinc-600 bg-clip-text text-transparent text-xs sm:text-sm tracking-tight truncate">
                Prospect Data Engine
              </span>
              <span className="text-slate-400 font-semibold shrink-0 hidden sm:inline">/</span>
              <span className="bg-slate-900 text-white font-mono font-semibold px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs tracking-wide shrink-0 truncate max-w-[100px] sm:max-w-none">
                {currentPath}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 mr-1 shrink"
        >
          <img src="/img.png" alt="PDE Logo" className="h-7 sm:h-9 md:h-10 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0" />
          <div className="flex flex-col justify-center -space-y-0.5 min-w-0">
            <span className="font-medium text-zinc-800  text-xs sm:text-base md:text-2xl tracking-tight truncate drop-shadow-sm">
              Prospect Data Engine
            </span>
          </div>
        </div>
      )}

      {/* Operator Credentials & Actions */}
      <div className="flex items-center space-x-2 sm:space-x-6 shrink-0">

        {/* User Operator Identity Box */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-3 border-r border-slate-200 pr-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <UserIcon className="h-4 w-4" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 leading-tight">
                {user?.name || 'Operator Identity'}
              </span>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mt-1">
                {user?.role || 'Access Guest'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 sm:space-x-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-4">
              <button
                onClick={() => navigate('/about')}
                className="text-[11px] sm:text-sm font-semibold text-slate-600 hover:text-zinc-950 px-2 sm:px-3 py-1.5 sm:py-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                About PDE
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-zinc-950 text-white font-semibold text-[11px] sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="
                flex items-center text-xs sm:text-sm font-semibold text-slate-700 
                hover:text-red-700 bg-slate-50 hover:bg-red-50 
                border border-slate-200 hover:border-red-200 
                rounded-lg px-2.5 sm:px-3 py-1.5 transition-all duration-150 
                focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer whitespace-nowrap shrink-0
              "
                title="Disconnect"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-slate-500 shrink-0" />
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;