import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bookmark } from 'lucide-react';

export const SavedPostsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Posts</h1>
              <p className="text-gray-600">Posts you've bookmarked for later</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="py-20 text-center">
            <Bookmark className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Feature coming soon</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Saving posts is not available yet. Browse the community feed to discover content in the meantime.
            </p>
            <Link to="/posts">
              <Button>Browse Posts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
