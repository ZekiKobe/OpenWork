import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Settings, Server, Shield, Mail, Globe } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const env = import.meta.env.MODE || 'development';

  const configItems = [
    { label: 'Environment', value: env, icon: Server },
    { label: 'API URL', value: apiUrl, icon: Globe },
    { label: 'Auth', value: 'JWT + refresh tokens', icon: Shield },
    { label: 'Email verification', value: 'Enabled (check backend SMTP config)', icon: Mail },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Read-only platform configuration reference</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Runtime Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-600 font-mono break-all">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-6">
            Admin settings are managed via backend environment variables. Update .env on the server for SMTP, payment keys, and OAuth credentials.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
