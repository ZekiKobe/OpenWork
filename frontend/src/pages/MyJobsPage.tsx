import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Briefcase, FileText } from 'lucide-react';

export const MyJobsPage: React.FC = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your job postings and active work</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isClient && (
            <Link to="/my-posted-jobs">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <Briefcase className="w-10 h-10 text-green-600 mb-4" />
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Posted Jobs</h2>
                  <p className="text-sm text-gray-600">
                    View and manage jobs you've posted as a client
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link to="/my-contracts">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <FileText className="w-10 h-10 text-purple-600 mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">My Contracts</h2>
                <p className="text-sm text-gray-600">
                  Track active contracts and completed work
                </p>
              </CardContent>
            </Card>
          </Link>

          {!isClient && (
            <Link to="/proposals">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">My Proposals</h2>
                  <p className="text-sm text-gray-600">
                    View job applications you've submitted
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
