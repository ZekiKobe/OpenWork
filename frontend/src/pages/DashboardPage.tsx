import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { UserProfile, PointsBalance, Post } from '../types/index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrendingUp, FileText, MessageCircle, Heart, Award, Plus, Eye, Users, Briefcase, DollarSign, CheckCircle, Clock, Wallet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePageTitle } from '../hooks/usePageTitle';

export const DashboardPage: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [myContracts, setMyContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileResponse, pointsResponse, postsResponse] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getPointsBalance(),
        apiService.getPosts(1, 5) // Get recent posts for the user
      ]);

      setProfile(profileResponse);
      setPointsBalance(pointsResponse);
      // Filter posts to show only user's posts
      setRecentPosts(postsResponse.data.filter(post => post.author.id === user!.id).slice(0, 3));

      // Load role-specific data
      if (user?.role === 'client') {
        const [jobsResponse, contractsResponse] = await Promise.all([
          apiService.getMyPostedJobs({ page: 1, limit: 5 }),
          apiService.getMyContracts({ page: 1, limit: 5 })
        ]);
        setMyJobs(jobsResponse.jobs || []);
        setMyContracts(contractsResponse.contracts || []);
      } else if (user?.role === 'freelancer') {
        const contractsResponse = await apiService.getMyContracts({ page: 1, limit: 5 });
        setMyContracts(contractsResponse.contracts || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Please sign in to view your dashboard
            </h2>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mt-8"></div>
      </div>
    );
  }

  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Welcome back, {user.username}!
        </h1>
        <p className="text-secondary-600">
          {isFreelancer 
            ? "Here's your freelancer dashboard with jobs, contracts, and earnings."
            : isClient
            ? "Manage your jobs, contracts, and find talented freelancers."
            : "Here's your activity overview and community contributions."}
        </p>
      </div>

      {/* Stats Overview - Role-based */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Points</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {pointsBalance?.total_points || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isFreelancer ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Active Contracts</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {myContracts.filter(c => c.status === 'active' || c.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      ETB {myContracts
                        .filter(c => c.status === 'completed')
                        .reduce((sum, c) => sum + (c.total_amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Completed Jobs</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {myContracts.filter(c => c.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : isClient ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Posted Jobs</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {myJobs.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Active Contracts</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {myContracts.filter(c => c.status === 'active' || c.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Total Spent</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      ETB {myContracts
                        .filter(c => c.status === 'completed')
                        .reduce((sum, c) => sum + (c.total_amount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <FileText className="w-6 h-6 text-success-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Posts</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {profile?.stats.posts_count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-info-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-info-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Comments</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {profile?.stats.comments_count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-warning-100 rounded-lg">
                    <Heart className="w-6 h-6 text-warning-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">Likes Received</p>
                    <p className="text-2xl font-bold text-secondary-900">
                      {profile?.stats.likes_received || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions - Role-based */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isFreelancer ? (
                  <>
                    <Link to="/jobs">
                      <Button className="w-full" size="lg">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Find Jobs
                      </Button>
                    </Link>
                    <Link to="/marketplace/create-gig">
                      <Button variant="outline" className="w-full" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Gig
                      </Button>
                    </Link>
                    <Link to="/proposals">
                      <Button variant="outline" className="w-full" size="lg">
                        <FileText className="w-5 h-5 mr-2" />
                        My Proposals
                      </Button>
                    </Link>
                    <Link to="/wallet">
                      <Button variant="outline" className="w-full" size="lg">
                        <Wallet className="w-5 h-5 mr-2" />
                        View Wallet
                      </Button>
                    </Link>
                  </>
                ) : isClient ? (
                  <>
                    <Link to="/jobs/create">
                      <Button className="w-full" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Post a Job
                      </Button>
                    </Link>
                    <Link to="/talent">
                      <Button variant="outline" className="w-full" size="lg">
                        <Users className="w-5 h-5 mr-2" />
                        Find Freelancers
                      </Button>
                    </Link>
                    <Link to="/my-posted-jobs">
                      <Button variant="outline" className="w-full" size="lg">
                        <FileText className="w-5 h-5 mr-2" />
                        My Jobs
                      </Button>
                    </Link>
                    <Link to="/browse-gigs">
                      <Button variant="outline" className="w-full" size="lg">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Browse Services
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/create-post">
                      <Button className="w-full" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Post
                      </Button>
                    </Link>
                    <Link to={`/users/${user.username}`}>
                      <Button variant="outline" className="w-full" size="lg">
                        <Eye className="w-5 h-5 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Recent Activity */}
          {isFreelancer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Contracts</span>
                  <Link to="/my-contracts" className="text-sm text-primary-600 hover:text-primary-700">
                    View all
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myContracts.filter(c => c.status === 'active' || c.status === 'in_progress').length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                    <p className="text-secondary-600 mb-4">You don't have any active contracts yet.</p>
                    <Link to="/jobs">
                      <Button>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myContracts
                      .filter(c => c.status === 'active' || c.status === 'in_progress')
                      .slice(0, 3)
                      .map((contract) => (
                        <div key={contract.id} className="border border-secondary-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-secondary-900">{contract.job?.title || 'Contract'}</h3>
                            <span className="text-sm font-medium text-green-600">ETB {contract.total_amount || 0}</span>
                          </div>
                          <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                            {contract.job?.description || 'No description'}
                          </p>
                          <div className="flex items-center justify-between text-sm text-secondary-500">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {contract.status === 'in_progress' ? 'In Progress' : 'Active'}
                            </span>
                            <Link to={`/my-contracts`} className="text-primary-600 hover:text-primary-700">
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isClient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Jobs</span>
                  <Link to="/my-posted-jobs" className="text-sm text-primary-600 hover:text-primary-700">
                    View all
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                    <p className="text-secondary-600 mb-4">You haven't posted any jobs yet.</p>
                    <Link to="/jobs/create">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-secondary-900">{job.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            job.status === 'open' ? 'bg-green-100 text-green-700' :
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-secondary-100 text-secondary-700'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-secondary-500">
                          <span>{job.proposals_count || 0} proposals</span>
                          <Link to={`/jobs/${job.id}`} className="text-primary-600 hover:text-primary-700">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Recent Posts</span>
                <Link to={`/users/${user.username}`} className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                  <p className="text-secondary-600 mb-4">You haven't created any posts yet.</p>
                  <Link to="/create-post">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="border border-secondary-200 rounded-lg p-4">
                      <Link to={`/posts/${post.id}`}>
                        <h3 className="font-semibold text-secondary-900 mb-2 hover:text-primary-600">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-secondary-500">
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {post.stats.likes_count}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.stats.comments_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Points Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Points Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Today</span>
                <span className="font-semibold text-secondary-900">
                  {pointsBalance?.today_points || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">This Week</span>
                <span className="font-semibold text-secondary-900">
                  {pointsBalance?.history.slice(0, 7).reduce((sum, log) => sum + log.points, 0) || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">This Month</span>
                <span className="font-semibold text-secondary-900">
                  {pointsBalance?.history.slice(0, 30).reduce((sum, log) => sum + log.points, 0) || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {pointsBalance?.history && pointsBalance.history.length > 0 ? (
                <div className="space-y-3">
                  {pointsBalance.history.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          log.points > 0 ? 'bg-success-500' : 'bg-danger-500'
                        }`} />
                        <span className="text-sm text-secondary-700">{log.description}</span>
                      </div>
                      <span className={`text-sm font-medium ${
                        log.points > 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {log.points > 0 ? '+' : ''}{log.points}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-600 text-sm">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Community Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600 mb-1">
                  #{Math.floor(Math.random() * 100) + 1}
                </p>
                <p className="text-sm text-secondary-600">Your Rank</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-secondary-900 mb-1">
                  {profile?.stats.likes_received || 0}%
                </p>
                <p className="text-sm text-secondary-600">Engagement Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
