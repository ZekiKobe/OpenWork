import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ReviewModal } from '../components/reviews/ReviewModal';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  User, 
  BarChart3,
  Eye,
  Edit,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

// Types for contract data
interface Contract {
  id: number;
  title: string;
  description: string;
  freelancer: {
    id: number;
    username: string;
    avatar_url?: string;
    rating: number;
  };
  gig: {
    id: number;
    title: string;
  };
  price: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
  created_at: string;
  deadline?: string;
  progress: number;
  client_rating?: number;
  client_review?: string;
}

const MyContractsPage: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedContractForReview, setSelectedContractForReview] = useState<number | null>(null);

  // Fetch contracts from API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyContracts({
          page: 1,
          limit: 50,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchTerm || undefined,
          sortBy: 'created_at',
          sortOrder: 'DESC'
        });
        
        setContracts(response.contracts);
        setFilteredContracts(response.contracts);
        setError(null);
      } catch (err) {
        setError('Failed to load contracts');
        console.error('Error fetching contracts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [selectedStatus, searchTerm]);

  // Filter contracts
  useEffect(() => {
    let filtered = contracts.filter(contract => {
      const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contract.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contract.freelancer.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    setFilteredContracts(filtered);
  }, [contracts, searchTerm, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'disputed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertTriangle className="w-4 h-4" />;
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'disputed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">My Contracts</h1>
              <p className="text-secondary-600 mt-1 text-sm sm:text-base">
                Manage and track your active and past contracts
              </p>
            </div>
            {user?.role === 'client' && (
              <div className="mt-4 sm:mt-0">
                <Link to="/talent">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <User className="w-5 h-5 mr-2" />
                    Find Freelancers
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search contracts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600">Total Contracts</span>
                    <span className="font-semibold">{contracts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600">Active</span>
                    <span className="font-semibold">{contracts.filter(c => c.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600">Completed</span>
                    <span className="font-semibold">{contracts.filter(c => c.status === 'completed').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-600">Spent</span>
                    <span className="font-semibold">ETB {contracts.reduce((sum, contract) => sum + contract.price, 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contracts List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-secondary-600">{filteredContracts.length} contracts</p>
            </div>

            <div className="space-y-6">
              {filteredContracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                          <Link to={`/contracts/${contract.id}`} className="hover:text-blue-600">
                            {contract.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 mb-3">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(contract.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                              {contract.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>ETB {contract.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>with {contract.freelancer.username}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-secondary-500 mb-1">
                          Progress: {contract.progress}%
                        </div>
                        <div className="w-32 bg-secondary-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              contract.progress === 100 ? 'bg-green-500' : 
                              contract.progress > 75 ? 'bg-blue-500' : 
                              contract.progress > 50 ? 'bg-yellow-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${contract.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <p className="text-secondary-700 mb-4 line-clamp-2">
                      {contract.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 text-sm text-secondary-600">
                        <div className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{contract.gig.title}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Started {new Date(contract.created_at).toLocaleDateString()}</span>
                        </div>
                        {contract.deadline && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Due {new Date(contract.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Link to={`/messages?contract=${contract.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>Message</span>
                          </Button>
                        </Link>
                        <Link to={`/contracts/${contract.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                        </Link>
                        {contract.status === 'active' && (
                          <Link to={`/contracts/${contract.id}/complete`}>
                            <Button size="sm" className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" />
                              <span>Complete</span>
                            </Button>
                          </Link>
                        )}
                        {(contract.status === 'completed' || contract.status === 'approved') && !contract.client_rating && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedContractForReview(contract.id);
                              setShowReviewModal(true);
                            }}
                            className="flex items-center space-x-1"
                          >
                            <span>Review</span>
                          </Button>
                        )}
                        {(contract.status === 'completed' || contract.status === 'approved') && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await apiService.releaseEscrowPayment(contract.id);
                                toast.success('Payment released successfully');
                                // Reload contracts
                                const response = await apiService.getMyContracts({ page: 1, limit: 50 });
                                setContracts(response.contracts);
                                setFilteredContracts(response.contracts);
                              } catch (error: any) {
                                toast.error(error.response?.data?.error || 'Failed to release payment');
                              }
                            }}
                            className="flex items-center space-x-1"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Release Payment</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContracts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">No contracts</h3>
                <p className="text-secondary-600 mb-4">
                  You don't have any contracts yet.
                </p>
                {user?.role === 'client' && (
                  <Link to="/talent">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <User className="w-5 h-5 mr-2" />
                      Find Freelancers
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedContractForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedContractForReview(null);
          }}
          type="contract"
          contractId={selectedContractForReview}
          onSuccess={() => {
            // Reload contracts after review
            const fetchContracts = async () => {
              try {
                const response = await apiService.getMyContracts({
                  page: 1,
                  limit: 50,
                  status: selectedStatus !== 'all' ? selectedStatus : undefined,
                  search: searchTerm || undefined,
                  sortBy: 'created_at',
                  sortOrder: 'DESC'
                });
                setContracts(response.contracts);
                setFilteredContracts(response.contracts);
              } catch (err) {
                console.error('Error fetching contracts:', err);
              }
            };
            fetchContracts();
          }}
        />
      )}
    </div>
  );
};

export default MyContractsPage;