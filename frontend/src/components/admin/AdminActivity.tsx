import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Activity, Flag, Wallet, AlertCircle, Users, FileText } from 'lucide-react';
import { apiService } from '../../services/api';

export const AdminActivity: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboardStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const activityItems = [
    {
      label: 'Pending moderation reports',
      count: stats?.pending_reports ?? 0,
      icon: Flag,
      href: '/admin/reports',
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Withdrawal requests awaiting review',
      count: stats?.pending_withdrawals ?? 0,
      icon: Wallet,
      href: '/admin/withdrawals',
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Active contract disputes',
      count: stats?.active_disputes ?? 0,
      icon: AlertCircle,
      href: '/admin/contracts',
      color: 'text-pink-600 bg-pink-50',
    },
    {
      label: 'New users (last 30 days)',
      count: stats?.user_growth != null ? `${stats.user_growth}% growth` : '—',
      icon: Users,
      href: '/admin/users',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total contracts on platform',
      count: stats?.total_contracts ?? 0,
      icon: FileText,
      href: '/admin/contracts',
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 text-sm mt-1">Items requiring attention across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Platform Activity Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-700">{item.count}</span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Detailed audit logs are not yet available. Use the linked admin sections to take action on pending items.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
