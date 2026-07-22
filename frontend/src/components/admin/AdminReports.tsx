import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { apiService } from '../../services/api';
import type { Report } from '../../types/index';
import { formatDistanceToNow } from 'date-fns';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingReport, setProcessingReport] = useState<number | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReports('pending');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: number, action: 'approve' | 'dismiss', notes?: string) => {
    try {
      setProcessingReport(reportId);
      await apiService.resolveReport(reportId, action, notes);
      loadReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
    } finally {
      setProcessingReport(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Moderation</h1>
        <p className="text-gray-600 text-sm mt-1">Review and manage user reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flag className="w-5 h-5 mr-2" />
            Pending Reports ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600">
                No pending reports to review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Flag className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-gray-900">
                          {report.reason.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          by {report.reporter.username}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {report.description && (
                        <p className="text-gray-700 mb-2">{report.description}</p>
                      )}

                      {report.target_content && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Reported Content:
                          </p>
                          {report.target_content.title && (
                            <p className="text-sm text-gray-700">
                              <strong>Title:</strong> {report.target_content.title}
                            </p>
                          )}
                          {report.target_content.content && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              <strong>Content:</strong> {report.target_content.content}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleResolveReport(report.id, 'dismiss')}
                      loading={processingReport === report.id}
                      variant="outline"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolveReport(report.id, 'approve')}
                      loading={processingReport === report.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
