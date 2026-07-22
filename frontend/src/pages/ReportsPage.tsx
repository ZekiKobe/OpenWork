import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Flag } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin' || user?.role === 'moderator') {
    return <Navigate to="/admin/reports" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="py-16 text-center">
            <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600 mb-6">
              Personal analytics and reporting are not available yet. You can report individual posts or comments from their detail pages.
            </p>
            <Link to="/dashboard/earnings">
              <Button variant="outline">View Earnings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
