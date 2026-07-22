import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrendingUp, Heart, MessageSquare, Eye, User, Calendar, Tag } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Post } from '../types';

export const TrendingPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadTrendingPosts();
  }, [timeframe]);

  const loadTrendingPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts(1, 50);
      setPosts(response.data || []);
    } catch (error) {
      console.error('Failed to load trending posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trending Posts</h1>
              <p className="text-gray-600">Discover the most popular content in the community</p>
            </div>
          </div>

          {/* Timeframe Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'day' as const, label: 'Today' },
              { value: 'week' as const, label: 'This Week' },
              { value: 'month' as const, label: 'This Month' },
              { value: 'all' as const, label: 'All Time' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeframe === option.value
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No trending posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create engaging content!</p>
              <Link to="/create-post">
                <Button>Create a Post</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Rank Badge */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      {/* Author Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        <Link to={`/users/${post.author.username}`} className="flex items-center space-x-2 hover:opacity-80">
                          {post.author.avatar_url ? (
                            <img
                              src={post.author.avatar_url}
                              alt={post.author.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{post.author.username}</p>
                            <div className="flex items-center text-xs text-gray-500 space-x-2">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(post.created_at)}</span>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Post Title */}
                      <Link to={`/posts/${post.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      {/* Post Excerpt */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.content.length > 200
                          ? `${post.content.substring(0, 200)}...`
                          : post.content}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Heart className={`w-4 h-4 ${post.user_like ? 'fill-red-500 text-red-500' : ''}`} />
                          <span className="font-medium">{post.stats?.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span className="font-medium">{post.stats?.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span className="font-medium">{post.stats?.views_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* View Button */}
                    <div className="flex-shrink-0">
                      <Link to={`/posts/${post.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
