import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GraduationCap } from 'lucide-react';

export const MentorsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find a Mentor</h1>
              <p className="text-gray-600">Connect with experienced professionals to guide your career</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="py-20 text-center">
            <GraduationCap className="w-20 h-20 text-purple-200 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Mentor matching is not available yet. Browse freelancer profiles and community posts in the meantime.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/browse-gigs">
                <Button variant="outline">Browse Talent</Button>
              </Link>
              <Link to="/posts">
                <Button>Browse Posts</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
