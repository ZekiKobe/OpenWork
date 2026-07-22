import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  FileText,
  User,
  Calendar,
  Heart,
  MessageSquare,
  Eye,
  Tag,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Post } from '../types';

export const AllPostsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'All',
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Data Science',
    'Business',
    'Education'
  ];

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPosts();
  }, [currentPage, sortBy, selectedCategory]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPosts(currentPage, 20);
      setPosts(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (postId: number) => {
    if (!user) return;
    
    try {
      await apiService.toggleLike(postId);
      // Update the post in the list
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            user_like: !post.user_like,
            stats: {
              ...post.stats,
              likes_count: post.user_like 
                ? (post.stats?.likes_count || 1) - 1 
                : (post.stats?.likes_count || 0) + 1
            }
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
                <p className="text-gray-600">Explore all community posts and discussions</p>
              </div>
            </div>

            {user && (
              <Link to="/create-post">
                <Button className="bg-green-600 hover:bg-green-700">
                  Create Post
                </Button>
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? 'all' : category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  (category === 'All' && selectedCategory === 'all') ||
                  (category !== 'All' && selectedCategory === category)
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
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
            <CardContent className="py-20 text-center">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Be the first to share your knowledge and start building our community!
              </p>
              {user && (
                <Link to="/create-post">
                  <Button>Create a Post</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Posts List */}
            <div className="space-y-4 mb-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Author Info */}
                    <div className="flex items-center space-x-3 mb-4">
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
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-green-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Post Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {post.content.length > 250
                        ? `${post.content.substring(0, 250)}...`
                        : post.content}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 4).map((tag, idx) => (
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

                    {/* Stats and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-6 text-sm">
                        <button
                          onClick={() => handleToggleLike(post.id)}
                          disabled={!user}
                          className={`flex items-center space-x-1 transition-colors ${
                            post.user_like
                              ? 'text-red-500 hover:text-red-600'
                              : 'text-gray-500 hover:text-red-500'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Heart className={`w-5 h-5 ${post.user_like ? 'fill-red-500' : ''}`} />
                          <span className="font-medium">{post.stats?.likes_count || 0}</span>
                        </button>
                        <Link
                          to={`/posts/${post.id}#comments`}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="font-medium">{post.stats?.comments_count || 0}</span>
                        </Link>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Eye className="w-5 h-5" />
                          <span className="font-medium">{post.stats?.views_count || 0}</span>
                        </div>
                      </div>

                      <Link to={`/posts/${post.id}`}>
                        <Button variant="outline" size="sm">
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
