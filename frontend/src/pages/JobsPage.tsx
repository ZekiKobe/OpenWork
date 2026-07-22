import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { JobApplicationModal } from '../components/jobs/JobApplicationModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
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
  status: string;
  created_at: string;
  client: {
    id: number;
    username: string;
    avatar_url?: string;
    total_points: number;
    rating?: number;
  };
  tags: string[];
  total_applications: number;
  role?: string;
}

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<Job | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' }
  ];

  const experienceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' }
  ];

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiService.getJobs({
          page: 1,
          limit: 50,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          experience_level: selectedExperience !== 'all' ? selectedExperience : undefined,
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
  }, [selectedCategory, selectedExperience, searchTerm]);

  // Filter and sort jobs based on search and sort criteria
  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (Array.isArray(job.tags) && job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
      const matchesExperience = selectedExperience === 'all' || job.experience_level === selectedExperience;

      return matchesSearch && matchesCategory && matchesExperience;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'budget-high':
          const aBudget = a.job_type === 'fixed' ? a.fixed_price || 0 : a.budget_max || 0;
          const bBudget = b.job_type === 'fixed' ? b.fixed_price || 0 : b.budget_max || 0;
          return bBudget - aBudget;
        case 'budget-low':
          const aLowBudget = a.job_type === 'fixed' ? a.fixed_price || 0 : a.budget_min || 0;
          const bLowBudget = b.job_type === 'fixed' ? b.fixed_price || 0 : b.budget_min || 0;
          return aLowBudget - bLowBudget;
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedCategory, selectedExperience, sortBy]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'web-development': 'bg-blue-100 text-blue-800',
      'mobile-development': 'bg-green-100 text-green-800',
      'design': 'bg-purple-100 text-purple-800',
      'writing': 'bg-yellow-100 text-yellow-800',
      'marketing': 'bg-red-100 text-red-800',
      'data-science': 'bg-indigo-100 text-indigo-800',
      'consulting': 'bg-gray-100 text-gray-800',
      'other': 'bg-secondary-100 text-secondary-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const formatBudget = (job: Job) => {
    if (job.job_type === 'fixed') {
      if (job.fixed_price) {
        return `$${job.fixed_price}`;
      }
    } else {
      if (job.budget_min && job.budget_max) {
        return `$${job.budget_min} - $${job.budget_max}/hr`;
      } else if (job.budget_min) {
        return `$${job.budget_min}/hr`;
      }
    }
    return 'Budget not specified';
  };

  const handleApplyClick = (job: Job) => {
    setSelectedJobForApplication(job);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Find Jobs</h1>
              <p className="text-secondary-600 mt-1 text-sm sm:text-base">Discover exciting opportunities and start your next project</p>
            </div>
            {user?.role === 'client' && (
              <Link to="/jobs/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Post a Job
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Experience Level</label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="budget-high">Highest Budget</option>
                    <option value="budget-low">Lowest Budget</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-secondary-600">{filteredJobs.length} jobs found</p>
            </div>

            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                          <Link to={`/jobs/${job.id}`} className="hover:text-blue-600">
                            {job.title}
                          </Link>
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(job.category)}`}>
                              {categories.find(cat => cat.value === job.category)?.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatBudget(job)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.duration} term</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-secondary-500 mb-1">
                          {job.total_applications} applications
                        </div>
                        <Badge variant="secondary">
                          {job.experience_level}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-secondary-700 mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags && Array.isArray(job.tags) ? job.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" size="sm">
                          {tag}
                        </Badge>
                      )) : null}
                      {job.tags && Array.isArray(job.tags) && job.tags.length > 4 && (
                        <Badge variant="outline" size="sm">
                          +{job.tags.length - 4} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-secondary-400" />
                          <span className="text-sm text-secondary-600">{job.client.username}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-secondary-600">{job.client.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-secondary-500">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        {user?.role === 'freelancer' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApplyClick(job)}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">No jobs found</h3>
                <p className="text-secondary-600">
                  Try adjusting your filters or check back later for new opportunities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedJobForApplication && (
        <JobApplicationModal
          job={selectedJobForApplication}
          isOpen={!!selectedJobForApplication}
          onClose={() => setSelectedJobForApplication(null)}
          onSuccess={() => setSelectedJobForApplication(null)}
        />
      )}
    </div>
  );
};

export default JobsPage;