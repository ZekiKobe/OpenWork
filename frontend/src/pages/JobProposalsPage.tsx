import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  Mail,
  Eye,
  UserCheck
} from 'lucide-react';

// Types for job application data
interface JobApplication {
  id: number;
  job: {
    id: number;
    title: string;
    description: string;
    budget: number;
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

const JobProposalsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError('Job ID is required');
      setLoading(false);
      return;
    }

    loadJobApplications();
  }, [jobId]);

  const loadJobApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobApplications(parseInt(jobId!, 10));
      setApplications(response.applications);
      setError(null);
    } catch (err) {
      setError('Failed to load job applications');
      console.error('Error loading job applications:', err);
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

  const handleContactFreelancer = (freelancerId: number) => {
    // Navigate to messaging page to contact the freelancer
    navigate(`/messages?recipient=${freelancerId}`);
  };

  const handleHireFreelancer = async (applicationId: number) => {
    if (!jobId) return;
    
    if (!window.confirm('Are you sure you want to hire this freelancer? This will mark the job as in progress.')) {
      return;
    }

    try {
      await apiService.hireFreelancer(parseInt(jobId, 10), applicationId);
      // Reload applications to update status
      loadJobApplications();
      // Show success message
      alert('Freelancer hired successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to hire freelancer');
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
            <Button onClick={() => navigate(-1)}>
              Go Back
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
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Job Proposals</h1>
              <p className="text-secondary-600">View and manage proposals for your job posting</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Proposals Yet</h3>
              <p className="text-secondary-600 mb-6">
                No freelancers have applied to this job yet. Check back later for new proposals!
              </p>
              <Link to="/jobs/my-posted">
                <Button>
                  View My Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-secondary-900">
                Proposals for Job #{jobId}
              </h2>
              <p className="text-secondary-600">{applications.length} proposal{applications.length !== 1 ? 's' : ''} received</p>
            </div>

            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-secondary-900">
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
                    {(application.status === 'pending' || application.status === 'shortlisted') && (
                      <Button 
                        size="sm"
                        onClick={() => handleHireFreelancer(application.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Hire
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleContactFreelancer(application.freelancer.id)}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Link to={`/jobs/${application.job.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Job
                      </Button>
                    </Link>
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

export default JobProposalsPage;