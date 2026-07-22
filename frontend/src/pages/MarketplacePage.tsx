import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { Gig, GigCategory } from '../types/index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  User,
  Plus,
  Tag,
  Briefcase,
  Code,
  Palette,
  FileText,
  TrendingUp,
  BarChart3,
  Users,
  MoreHorizontal
} from 'lucide-react';

const MarketplacePage: React.FC = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 20
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: Briefcase },
    { id: 'web-development', name: 'Web Development', icon: Code },
    { id: 'mobile-development', name: 'Mobile Development', icon: Users },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'writing', name: 'Writing', icon: FileText },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
    { id: 'data-science', name: 'Data Science', icon: BarChart3 },
    { id: 'consulting', name: 'Consulting', icon: User },
    { id: 'other', name: 'Other', icon: MoreHorizontal },
  ];

  useEffect(() => {
    loadGigs();
  }, [selectedCategory, sortBy, sortOrder, pagination.page]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGigs({
        page: pagination.page,
        limit: pagination.limit,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder
      });

      setGigs(response.gigs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadGigs();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatPrice = (price: number, type: 'fixed' | 'hourly') => {
    return type === 'hourly' ? `ETB ${price}/hr` : `ETB ${price}`;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Marketplace</h1>
              <p className="text-secondary-600 mt-2 text-sm sm:text-base">Find the perfect freelancer for your project</p>
            </div>
            {user && user.role === 'freelancer' && (
              <Link to="/marketplace/create-gig">
                <Button className="bg-green-600 hover:bg-green-700 mt-4 md:mt-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Gig
                </Button>
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </div>
          </form>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-green-100 text-green-800'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={`${sortBy}_${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('_');
                      setSortBy(field);
                      setSortOrder(order as 'ASC' | 'DESC');
                    }}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="created_at_DESC">Newest First</option>
                    <option value="created_at_ASC">Oldest First</option>
                    <option value="price_ASC">Price: Low to High</option>
                    <option value="price_DESC">Price: High to Low</option>
                    <option value="rating_DESC">Highest Rated</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-secondary-600">
                {pagination.total} service{pagination.total !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-secondary-200 rounded mb-4"></div>
                      <div className="h-3 bg-secondary-200 rounded mb-2"></div>
                      <div className="h-3 bg-secondary-200 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Gigs Grid */}
                {gigs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No services found</h3>
                    <p className="text-secondary-600">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {gigs.map((gig) => (
                      <Card key={gig.id} className="hover:shadow-lg transition-all duration-300 group">
                        <CardContent className="p-0">
                          {/* Gig Image/Thumbnail */}
                          <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 rounded-t-lg flex items-center justify-center">
                            {gig.images && gig.images.length > 0 ? (
                              <img
                                src={gig.images[0]}
                                alt={gig.title}
                                className="w-full h-full object-cover rounded-t-lg"
                              />
                            ) : (
                              <div className="text-green-600 text-4xl">
                                {gig.category === 'web-development' ? '💻' :
                                 gig.category === 'design' ? '🎨' :
                                 gig.category === 'writing' ? '✍️' :
                                 gig.category === 'marketing' ? '📈' : '🔧'}
                              </div>
                            )}
                          </div>

                          <div className="p-6">
                            {/* Freelancer Info */}
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center overflow-hidden">
                                {gig.freelancer.avatar_url ? (
                                  <img
                                    src={gig.freelancer.avatar_url}
                                    alt={gig.freelancer.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-secondary-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-secondary-900 text-sm">
                                  {gig.freelancer.username}
                                </p>
                                <div className="flex items-center text-xs text-secondary-500">
                                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {gig.rating > 0 ? gig.rating.toFixed(1) : 'New'}
                                </div>
                              </div>
                            </div>

                            {/* Gig Title */}
                            <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                              {gig.title}
                            </h3>

                            {/* Gig Description */}
                            <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                              {gig.description}
                            </p>

                            {/* Tags */}
                            {gig.tags && Array.isArray(gig.tags) && gig.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {gig.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {gig.tags.length > 3 && (
                                  <span className="text-xs text-secondary-500">
                                    +{gig.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Gig Details */}
                            <div className="flex items-center justify-between text-sm text-secondary-600 mb-4">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {gig.delivery_time} day{gig.delivery_time > 1 ? 's' : ''}
                              </div>
                              <div className="flex items-center">
                                <span className="text-secondary-400 mr-1">•</span>
                                {gig.revisions} revision{gig.revisions > 1 ? 's' : ''}
                              </div>
                            </div>

                            {/* Price and Action */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-lg font-bold text-green-600">
                                  {formatPrice(gig.price, gig.pricing_type)}
                                </span>
                              </div>
                              <Link to={`/marketplace/gigs/${gig.id}`}>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <Button
                            key={pageNumber}
                            variant={pagination.page === pageNumber ? "default" : "outline"}
                            onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;