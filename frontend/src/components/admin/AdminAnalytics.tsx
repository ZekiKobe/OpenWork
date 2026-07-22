import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { BarChart3, Users, Briefcase, ShoppingBag, DollarSign, Flag, Wallet, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [txStats, setTxStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [overview, transactions] = await Promise.all([
        apiService.getAdminDashboardStats(),
        apiService.getAdminTransactionStats().catch(() => null),
      ]);
      setStats(overview.stats);
      setTxStats(transactions?.stats || null);
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const metrics = [
    { label: 'Total Users', value: stats?.total_users ?? 0, sub: `${stats?.active_users ?? 0} active`, icon: Users, color: 'text-blue-600' },
    { label: 'Active Jobs', value: stats?.active_jobs ?? 0, icon: Briefcase, color: 'text-green-600' },
    { label: 'Active Gigs', value: stats?.active_gigs ?? 0, icon: ShoppingBag, color: 'text-purple-600' },
    { label: 'Platform Revenue', value: `ETB ${(stats?.platform_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-yellow-600' },
    { label: 'Pending Reports', value: stats?.pending_reports ?? 0, icon: Flag, color: 'text-red-600' },
    { label: 'Pending Withdrawals', value: stats?.pending_withdrawals ?? 0, icon: Wallet, color: 'text-orange-600' },
    { label: 'Active Disputes', value: stats?.active_disputes ?? 0, icon: AlertCircle, color: 'text-pink-600' },
    { label: 'User Growth (30d)', value: `${stats?.user_growth ?? 0}%`, icon: BarChart3, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 text-sm mt-1">Platform metrics from live data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{m.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
                    {m.sub && <p className="text-xs text-gray-500 mt-1">{m.sub}</p>}
                  </div>
                  <Icon className={`w-6 h-6 ${m.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {txStats && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Transactions</p>
                <p className="text-lg font-semibold">{txStats.total_transactions}</p>
              </div>
              <div>
                <p className="text-gray-500">Completed</p>
                <p className="text-lg font-semibold">{txStats.completed_transactions}</p>
              </div>
              <div>
                <p className="text-gray-500">Pending</p>
                <p className="text-lg font-semibold">{txStats.pending_transactions}</p>
              </div>
              <div>
                <p className="text-gray-500">Platform Fees</p>
                <p className="text-lg font-semibold">ETB {(txStats.total_fees || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
