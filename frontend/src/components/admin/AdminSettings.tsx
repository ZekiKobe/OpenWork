import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Settings } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Platform configuration and settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <Settings className="w-16 h-16 mx-auto mb-4" />
            <p>Settings management will be implemented with backend endpoints</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
