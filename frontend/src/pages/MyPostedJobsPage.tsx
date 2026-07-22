import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Users, 
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Plus
} from 'lucide-react';

// Types for job data
interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  job_type: 'fixed' | 'hourly';
  budget_min?: number;
  budget_max?: number;
  fixed_price?: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  duration: 'short' | 'medium' | 'long';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  deadline?: string;
  total_applications: number;
  tags: string[];
}

const MyPostedJobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMyPostedJobs({
          page: 1,
          limit: 50,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sortBy: 'created_at',
          sortOrder: 'DESC'
        });
        
        setJobs(response.jobs);
        setFilteredJobs(response.jobs);
        setError(null);
      } catch (err) {
        setError('Failed to load jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedStatus, selectedCategory, searchTerm]);

  // Filter jobs
  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedStatus, selectedCategory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (job: Job) => {
    if (job.job_type === 'fixed') {
      if (job.fixed_price) {
        return `ETB ${job.fixed_price}`;
      }
    } else {
      if (job.budget_min && job.budget_max) {
        return `ETB ${job.budget_min} - ETB ${job.budget_max}/hr`;
      } else if (job.budget_min) {
        return `ETB ${job.budget_min}/hr`;
      }
    }
    return 'Budget not set';
  };

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Posted Jobs</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Manage and track your job postings
              </p>
            </div>
            {user?.role === 'client' && (
              <Link to="/jobs/create" className="w-full sm:w-auto">
                <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  Post New Job
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
              <option value="data-science">Data Science</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Stats Cards - Mobile Horizontal Scroll */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex gap-3 min-w-max sm:min-w-0 sm:grid sm:grid-cols-3">
            <Card className="flex-shrink-0 w-[140px] sm:w-auto bg-white border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{jobs.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Jobs</div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 w-[140px] sm:w-auto bg-white border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{jobs.filter(j => j.status === 'open').length}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Open Jobs</div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-shrink-0 w-[140px] sm:w-auto bg-white border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{jobs.reduce((sum, job) => sum + job.total_applications, 0)}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Applications</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">{filteredJobs.length} jobs found</p>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-4 sm:p-6">
                {/* Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors truncate sm:whitespace-normal">
                        {job.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className={`${getStatusColor(job.status)} text-xs`}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{job.total_applications} applications</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-base sm:text-lg font-bold text-green-600">
                      {formatBudget(job)}
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <p className="text-sm sm:text-base text-gray-700 mb-3 line-clamp-2">
                  {job.description}
                </p>

                {/* Job Meta */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{getCategoryLabel(job.category)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{job.duration} term</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {job.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Link to={`/jobs/${job.id}`} className="flex-1 sm:flex-initial">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </Link>
                  <Link to={`/jobs/${job.id}/proposals`} className="flex-1 sm:flex-initial">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Proposals</span> ({job.total_applications})
                    </Button>
                  </Link>
                  <Link to={`/jobs/${job.id}/edit`} className="sm:flex-initial">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-16 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">
                {jobs.length === 0 
                  ? "You haven't posted any jobs yet."
                  : "No jobs match your current filters."}
              </p>
              {user?.role === 'client' && jobs.length === 0 && (
                <Link to="/jobs/create">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyPostedJobsPage;
