import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { Shield } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminJobs } from '../components/admin/AdminJobs';
import { AdminGigs } from '../components/admin/AdminGigs';
import { AdminContracts } from '../components/admin/AdminContracts';
import { AdminReports } from '../components/admin/AdminReports';
import { AdminTransactions } from '../components/admin/AdminTransactions';
import { AdminWithdrawals } from '../components/admin/AdminWithdrawals';
import { AdminAnalytics } from '../components/admin/AdminAnalytics';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminActivity } from '../components/admin/AdminActivity';

export const AdminPanelPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to dashboard if on /admin
  if (location.pathname === '/admin') {
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3">
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="gigs" element={<AdminGigs />} />
              <Route path="contracts" element={<AdminContracts />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="withdrawals" element={<AdminWithdrawals />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="activity" element={<AdminActivity />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
