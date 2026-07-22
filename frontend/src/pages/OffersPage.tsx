import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  TrendingUp,
  Search,
  Filter,
  Clock,
  DollarSign,
  User,
  BarChart3,
  Eye,
  Edit,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle
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

const OffersPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      // This would be the actual API call once implemented
      // const response = await apiService.getJobApplications();
      // For now, using mock data
      const mockApplications: JobApplication[] = [
        {
          id: 1,
          job: {
            id: 101,
            title: 'React Frontend Developer',
            description: 'Looking for experienced React developer to build modern UI',
            budget: 2500,
            client: {
              id: 201,
              username: 'john_doe',
              avatar_url: 'https://via.placeholder.com/40'
            }
          },
          cover_letter: 'I have 5 years of experience with React and would love to work on this project.',
          proposed_rate: 50,
          proposed_hours: 50,
          estimated_completion: '2023-12-31',
          attachments: ['resume.pdf', 'portfolio.pdf'],
          status: 'accepted',
          notes: 'Client approved proposal',
          created_at: '2023-10-15T10:30:00Z',
          updated_at: '2023-10-20T14:30:00Z'
        },
        {
          id: 2,
          job: {
            id: 102,
            title: 'Node.js Backend Developer',
            description: 'Need backend developer for API development',
            budget: 3000,
            client: {
              id: 202,
              username: 'jane_smith',
              avatar_url: 'https://via.placeholder.com/40'
            }
          },
          cover_letter: 'Expert in Node.js and Express with experience in scalable applications.',
          proposed_rate: 60,
          proposed_hours: 40,
          estimated_completion: '2023-12-15',
          attachments: ['resume.pdf'],
          status: 'accepted',
          notes: 'Contract sent for signature',
          created_at: '2023-10-10T14:20:00Z',
          updated_at: '2023-10-18T09:15:00Z'
        }
      ];
      setApplications(mockApplications);
    } catch (err) {
      setError('Failed to load offers');
      console.error('Error loading offers:', err);
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
        <p className="text-lg text-secondary-600">Please log in to view your offers</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Error Loading Offers</h3>
            <p className="text-secondary-600 mb-6">{error}</p>
            <Link to="/">
              <Button>
                Go Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">My Offers</h1>
        <p className="text-secondary-600">Track and manage your job offers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent>
            <TrendingUp className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Offers Yet</h3>
            <p className="text-secondary-600 mb-6">
              You haven't received any job offers yet. Keep applying to increase your chances!
            </p>
            <Link to="/jobs">
              <Button>
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-secondary-900">
                      <Link 
                        to={`/jobs/${application.job.id}`} 
                        className="hover:text-primary-600 transition-colors"
                      >
                        {application.job.title}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-secondary-500">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {application.job.client.username}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ETB {application.job.budget}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(application.created_at).toLocaleDateString()}
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
                  <p className="text-secondary-600">{application.cover_letter}</p>
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

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message Client
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;