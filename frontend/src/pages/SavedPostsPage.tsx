import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Bookmark,
  User,
  Calendar,
  Heart,
  MessageSquare,
  Eye,
  Tag,
  X
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Post } from '../types';

export const SavedPostsPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = async () => {
    try {
      setLoading(true);
      // In a real app, you'd have an endpoint for saved posts
      // For now, we'll use a placeholder
      const response = await apiService.getPosts(1, 50);
      setPosts(response.data || []);
    } catch (error) {
      console.error('Failed to load saved posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId: number) => {
    try {
      // In a real app, you'd have an unsave endpoint
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to unsave post:', error);
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
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Posts</h1>
              <p className="text-gray-600">Posts you've bookmarked for later</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Bookmark className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No saved posts yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start saving posts to read them later. Click the bookmark icon on any post to save it.
              </p>
              <Link to="/">
                <Button>Browse Posts</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
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
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
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
                          <span>{post.stats?.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.stats?.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.stats?.views_count || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Unsave Button */}
                    <button
                      onClick={() => handleUnsave(post.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <X className="w-5 h-5" />
                    </button>
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
