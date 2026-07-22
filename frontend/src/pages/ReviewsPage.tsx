import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { 
  Star, User, Calendar, MessageCircle, 
  ThumbsUp, ThumbsDown, Award, TrendingUp
} from 'lucide-react';
import ProfileSidebar from '../components/common/ProfileSidebar';
import type { UserProfile } from '../types';

const ReviewsPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Mock reviews data - in a real app, this would come from an API
  const [reviews, setReviews] = useState([
    {
      id: 1,
      reviewer: {
        username: 'johndoe',
        avatar_url: '',
      },
      rating: 5,
      comment: 'Excellent work! Delivered on time and exceeded expectations.',
      project: 'Website Redesign',
      date: '2023-05-15',
      helpful: 3
    },
    {
      id: 2,
      reviewer: {
        username: 'janedoe',
        avatar_url: '',
      },
      rating: 4,
      comment: 'Great communication and quality work. Will hire again!',
      project: 'Mobile App Development',
      date: '2023-05-10',
      helpful: 1
    },
    {
      id: 3,
      reviewer: {
        username: 'bobsmith',
        avatar_url: '',
      },
      rating: 5,
      comment: 'Professional service and attention to detail. Highly recommend.',
      project: 'API Integration',
      date: '2023-05-05',
      helpful: 5
    }
  ]);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await apiService.getPublicProfile(username!);
      setProfile(profileResponse);
      setIsOwnProfile(user?.id === profileResponse.id);
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
        <LoadingSpinner size="lg" variant="primary" text="Loading reviews..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">User not found</h2>
          <a href="/" className="text-primary-600 hover:underline">Go back home</a>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
    : '0.0';

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
                  <Star className="w-6 h-6 mr-3 text-primary-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Reviews</h1>
                    <p className="text-secondary-600 mt-1">
                      {isOwnProfile 
                        ? "Feedback from clients and collaborators" 
                        : `Reviews for ${profile.username}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Star className="w-8 h-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-yellow-800">{avgRating}</p>
                          <p className="text-sm text-yellow-600">Average Rating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-blue-800">{reviews.length}</p>
                          <p className="text-sm text-blue-600">Total Reviews</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <ThumbsUp className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-green-800">
                            {reviews.reduce((sum, review) => sum + review.helpful, 0)}
                          </p>
                          <p className="text-sm text-green-600">Helpful Votes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">No reviews yet</h3>
                      <p className="text-secondary-600">
                        {isOwnProfile 
                          ? "Complete projects to receive reviews from clients" 
                          : `${profile.username} hasn't received any reviews yet`}
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border border-secondary-200 rounded-lg p-5 bg-white">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 rounded-full bg-secondary-200 flex items-center justify-center">
                              <User className="w-6 h-6 text-secondary-500" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-secondary-900">{review.reviewer.username}</h4>
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-secondary-300'}`} 
                                    />
                                  ))}
                                  <span className="ml-2 text-sm text-secondary-600">{review.date}</span>
                                </div>
                              </div>
                              
                              <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full">
                                {review.project}
                              </span>
                            </div>
                            
                            <p className="mt-3 text-secondary-700">{review.comment}</p>
                            
                            <div className="flex items-center mt-4 text-sm text-secondary-500">
                              <button className="flex items-center mr-4 hover:text-secondary-700">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                <span>{review.helpful}</span>
                              </button>
                              <button className="flex items-center hover:text-secondary-700">
                                <ThumbsDown className="w-4 h-4 mr-1" />
                              </button>
                              <button className="ml-4 hover:text-secondary-700">Reply</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;