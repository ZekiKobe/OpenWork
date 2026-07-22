import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { 
  FileText, User, Calendar, MessageCircle, 
  Heart, Tag, Clock, Eye, TrendingUp
} from 'lucide-react';
import ProfileSidebar from '../components/common/ProfileSidebar';
import type { UserProfile, Post } from '../types';

const PostsPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

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

      // Load user's posts
      const postsResponse = await apiService.getPosts(1, 10);
      const userPosts = postsResponse?.data?.filter(post => post?.author?.id === profileResponse.id) || [];
      setPosts(userPosts);
    } catch (error) {
      console.error('Failed to load profile or posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const { scrollTo } = useSmoothScroll();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="primary" text="Loading posts..." />
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
                  <FileText className="w-6 h-6 mr-3 text-primary-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Posts</h1>
                    <p className="text-secondary-600 mt-1">
                      {isOwnProfile 
                        ? "Your published content" 
                        : `Posts by ${profile.username}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-blue-800">{posts.length}</p>
                          <p className="text-sm text-blue-600">Total Posts</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Heart className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-green-800">
                            {posts.reduce((sum, post) => sum + (post.stats?.likes_count || 0), 0)}
                          </p>
                          <p className="text-sm text-green-600">Total Likes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <MessageCircle className="w-8 h-8 text-purple-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-purple-800">
                            {posts.reduce((sum, post) => sum + (post.stats?.comments_count || 0), 0)}
                          </p>
                          <p className="text-sm text-purple-600">Total Comments</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Tag className="w-8 h-8 text-indigo-600 mr-3" />
                        <div>
                          <p className="text-2xl font-bold text-indigo-800">
                            {[...new Set(posts.flatMap(post => post.tags || []))].length}
                          </p>
                          <p className="text-sm text-indigo-600">Total Tags</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Posts List */}
                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">No posts yet</h3>
                      <p className="text-secondary-600">
                        {isOwnProfile 
                          ? "Create your first post to share your knowledge and insights" 
                          : `${profile.username} hasn't published any posts yet`}
                      </p>
                      {isOwnProfile && (
                        <div className="mt-4">
                          <a href="/create-post" className="text-primary-600 hover:underline">Create your first post</a>
                        </div>
                      )}
                    </div>
                  ) : (
                    posts.map((post) => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-secondary-900">{post.title}</h3>
                              <div className="flex items-center mt-2 text-sm text-secondary-600">
                                <User className="w-4 h-4 mr-1" />
                                <span className="mr-4">{post.author?.username}</span>
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-sm text-secondary-600">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {post.estimated_read_time || '5'} min read
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <p className="text-secondary-700 mb-4 line-clamp-3">
                            {post.content.substring(0, 200)}...
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags && post.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between border-t border-secondary-100 pt-4">
                            <div className="flex space-x-4">
                              <div className="flex items-center text-secondary-600">
                                <Heart className="w-4 h-4 mr-1" />
                                <span>{post.stats?.likes_count || 0}</span>
                              </div>
                              <div className="flex items-center text-secondary-600">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                <span>{post.stats?.comments_count || 0}</span>
                              </div>
                              <div className="flex items-center text-secondary-600">
                                <Eye className="w-4 h-4 mr-1" />
                                <span>120</span>
                              </div>
                            </div>
                            
                            <a 
                              href={`/posts/${post.id}`} 
                              className="text-primary-600 hover:underline font-medium"
                            >
                              Read more
                            </a>
                          </div>
                        </CardContent>
                      </Card>
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

export default PostsPage;