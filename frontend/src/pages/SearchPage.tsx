import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Search,
  User,
  FileText,
  Briefcase,
  Calendar,
  Heart,
  MessageSquare,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Post } from '../types';
import type { UserProfile } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'posts' | 'users' | 'jobs'>('all');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, type: typeof searchType = searchType) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const q = searchQuery.trim().toLowerCase();

      const tasks: Promise<void>[] = [];

      if (type === 'all' || type === 'posts') {
        tasks.push(
          apiService.getPosts(1, 50).then((response) => {
            const filtered = (response.data || []).filter(
              (post) =>
                post.title?.toLowerCase().includes(q) ||
                post.content?.toLowerCase().includes(q) ||
                post.tags?.some((tag) => tag.toLowerCase().includes(q))
            );
            setPosts(filtered);
          })
        );
      } else {
        setPosts([]);
      }

      if (type === 'all' || type === 'users') {
        tasks.push(
          apiService.searchUsers(searchQuery).then((response) => {
            setUsers(response.users || []);
          }).catch(() => setUsers([]))
        );
      } else {
        setUsers([]);
      }

      if (type === 'all' || type === 'jobs') {
        tasks.push(
          apiService.getJobs({ search: searchQuery, limit: 20 }).then((response) => {
            setJobs(response.jobs || []);
          }).catch(() => setJobs([]))
        );
      } else {
        setJobs([]);
      }

      await Promise.all(tasks);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      performSearch(query);
    }
  };

  const handleTypeChange = (type: typeof searchType) => {
    setSearchType(type);
    if (query.trim()) {
      performSearch(query, type);
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

  const totalResults = posts.length + users.length + jobs.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>

          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for posts, users, jobs, and more..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              />
            </div>
            <Button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { value: 'all' as const, label: 'All', icon: Search },
              { value: 'posts' as const, label: 'Posts', icon: FileText },
              { value: 'users' as const, label: 'Users', icon: User },
              { value: 'jobs' as const, label: 'Jobs', icon: Briefcase },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    searchType === type.value
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : !hasSearched ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Start Searching</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter a keyword to search for posts, users, and jobs across the platform
              </p>
            </CardContent>
          </Card>
        ) : totalResults === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find anything matching "{query}". Try different keywords or check your spelling.
              </p>
              <Button onClick={() => { setQuery(''); setHasSearched(false); setSearchParams({}); }}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{totalResults}</span> results for "{query}"
            </p>

            {users.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Users</h2>
                <div className="space-y-3">
                  {users.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="p-4">
                        <Link to={`/users/${u.username}`} className="flex items-center gap-3 hover:text-green-600">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{u.username}</p>
                            {u.title && <p className="text-sm text-gray-600">{u.title}</p>}
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {jobs.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Jobs</h2>
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-4">
                        <Link to={`/jobs/${job.id}`} className="block hover:text-green-600">
                          <p className="font-semibold">{job.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {posts.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Posts</h2>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <Link to={`/users/${post.author.username}`} className="flex items-center space-x-2 hover:opacity-80">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{post.author.username}</p>
                              <div className="flex items-center text-xs text-gray-500 space-x-2">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(post.created_at)}</span>
                              </div>
                            </div>
                          </Link>
                        </div>

                        <Link to={`/posts/${post.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.content.length > 200
                            ? `${post.content.substring(0, 200)}...`
                            : post.content}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.stats?.likes_count || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.stats?.comments_count || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
