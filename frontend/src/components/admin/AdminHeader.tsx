import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.startsWith('/admin/users')) return 'Users Management';
    if (path.startsWith('/admin/jobs')) return 'Jobs Management';
    if (path.startsWith('/admin/gigs')) return 'Gigs Management';
    if (path.startsWith('/admin/contracts')) return 'Contracts Management';
    if (path.startsWith('/admin/reports')) return 'Reports & Moderation';
    if (path.startsWith('/admin/transactions')) return 'Transactions';
    if (path.startsWith('/admin/withdrawals')) return 'Withdrawals';
    if (path.startsWith('/admin/analytics')) return 'Analytics & Reports';
    if (path.startsWith('/admin/settings')) return 'Settings';
    if (path.startsWith('/admin/activity')) return 'Activity Logs';
    return 'Admin Panel';
  };

  const breadcrumbs = [
    { label: 'Admin', path: '/admin' },
    { label: getPageTitle(), path: location.pathname },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="w-4 h-4" />
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
