import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { BarChart3 } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 text-sm mt-1">Platform analytics and insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="w-16 h-16 mx-auto mb-4" />
            <p>Analytics dashboard will be implemented with charts and backend endpoints</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
