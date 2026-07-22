import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Heart } from 'lucide-react';

export const LikedPostsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Liked Posts</h1>
              <p className="text-gray-600">Posts you've liked and enjoyed</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="py-20 text-center">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Feature coming soon</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              A dedicated liked-posts feed is not available yet. Like posts on the feed and check back later.
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
