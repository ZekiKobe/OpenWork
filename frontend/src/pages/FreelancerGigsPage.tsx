import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  DollarSign, 
  User,
  Edit,
  Trash2
} from 'lucide-react';

const FreelancerGigsPage: React.FC = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
    try {
      setLoading(true);
      if (user) {
        // Load gigs for the current user (freelancer)
        const response = await apiService.getGigs({
          freelancer_id: user.id,
          page: 1,
          limit: 20
        });
        setGigs(response.gigs);
      }
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGig = async (gigId: number) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await apiService.deleteGig(gigId);
        // Refresh the gigs list
        loadGigs();
      } catch (error) {
        console.error('Failed to delete gig:', error);
      }
    }
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
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">My Gigs</h1>
              <p className="text-secondary-600 mt-2 text-sm sm:text-base">Manage your freelance gigs</p>
            </div>
            <Link to="/marketplace/create-gig">
              <Button className="bg-green-600 hover:bg-green-700 mt-4 md:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Create Gig
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-secondary-600">
                {gigs.length} gig{gigs.length !== 1 ? 's' : ''} active
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
                      <Briefcase className="w-8 h-8 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No gigs yet</h3>
                    <p className="text-secondary-600 mb-4">Create your first service to start offering your skills</p>
                    <Link to="/marketplace/create-gig">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Gig
                      </Button>
                    </Link>
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
                                {user?.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-secondary-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-secondary-900 text-sm">
                                  {user?.username}
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
                              <div className="flex space-x-2">
                                <Link to={`/marketplace/gigs/${gig.id}/edit`}>
                                  <Button size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteGig(gig.id)}
                                  className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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

export default FreelancerGigsPage;