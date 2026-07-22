import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'withdrawals'>('overview');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [withdrawDetails, setWithdrawDetails] = useState({ account_number: '', routing_number: '', account_name: '' });

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData, withdrawalsData] = await Promise.all([
        apiService.getWalletBalance(),
        apiService.getTransactionHistory(1, 10),
        apiService.getWithdrawalHistory(1, 10)
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData.transactions || []);
      setWithdrawals(withdrawalsData.withdrawals || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (!withdrawAmount || parseFloat(withdrawAmount) < 10) {
        toast.error('Minimum withdrawal is ETB 10.00');
        return;
      }

      await apiService.createWithdrawal(
        parseFloat(withdrawAmount),
        withdrawMethod,
        withdrawDetails
      );

      toast.success('Withdrawal request submitted');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      loadWalletData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create withdrawal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">Wallet</h1>
          <p className="text-secondary-600 mt-2">Manage your earnings and payments</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Available Balance</p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  ETB {balance?.available_balance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Wallet className="w-12 h-12 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Pending (Escrow)</p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  ETB {balance?.pending_balance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600">Total Earned</p>
                <p className="text-3xl font-bold text-secondary-900 mt-2">
                  ETB {balance?.total_earned?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-4 font-medium ${
                activeTab === 'overview'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-4 px-4 font-medium ${
                activeTab === 'transactions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`pb-4 px-4 font-medium ${
                activeTab === 'withdrawals'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Withdrawals
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-secondary-900">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full"
                  disabled={!balance || balance.available_balance < 10}
                >
                  <ArrowUpRight className="w-5 h-5 mr-2" />
                  Request Withdrawal
                </Button>
                <Button
                  onClick={() => setActiveTab('transactions')}
                  variant="outline"
                  className="w-full"
                >
                  <History className="w-5 h-5 mr-2" />
                  View All Transactions
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Recent Transactions</h2>
              {transactions.length === 0 ? (
                <p className="text-secondary-500">No transactions yet</p>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {tx.transaction_type === 'escrow_release' || tx.transaction_type === 'payment' ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-secondary-900">{tx.description}</p>
                          <p className="text-sm text-secondary-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.transaction_type === 'escrow_release' || tx.transaction_type === 'payment'
                            ? 'text-green-600'
                            : 'text-secondary-900'
                        }`}>
                          {tx.transaction_type === 'escrow_release' || tx.transaction_type === 'payment' ? '+' : '-'}
                          ETB {tx.net_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-secondary-500">{tx.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'transactions' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">All Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-secondary-500">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {tx.transaction_type === 'escrow_release' || tx.transaction_type === 'payment' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-secondary-900">{tx.description}</p>
                        <p className="text-sm text-secondary-500">
                          {new Date(tx.created_at).toLocaleDateString()} • {tx.transaction_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.transaction_type === 'escrow_release' || tx.transaction_type === 'payment'
                          ? 'text-green-600'
                          : 'text-secondary-900'
                      }`}>
                        {tx.transaction_type === 'escrow_release' || tx.transaction_type === 'payment' ? '+' : '-'}
                        ${tx.net_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-secondary-500">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'withdrawals' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-secondary-900">Withdrawal History</h2>
              <Button onClick={() => setShowWithdrawModal(true)}>
                <ArrowUpRight className="w-5 h-5 mr-2" />
                New Withdrawal
              </Button>
            </div>
            {withdrawals.length === 0 ? (
              <p className="text-secondary-500">No withdrawals yet</p>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div>
                      <p className="font-medium text-secondary-900">
                        ETB {withdrawal.net_amount.toFixed(2)} via {withdrawal.method}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {new Date(withdrawal.created_at).toLocaleDateString()} • {withdrawal.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary-900">
                        ETB {withdrawal.amount.toFixed(2)}
                      </p>
                      {withdrawal.fee > 0 && (
                        <p className="text-sm text-secondary-500">Fee: ETB {withdrawal.fee.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Request Withdrawal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Minimum ETB 10.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Method</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                    <option value="crypto">Crypto</option>
                  </select>
                </div>

                {withdrawMethod === 'bank_transfer' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={withdrawDetails.account_name}
                        onChange={(e) => setWithdrawDetails({ ...withdrawDetails, account_name: e.target.value })}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={withdrawDetails.account_number}
                        onChange={(e) => setWithdrawDetails({ ...withdrawDetails, account_number: e.target.value })}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">Routing Number</label>
                      <input
                        type="text"
                        value={withdrawDetails.routing_number}
                        onChange={(e) => setWithdrawDetails({ ...withdrawDetails, routing_number: e.target.value })}
                        className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={handleWithdraw}
                    className="flex-1"
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10}
                  >
                    Submit Request
                  </Button>
                  <Button
                    onClick={() => setShowWithdrawModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
