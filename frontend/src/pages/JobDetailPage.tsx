import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { JobApplicationModal } from '../components/jobs/JobApplicationModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Briefcase,
  Users,
  Calendar,
  Tag,
  User,
  MessageSquare,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

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
  deadline?: string;
  client: {
    id: number;
    username: string;
    avatar_url?: string;
    total_points: number;
    rating?: number;
  };
  tags: string[];
  total_applications: number;
  requirements: string[];
  preferred_skills: string[];
  estimated_hours?: number;
  subcategory?: string;
}

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await apiService.getJob(Number(jobId));
        setJob(response.job);
        setError(null);
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleApplyClick = () => {
    setShowApplyModal(true);
  };

  const handleApplicationSuccess = async () => {
    try {
      const response = await apiService.getJob(Number(jobId));
      setJob(response.job);
    } catch (err) {
      console.error('Error refreshing job:', err);
    }
  };

  const formatBudget = (job: Job) => {
    if (job.job_type === 'fixed') {
      if (job.fixed_price) {
        return `ETB ${job.fixed_price}`;
      }
    } else {
      if (job.budget_min && job.budget_max) {
        return `ETB ${job.budget_min} - ${job.budget_max}/hr`;
      } else if (job.budget_min) {
        return `ETB ${job.budget_min}/hr`;
      }
    }
    return 'Budget not specified';
  };

  const getDurationLabel = (duration: string) => {
    const labels: Record<string, string> = {
      'short': 'Less than 1 month',
      'medium': '1-3 months',
      'long': '3-6 months'
    };
    return labels[duration] || duration;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
        <LoadingSpinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <p className="text-secondary-700 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <p className="text-secondary-700 mb-4">Job not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-secondary-900 mb-2">{job.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.category.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatBudget(job)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{getDurationLabel(job.duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="text-sm text-secondary-500 mb-1">
                      {job.total_applications} applications
                    </div>
                    <Badge variant="secondary">
                      {job.experience_level}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-secondary-400" />
                    <span className="text-sm text-secondary-600">Posted by {job.client.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-secondary-600">{job.client.rating || 'N/A'}</span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">Job Description</h3>
                  <p className="text-secondary-700 whitespace-pre-line">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Card */}
            {(job.requirements && job.requirements.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                        <span className="text-secondary-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills Card */}
            {(job.preferred_skills && job.preferred_skills.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferred Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.preferred_skills.map((skill, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-secondary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{job.client.username}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-secondary-600">{job.client.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-secondary-600">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>Total Points: {job.client.total_points}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Budget</span>
                    <span className="font-medium">{formatBudget(job)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Job Type</span>
                    <span className="font-medium capitalize">{job.job_type}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Experience Level</span>
                    <span className="font-medium capitalize">{job.experience_level}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Duration</span>
                    <span className="font-medium">{getDurationLabel(job.duration)}</span>
                  </div>
                  
                  {job.estimated_hours && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Est. Hours</span>
                      <span className="font-medium">{job.estimated_hours} hours</span>
                    </div>
                  )}
                  
                  {job.deadline && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Deadline</span>
                      <span className="font-medium">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Posted</span>
                    <span className="font-medium">{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags Card */}
            {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Apply Button */}
            <div className="sticky top-4">
              {user?.role === 'freelancer' ? (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleApplyClick}
                >
                  Apply for this Job
                </Button>
              ) : user ? (
                <Button 
                  variant="outline" 
                  className="w-full cursor-not-allowed opacity-50"
                  disabled
                >
                  Only freelancers can apply
                </Button>
              ) : (
                <Link to="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Login to Apply
                  </Button>
                </Link>
              )}
              
              {user?.role === 'client' && (
                <div className="mt-3 text-center text-sm text-secondary-600">
                  You are logged in as a client. Only freelancers can apply for jobs.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Application — slides in from the right */}
      {job && (
        <JobApplicationModal
          job={job}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobDetailPage;