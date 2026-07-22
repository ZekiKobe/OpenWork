import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  FileText,
  User,
  DollarSign,
  Clock,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Briefcase
} from 'lucide-react';

// Types for job application data
interface JobApplication {
  id: number;
  job_id: number;
  job: {
    id: number;
    title: string;
    description: string;
    client: {
      id: number;
      username: string;
      avatar_url?: string;
    };
  };
  freelancer: {
    id: number;
    username: string;
    avatar_url?: string;
    rating?: number;
  };
  cover_letter: string;
  proposed_rate?: number;
  proposed_hours?: number;
  estimated_completion?: string;
  attachments?: string[] | null;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface JobWithApplications {
  job: {
    id: number;
    title: string;
    description: string;
    total_applications: number;
  };
  applications: JobApplication[];
}

const ClientProposalsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobsWithApplications, setJobsWithApplications] = useState<JobWithApplications[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobsWithApplications();
  }, []);

  const loadJobsWithApplications = async () => {
    try {
      setLoading(true);
      
      // First, get the client's posted jobs
      const jobsResponse = await apiService.getMyPostedJobs({
        page: 1,
        limit: 50
      });

      // For each job, get its applications
      const jobsWithAppsPromises = jobsResponse.jobs.map(async (job) => {
        try {
          const applicationsResponse = await apiService.getJobApplications(job.id);
          return {
            job: {
              id: job.id,
              title: job.title,
              description: job.description,
              total_applications: job.total_applications
            },
            applications: applicationsResponse.applications
          };
        } catch (err) {
          console.error(`Error loading applications for job ${job.id}:`, err);
          return {
            job: {
              id: job.id,
              title: job.title,
              description: job.description,
              total_applications: job.total_applications
            },
            applications: []
          };
        }
      });

      const jobsWithApps = await Promise.all(jobsWithAppsPromises);
      const jobsWithAppsFiltered = jobsWithApps.filter(job => job.applications.length > 0);
      
      setJobsWithApplications(jobsWithAppsFiltered);
      setError(null);
    } catch (err) {
      setError('Failed to load job applications');
      console.error('Error loading jobs with applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'shortlisted':
        return 'warning';
      case 'withdrawn':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'shortlisted':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-secondary-600">Please log in to view job proposals</p>
      </div>
    );
  }

  if (user.role !== 'client' && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <XCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">Access Denied</h3>
          <p className="text-secondary-600 mb-6">Only clients and administrators can view job proposals.</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Error Loading Proposals</h3>
            <p className="text-secondary-600 mb-6">{error}</p>
            <Button onClick={loadJobsWithApplications}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Job Proposals</h1>
            <p className="text-secondary-600">View and manage proposals for your posted jobs</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : jobsWithApplications.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Proposals Yet</h3>
              <p className="text-secondary-600 mb-6">
                You haven't received any proposals yet. Make sure your jobs are posted and visible!
              </p>
              <Link to="/my-posted-jobs">
                <Button>
                  View My Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {jobsWithApplications.map((jobWithApps) => (
              <div key={jobWithApps.job.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-secondary-900">
                    <Link 
                      to={`/jobs/${jobWithApps.job.id}`} 
                      className="hover:text-primary-600 transition-colors"
                    >
                      {jobWithApps.job.title}
                    </Link>
                  </h2>
                  <Badge variant="secondary">
                    {jobWithApps.applications.length} proposal{jobWithApps.applications.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {jobWithApps.applications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg text-secondary-900">
                              Proposal from {application.freelancer.username}
                            </CardTitle>
                            <div className="flex items-center mt-1 space-x-4 text-sm text-secondary-500">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {application.freelancer.username}
                              </span>
                              {application.freelancer.rating && (
                                <span className="flex items-center">
                                  <span className="w-4 h-4 mr-1 text-yellow-400">★</span>
                                  {application.freelancer.rating}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Applied {new Date(application.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(application.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status}</span>
                            </span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <h4 className="font-medium text-secondary-700 mb-2">Cover Letter</h4>
                          <p className="text-secondary-600 whitespace-pre-line">{application.cover_letter}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {application.proposed_rate && (
                            <div className="flex items-center text-sm">
                              <DollarSign className="w-4 h-4 mr-2 text-secondary-500" />
                              <span className="text-secondary-600">Rate: ETB {application.proposed_rate}/hr</span>
                            </div>
                          )}
                          {application.proposed_hours && (
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-2 text-secondary-500" />
                              <span className="text-secondary-600">Hours: {application.proposed_hours}</span>
                            </div>
                          )}
                          {application.estimated_completion && (
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-secondary-500" />
                              <span className="text-secondary-600">
                                Completion: {new Date(application.estimated_completion).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {application.attachments && Array.isArray(application.attachments) && application.attachments.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-medium text-secondary-700 mb-2">Attachments</h4>
                            <div className="flex flex-wrap gap-2">
                              {application.attachments.map((attachment, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {attachment}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {application.notes && (
                          <div className="mb-4">
                            <h4 className="font-medium text-secondary-700 mb-2">Notes</h4>
                            <p className="text-secondary-600">{application.notes}</p>
                          </div>
                        )}

                        <div className="flex justify-end space-x-3">
                          <Link to={`/messages?recipient=${application.freelancer.id}`}>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                          </Link>
                          <Link to={`/jobs/${application.job_id}/proposals`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View All for Job
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProposalsPage;