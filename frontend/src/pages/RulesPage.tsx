import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const RulesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Community Guidelines
        </h1>
        <p className="text-lg text-secondary-600">
          Help us maintain a positive, valuable community for everyone
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Do's */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-success-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              What We Encourage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Quality Content</p>
                <p className="text-sm text-secondary-600">Share well-researched, thoughtful contributions</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Respectful Discussion</p>
                <p className="text-sm text-secondary-600">Engage in constructive conversations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Helpful Feedback</p>
                <p className="text-sm text-secondary-600">Provide meaningful comments and suggestions</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Original Content</p>
                <p className="text-sm text-secondary-600">Share your unique insights and experiences</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Don'ts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-danger-700">
              <XCircle className="w-5 h-5 mr-2" />
              What We Don't Allow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <XCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Spam & Self-Promotion</p>
                <p className="text-sm text-secondary-600">No excessive promotion or low-quality posts</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <XCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Hate Speech</p>
                <p className="text-sm text-secondary-600">Discriminatory or harmful content is prohibited</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <XCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Misinformation</p>
                <p className="text-sm text-secondary-600">Don't spread false or misleading information</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <XCircle className="w-4 h-4 text-danger-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Harassment</p>
                <p className="text-sm text-secondary-600">Respect others and their opinions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points System */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-warning-600" />
            Points & Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">How Points Work</h3>
              <ul className="space-y-1 text-sm text-secondary-600">
                <li>• <strong>10 points</strong> for creating a quality post</li>
                <li>• <strong>1 point</strong> for each like received</li>
                <li>• <strong>2 points</strong> for each comment made</li>
                <li>• <strong>5 bonus points</strong> for helpful posts</li>
                <li>• <strong>Daily cap:</strong> 100 points per day</li>
                <li>• <strong>Cooldown:</strong> 5 minutes between posts</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-secondary-900 mb-2">Moderation Actions</h3>
              <ul className="space-y-1 text-sm text-secondary-600">
                <li>• Content may be hidden for violations</li>
                <li>• Points can be revoked for spam/abuse</li>
                <li>• Repeated violations may lead to suspension</li>
                <li>• Report inappropriate content to moderators</li>
                <li>• All moderation actions are logged and transparent</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="mt-6 bg-primary-50 border-primary-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Remember: Quality Over Quantity
            </h3>
            <p className="text-primary-700">
              OpenWork is about building a community of genuine contributors. We focus on rewarding
              meaningful engagement, not artificial metrics or financial incentives. Help us create
              a space where everyone can learn and grow together.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
