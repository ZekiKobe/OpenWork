import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  Users, 
  Briefcase, 
  ShoppingBag, 
  FileText, 
  DollarSign, 
  Wallet, 
  Flag, 
  AlertCircle,
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { apiService } from '../../services/api';

interface DashboardStats {
  total_users: number;
  active_jobs: number;
  active_gigs: number;
  total_contracts: number;
  platform_revenue: number;
  pending_withdrawals: number;
  pending_reports: number;
  active_disputes: number;
  user_growth?: number;
  revenue_growth?: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboardStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to existing endpoints if admin endpoint fails
      try {
        const [moderationStats, usersResponse] = await Promise.all([
          apiService.getModerationStats(),
          apiService.getAllUsers()
        ]);
        setStats({
          total_users: usersResponse.data.length,
          active_jobs: 0,
          active_gigs: 0,
          total_contracts: 0,
          platform_revenue: 0,
          pending_withdrawals: 0,
          pending_reports: moderationStats.pending_reports,
          active_disputes: 0,
        });
      } catch (fallbackError) {
        console.error('Fallback data load failed:', fallbackError);
      }
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      growth: stats?.user_growth,
    },
    {
      title: 'Active Jobs',
      value: stats?.active_jobs || 0,
      icon: Briefcase,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Gigs',
      value: stats?.active_gigs || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Contracts',
      value: stats?.total_contracts || 0,
      icon: FileText,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Platform Revenue',
      value: `$${(stats?.platform_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      growth: stats?.revenue_growth,
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.pending_withdrawals || 0,
      icon: Wallet,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pending Reports',
      value: stats?.pending_reports || 0,
      icon: Flag,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Active Disputes',
      value: stats?.active_disputes || 0,
      icon: AlertCircle,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 text-sm mt-1">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    {stat.growth !== undefined && (
                      <div className="flex items-center mt-2">
                        {stat.growth >= 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${stat.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.abs(stat.growth)}%
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      </div>
                    )}
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p>Chart will be implemented with recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-2" />
                <p>Chart will be implemented with recharts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <p>Recent activity feed will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
