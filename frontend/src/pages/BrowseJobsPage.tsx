import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { JobList } from '../components/jobs/JobList';
import { JobApplicationModal } from '../components/jobs/JobApplicationModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import {
  Search,
  Filter,
  X,
  Sparkles,
  Clock
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  job_type: 'fixed' | 'hourly';
  budget_min?: number;
  budget_max?: number;
  fixed_price?: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  duration: 'short' | 'medium' | 'long';
  status: string;
  deadline?: string;
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
}

// Helper function to calculate job match score based on user profile
const calculateMatchScore = (job: Job, userSkills: string[] = [], userExpertise: string[] = []): number => {
  let score = 0;
  
  // Match based on skills in tags
  if (job.tags && userSkills.length > 0) {
    const matchingSkills = job.tags.filter(tag => 
      userSkills.some(skill => 
        skill.toLowerCase().includes(tag.toLowerCase()) || 
        tag.toLowerCase().includes(skill.toLowerCase())
      )
    );
    score += matchingSkills.length * 10;
  }
  
  // Match based on expertise areas and category
  if (userExpertise.length > 0) {
    const categoryMatch = userExpertise.some(area => 
      area.toLowerCase().includes(job.category.toLowerCase()) ||
      job.category.toLowerCase().includes(area.toLowerCase())
    );
    if (categoryMatch) score += 20;
  }
  
  // Match based on title keywords
  if (userSkills.length > 0) {
    const titleMatch = userSkills.some(skill => 
      job.title.toLowerCase().includes(skill.toLowerCase())
    );
    if (titleMatch) score += 15;
  }
  
  return score;
};

export const BrowseJobsPage: React.FC = () => {
  usePageTitle('Browse Jobs');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [bestMatches, setBestMatches] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'best-matches' | 'recent'>('best-matches');
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<Job | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20
  });

  useEffect(() => {
    if (user?.role !== 'freelancer') {
      navigate('/');
      return;
    }
    loadJobs();
  }, [selectedExperience, selectedJobType, pagination.currentPage, user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.currentPage,
        limit: 50, // Load more to filter and match
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };

      if (selectedExperience !== 'all') {
        params.experience_level = selectedExperience;
      }

      if (selectedJobType !== 'all') {
        params.job_type = selectedJobType;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiService.getJobs(params);
      const jobs = response.jobs || [];
      setAllJobs(jobs);
      
      // Filter jobs based on search
      let filteredJobs = jobs;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredJobs = jobs.filter(job => 
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Get user skills and expertise
      const userSkills = user?.skills || [];
      const userExpertise = user?.expertise_areas || [];

      // Calculate match scores and sort
      const jobsWithScores = filteredJobs.map(job => ({
        job,
        matchScore: calculateMatchScore(job, userSkills, userExpertise)
      }));

      // Sort by match score (best matches first)
      jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      // Get best matches (top jobs with highest scores, only those with match score > 0)
      const bestMatchesList = jobsWithScores
        .filter(item => item.matchScore > 0)
        .slice(0, 20)
        .map(item => item.job);

      // Get recent jobs - also filtered by user profile (jobs with any match score)
      // Sort by date first, then filter by profile relevance
      const recentJobsWithScores = filteredJobs
        .map(job => ({
          job,
          matchScore: calculateMatchScore(job, userSkills, userExpertise),
          createdDate: new Date(job.created_at).getTime()
        }))
        .filter(item => item.matchScore > 0) // Only show profile-related jobs
        .sort((a, b) => b.createdDate - a.createdDate) // Sort by most recent first
        .slice(0, 20)
        .map(item => item.job);

      setBestMatches(bestMatchesList);
      setRecentJobs(recentJobsWithScores);
      
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 0,
        totalItems: response.pagination?.totalItems || 0
      }));
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn('Jobs endpoint not found. Make sure the backend server is running.');
        setAllJobs([]);
        setBestMatches([]);
        setRecentJobs([]);
      } else {
        console.error('Error loading jobs:', error);
        showToast('Failed to load jobs', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadJobs();
  };

  const handleApply = (job: Job) => {
    setSelectedJobForApplication(job);
  };

  const handleApplicationSuccess = () => {
    loadJobs(); // Reload to update application counts
  };

  const clearFilters = () => {
    setSelectedExperience('all');
    setSelectedJobType('all');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadJobs();
  };

  const hasActiveFilters = selectedExperience !== 'all' || selectedJobType !== 'all' || searchQuery;

  const experienceLevels = [
    { id: 'all', name: 'All Levels' },
    { id: 'entry', name: 'Entry Level' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'expert', name: 'Expert' }
  ];

  const jobTypes = [
    { id: 'all', name: 'All Types' },
    { id: 'fixed', name: 'Fixed Price' },
    { id: 'hourly', name: 'Hourly' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Find Your Next Project
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-green-100 max-w-2xl mx-auto px-4">
              Browse thousands of job postings and find projects that match your skills
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for jobs, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 py-3 sm:py-4 text-sm sm:text-lg border-0 shadow-lg"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="!bg-white !text-green-600 hover:!bg-green-50 px-6 sm:px-8 text-sm sm:text-lg font-semibold shadow-lg w-full sm:w-auto"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="mt-6 sm:mt-8 flex justify-center gap-4 sm:gap-8 text-center flex-wrap">
            <div>
              <div className="text-2xl sm:text-3xl font-bold">{pagination.totalItems.toLocaleString()}</div>
              <div className="text-green-100 text-xs sm:text-sm">Jobs Available</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">24/7</div>
              <div className="text-green-100 text-xs sm:text-sm">New Postings</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">100%</div>
              <div className="text-green-100 text-xs sm:text-sm">Secure</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Filters and Results */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Sidebar Filters */}
          <div className={`hidden lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white border border-secondary-200 rounded-lg p-4 lg:p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-900 flex items-center text-sm lg:text-base">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs lg:text-sm text-green-600 hover:text-green-700 flex items-center"
                  >
                    <X className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>

              {/* Experience Level Filter */}
              <div className="mb-4 lg:mb-6">
                <label className="block text-xs lg:text-sm font-medium text-secondary-700 mb-2">
                  Experience Level
                </label>
                <div className="space-y-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => {
                        setSelectedExperience(level.id);
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs lg:text-sm transition-colors ${
                        selectedExperience === level.id
                          ? 'bg-green-50 text-green-700 border-2 border-green-600'
                          : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 border-2 border-transparent'
                      }`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Type Filter */}
              <div className="mb-4 lg:mb-6">
                <label className="block text-xs lg:text-sm font-medium text-secondary-700 mb-2">
                  Job Type
                </label>
                <div className="space-y-2">
                  {jobTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedJobType(type.id);
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs lg:text-sm transition-colors ${
                        selectedJobType === type.id
                          ? 'bg-green-50 text-green-700 border-2 border-green-600'
                          : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100 border-2 border-transparent'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-sm font-semibold text-gray-700 hover:text-green-700"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                    {[selectedExperience !== 'all', selectedJobType !== 'all', searchQuery].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base text-gray-900">Filters</h3>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Experience Level</label>
                    <select
                      value={selectedExperience}
                      onChange={(e) => {
                        setSelectedExperience(e.target.value);
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      {experienceLevels.map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2.5">Job Type</label>
                    <select
                      value={selectedJobType}
                      onChange={(e) => {
                        setSelectedJobType(e.target.value);
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                      }}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      {jobTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => {
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                        loadJobs();
                        setShowFilters(false);
                      }}
                      className="flex-1 !bg-green-600 hover:!bg-green-700 text-sm font-semibold py-2.5"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1 text-sm font-semibold py-2.5 border-2"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b-2 border-gray-200">
                <nav className="flex space-x-1 sm:space-x-4" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('best-matches')}
                    className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-semibold text-sm sm:text-base transition-colors ${
                      activeTab === 'best-matches'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'best-matches' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <span>Best Matches</span>
                    {bestMatches.length > 0 && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'best-matches' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {bestMatches.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`flex items-center gap-2 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-semibold text-sm sm:text-base transition-colors ${
                      activeTab === 'recent'
                        ? 'border-green-600 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === 'recent' ? 'text-green-600' : 'text-gray-400'}`} />
                    <span>Recent</span>
                    {recentJobs.length > 0 && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'recent' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {recentJobs.length}
                      </span>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'best-matches' && (
              <div>
                {bestMatches.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm sm:text-base text-gray-600">
                        Jobs that best match your skills and expertise
                      </p>
                    </div>
                    <JobList
                      jobs={bestMatches}
                      loading={false}
                      onApply={handleApply}
                      emptyMessage=""
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium mb-2">No matches found</p>
                    <p className="text-gray-500 text-sm">
                      {loading ? "Loading jobs..." : "Try updating your profile skills to see better matches."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recent' && (
              <div>
                {recentJobs.length > 0 ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm sm:text-base text-gray-600">
                        Latest job postings that match your profile
                      </p>
                    </div>
                    <JobList
                      jobs={recentJobs}
                      loading={loading}
                      onApply={handleApply}
                      emptyMessage=""
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium mb-2">No recent jobs found</p>
                    <p className="text-gray-500 text-sm">
                      {loading ? "Loading jobs..." : "No recent job postings match your profile. Try adjusting your filters."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {selectedJobForApplication && (
        <JobApplicationModal
          job={selectedJobForApplication}
          isOpen={!!selectedJobForApplication}
          onClose={() => setSelectedJobForApplication(null)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};
