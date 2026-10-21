import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOverviewRoute = location.pathname === '/' || location.pathname === '/about';
  const isFullWidth = !isAuthenticated && isOverviewRoute;

  let mainClass = 'bg-gray-50 p-3 sm:p-6 pt-20 sm:pt-22';
  if (isFullWidth) {
    mainClass = 'p-0 bg-white';
  } else if (isOverviewRoute) {
    mainClass = 'bg-gray-50 px-0 pb-0 pt-20 sm:pt-22';
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-900">
      {isAuthenticated && (!isFullWidth || sidebarOpen) && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="flex flex-1 flex-col overflow-hidden relative min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} showMenuButton={isAuthenticated} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto no-scrollbar ${mainClass}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
