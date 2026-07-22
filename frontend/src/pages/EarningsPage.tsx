import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { 
  Wallet, TrendingUp, TrendingDown, 
  Calendar, DollarSign, BarChart3, User
} from 'lucide-react';
import ProfileSidebar from '../components/common/ProfileSidebar';
import type { UserProfile } from '../types';

const EarningsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    totalProjects: 0,
    completedProjects: 0,
    activeProjects: 0
  });
  
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      const [balanceData, transactionsData, contractsData] = await Promise.all([
        apiService.getWalletBalance(),
        apiService.getTransactionHistory(1, 10),
        apiService.getMyContracts({ page: 1, limit: 100 })
      ]);

      setWalletBalance(balanceData);
      setRecentTransactions(transactionsData.transactions || []);

      // Calculate earnings stats
      const completedContracts = contractsData.contracts.filter((c: any) => 
        c.status === 'completed' || c.status === 'approved'
      );
      const activeContracts = contractsData.contracts.filter((c: any) => 
        c.status === 'active' || c.status === 'in_progress'
      );

      setEarningsData({
        totalEarnings: balanceData.total_earned || 0,
        monthlyEarnings: 0, // Would need date filtering
        weeklyEarnings: 0, // Would need date filtering
        totalProjects: contractsData.contracts.length,
        completedProjects: completedContracts.length,
        activeProjects: activeContracts.length
      });
    } catch (error) {
      console.error('Error loading earnings data:', error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user) {
        const profileResponse = await apiService.getUserProfile();
        setProfile(profileResponse);
        setIsOwnProfile(true);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const { scrollTo } = useSmoothScroll();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="primary" text="Loading earnings data..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Please log in to view your earnings</h2>
          <a href="/login" className="text-primary-600 hover:underline">Go to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar profile={profile} isOwnProfile={isOwnProfile} />
          
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden mb-6">
              <div className="p-5 border-b border-secondary-100">
                <div className="flex items-center">
                  <Wallet className="w-6 h-6 mr-3 text-primary-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Earnings</h1>
                    <p className="text-secondary-600 mt-1">Track your income and payments</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-green-800">ETB {earningsData.totalEarnings.toFixed(2)}</p>
                          <p className="text-sm text-green-600">Total Earnings</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-blue-800">ETB {earningsData.monthlyEarnings.toFixed(2)}</p>
                          <p className="text-sm text-blue-600">This Month</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-purple-800">ETB {earningsData.weeklyEarnings.toFixed(2)}</p>
                          <p className="text-sm text-purple-600">This Week</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-orange-800">{earningsData.completedProjects}</p>
                          <p className="text-sm text-orange-600">Completed Projects</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Wallet Balance */}
                {walletBalance && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wallet className="w-5 h-5 mr-2 text-primary-600" />
                        Wallet Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-secondary-600 mb-1">Available</p>
                          <p className="text-2xl font-bold text-green-600">
                            ETB {walletBalance.available_balance?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-secondary-600 mb-1">Pending (Escrow)</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            ETB {walletBalance.pending_balance?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-secondary-600 mb-1">Total Balance</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ETB {walletBalance.total_balance?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <Link to="/wallet">
                          <Button variant="outline">View Full Wallet</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                      Recent Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-secondary-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Project</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-200">
                          {recentTransactions.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-secondary-500">
                                No transactions yet
                              </td>
                            </tr>
                          ) : (
                            recentTransactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-secondary-900">
                                  {transaction.description || transaction.transaction_type}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-500">
                                  {new Date(transaction.created_at).toLocaleDateString()}
                                </td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                                  transaction.transaction_type === 'escrow_release' || transaction.transaction_type === 'payment'
                                    ? 'text-green-600'
                                    : 'text-secondary-900'
                                }`}>
                                  {transaction.transaction_type === 'escrow_release' || transaction.transaction_type === 'payment' ? '+' : '-'}
                                  ETB {transaction.net_amount?.toFixed(2) || transaction.amount?.toFixed(2) || '0.00'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    transaction.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : transaction.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {transaction.status || 'pending'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline">
                        View All Transactions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;