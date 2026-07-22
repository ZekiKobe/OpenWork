import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { GigList } from '../components/marketplace/GigList';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import type { Gig } from '../types';
import {
  Search,
  Briefcase,
  Code,
  Palette,
  FileText,
  TrendingUp,
  BarChart3,
  Users,
  Sparkles,
  Star,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const categories = [
  { id: 'all', name: 'All Categories', icon: Briefcase, color: 'bg-green-100 text-green-600' },
  { id: 'web-development', name: 'Web Development', icon: Code, color: 'bg-purple-100 text-purple-600' },
  { id: 'mobile-development', name: 'Mobile Development', icon: Users, color: 'bg-green-100 text-green-600' },
  { id: 'design', name: 'Design', icon: Palette, color: 'bg-pink-100 text-pink-600' },
  { id: 'writing', name: 'Writing', icon: FileText, color: 'bg-orange-100 text-orange-600' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'data-science', name: 'Data Science', icon: BarChart3, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'consulting', name: 'Consulting', icon: Briefcase, color: 'bg-teal-100 text-teal-600' },
  { id: 'other', name: 'Other', icon: Sparkles, color: 'bg-gray-100 text-gray-600' }
];

export const BrowseGigsPage: React.FC = () => {
  usePageTitle('Browse Gigs');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 20
  });

  useEffect(() => {
    if (user?.role !== 'client') {
      navigate('/');
      return;
    }
    loadGigs();
  }, [selectedCategory, sortBy, sortOrder, pagination.page, user]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        status: 'active'
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      if (minPrice) {
        params.minPrice = parseFloat(minPrice);
      }

      if (maxPrice) {
        params.maxPrice = parseFloat(maxPrice);
      }

      if (deliveryTime) {
        params.deliveryTime = parseInt(deliveryTime);
      }

      const response = await apiService.getGigs(params);
      console.log('Gigs response:', response); // Debug log
      const gigsData = response.gigs || [];
      setGigs(gigsData);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }));
      
      if (gigsData.length === 0 && !searchQuery && selectedCategory === 'all') {
        console.warn('No gigs found. Make sure there are active gigs in the database.');
      }
    } catch (error: any) {
      console.error('Error loading gigs:', error);
      if (error.response?.status === 404) {
        console.warn('Gigs endpoint not found. Make sure the backend server is running.');
        setGigs([]);
      } else {
        showToast('Failed to load services', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadGigs();
  };

  const handleContact = (gigId: number, freelancerId: number) => {
    navigate(`/messages?gig_id=${gigId}&user_id=${freelancerId}`);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setDeliveryTime('');
    setSelectedCategory('all');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
    loadGigs();
  };

  const hasActiveFilters = selectedCategory !== 'all' || minPrice || maxPrice || deliveryTime || searchQuery;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center items-center mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                Find the Perfect Freelancer
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-green-100 max-w-2xl mx-auto px-4 mb-6">
              Browse thousands of professional services and connect with talented freelancers
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => navigate('/jobs/create')}
                size="lg"
                className="!bg-white/95 !text-green-600 hover:!bg-white !border-2 !border-white/50 px-8 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Post a Job
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                <input
                  type="text"
                  placeholder="Search for services, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all duration-300 shadow-lg"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="!bg-white/20 backdrop-blur-md !text-white hover:!bg-white/30 !border !border-white/30 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-lg w-full sm:w-auto transition-all duration-300 hover:scale-105"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="mt-6 sm:mt-8 flex justify-center gap-4 sm:gap-8 text-center flex-wrap">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">{pagination.total.toLocaleString()}</div>
              <div className="text-green-100 text-xs sm:text-sm">Services Available</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">24/7</div>
              <div className="text-green-100 text-xs sm:text-sm">Support</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">100%</div>
              <div className="text-green-100 text-xs sm:text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters and Results */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`hidden lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white border border-secondary-200 rounded-lg p-4 lg:p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900 flex items-center text-sm lg:text-base">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs lg:text-sm text-green-600 hover:text-green-700 flex items-center"
                  >
                    <X className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-4 lg:mb-6">
                <label className="block text-xs lg:text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-xs lg:text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-4 lg:mb-6">
                <label className="block text-xs lg:text-sm font-medium text-secondary-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="text-xs lg:text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="text-xs lg:text-sm"
                  />
                </div>
              </div>

              {/* Delivery Time Filter */}
              <div className="mb-4 lg:mb-6">
                <label className="block text-xs lg:text-sm font-medium text-secondary-700 mb-2">
                  Delivery Time (days)
                </label>
                <Input
                  type="number"
                  placeholder="Max days"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="text-xs lg:text-sm"
                />
              </div>

              <Button
                onClick={() => {
                  setPagination(prev => ({ ...prev, page: 1 }));
                  loadGigs();
                }}
                className="w-full !bg-green-600 hover:!bg-green-700 text-xs lg:text-sm py-2.5"
              >
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-secondary-900">
                  {selectedCategory !== 'all' 
                    ? categories.find(c => c.id === selectedCategory)?.name 
                    : 'All Services'}
                </h2>
                <p className="text-sm sm:text-base text-secondary-600 mt-1">
                  {pagination.total.toLocaleString()} {pagination.total === 1 ? 'service' : 'services'} found
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order as 'ASC' | 'DESC');
                  }}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                >
                  <option value="created_at-DESC">Newest First</option>
                  <option value="created_at-ASC">Oldest First</option>
                  <option value="price-ASC">Price: Low to High</option>
                  <option value="price-DESC">Price: High to Low</option>
                  <option value="rating-DESC">Highest Rated</option>
                  <option value="total_orders-DESC">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-sm font-semibold text-gray-700 hover:text-green-700"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                    {[selectedCategory !== 'all', minPrice, maxPrice, deliveryTime, searchQuery].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base text-gray-900">Filters</h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-5">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Delivery Time (days)</label>
                    <Input
                      type="number"
                      placeholder="Max days"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => {
                        setPagination(prev => ({ ...prev, page: 1 }));
                        loadGigs();
                        setShowFilters(false);
                      }}
                      className="flex-1 !bg-green-600 hover:!bg-green-700 text-sm font-semibold py-2.5"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1 text-sm font-semibold py-2.5 border-2"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Gig List */}
            <GigList
              gigs={gigs}
              loading={loading}
              onContact={handleContact}
              emptyMessage="No services found. Try adjusting your search or filters."
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-secondary-600 px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button - Post a Job */}
      <button
        onClick={() => navigate('/jobs/create')}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-50 group"
        title="Post a Job"
      >
        <Briefcase className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Post a Job
        </span>
      </button>
    </div>
  );
};
