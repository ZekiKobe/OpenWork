import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Briefcase, 
  Star, 
  Clock, 
  DollarSign, 
  User,
  MessageCircle
} from 'lucide-react';

const UserGigsPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGigs, setUserGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // First get the user profile by username
      const profileResponse = await apiService.getPublicProfile(username!);
      setUserProfile(profileResponse);
      
      // Then get the user's gigs
      const gigsResponse = await apiService.getGigs({
        freelancer_id: profileResponse.id,
        page: 1,
        limit: 20
      });
      setUserGigs(gigsResponse.gigs);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, type: 'fixed' | 'hourly') => {
    return type === 'hourly' ? `ETB ${price}/hr` : `ETB ${price}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">
                Services by {userProfile.username}
              </h1>
              <p className="text-secondary-600 mt-2 text-sm sm:text-base">
                {userGigs.length} service{userGigs.length !== 1 ? 's' : ''} offered
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Gigs Grid */}
            {userGigs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No services available</h3>
                <p className="text-secondary-600">This freelancer hasn't created any services yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {userGigs.map((gig) => (
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
                            {userProfile.avatar_url ? (
                              <img
                                src={userProfile.avatar_url}
                                alt={userProfile.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-secondary-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900 text-sm">
                              {userProfile.username}
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
                          <Button 
                            className="bg-primary-600 hover:bg-primary-700"
                            onClick={() => {
                              // In a real app, this would open a modal or navigate to gig details
                              alert(`Contact ${userProfile.username} to order this service!`);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGigsPage;