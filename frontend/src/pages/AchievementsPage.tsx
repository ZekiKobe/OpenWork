import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { 
  Award, Trophy, Star, Target, 
  User, Calendar, TrendingUp, CheckCircle
} from 'lucide-react';
import ProfileSidebar from '../components/common/ProfileSidebar';
import type { UserProfile } from '../types';

const AchievementsPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Mock achievements data - in a real app, this would come from an API
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "First Post",
      description: "Created your first post",
      date: "2023-01-15",
      icon: "📝",
      rarity: "common"
    },
    {
      id: 2,
      title: "Top Contributor",
      description: "Reached 1000 points",
      date: "2023-02-20",
      icon: "⭐",
      rarity: "rare"
    },
    {
      id: 3,
      title: "Helpful Member",
      description: "Received 50 likes on posts",
      date: "2023-03-10",
      icon: "👍",
      rarity: "uncommon"
    },
    {
      id: 4,
      title: "Community Builder",
      description: "Made 50 comments",
      date: "2023-04-05",
      icon: "💬",
      rarity: "common"
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
        <LoadingSpinner size="lg" variant="primary" text="Loading achievements..." />
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

  // Get achievement badge styles based on rarity
  const getRarityClass = (rarity: string) => {
    switch(rarity) {
      case 'rare':
        return 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white';
      case 'epic':
        return 'bg-gradient-to-br from-purple-500 to-pink-600 text-white';
      case 'legendary':
        return 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white';
      case 'uncommon':
        return 'bg-gradient-to-br from-green-500 to-emerald-600 text-white';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
    }
  };

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
                  <Award className="w-6 h-6 mr-3 text-primary-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Achievements</h1>
                    <p className="text-secondary-600 mt-1">
                      {isOwnProfile 
                        ? "Your accomplishments and milestones" 
                        : `View ${profile.username}'s achievements`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No achievements yet</h3>
                    <p className="text-secondary-600">
                      {isOwnProfile 
                        ? "Start engaging with the community to earn achievements!" 
                        : `${profile.username} hasn't earned any achievements yet`}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                      <div 
                        key={achievement.id} 
                        className={`border rounded-lg p-4 bg-gradient-to-br from-white to-secondary-50 hover:shadow-md transition-shadow ${getRarityClass(achievement.rarity)}`}
                      >
                        <div className="flex items-center mb-3">
                          <div className="text-2xl mr-3">{achievement.icon}</div>
                          <div>
                            <h4 className="font-semibold text-lg">{achievement.title}</h4>
                            <p className="text-sm opacity-90">{achievement.description}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center text-sm opacity-80">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(achievement.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-black bg-opacity-20">
                            {achievement.rarity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Stats Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Trophy className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-blue-800">{achievements.length}</p>
                          <p className="text-sm text-blue-600">Total Achievements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Star className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-green-800">1,250</p>
                          <p className="text-sm text-green-600">Points Earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-purple-800">24</p>
                          <p className="text-sm text-purple-600">Completed Tasks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;