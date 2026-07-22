import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const PrivacyPage: React.FC = () => {
  usePageTitle('Privacy Policy');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">Privacy Policy</h1>
        <p className="text-secondary-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This is a placeholder template, not legal advice. Consult a qualified attorney before
              relying on this policy for a production deployment.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>When you use OpenWork, we may collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account details such as email, username, and role</li>
            <li>Profile, portfolio, gig, job, and contract information you submit</li>
            <li>Messages, posts, reviews, and other user-generated content</li>
            <li>Payment and wallet activity when payments features are enabled</li>
            <li>Technical data such as IP address, browser type, and usage logs</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>2. How We Use Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve marketplace, messaging, and community features</li>
            <li>Authenticate users and secure accounts</li>
            <li>Process payments, escrow, and notifications where applicable</li>
            <li>Enforce community guidelines and prevent abuse</li>
            <li>Send service-related emails such as verification or password reset messages</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>3. Sharing and Third Parties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>
            We do not sell personal information. We may share data with service providers that
            help operate the platform, such as payment processors (for example Stripe), email
            delivery providers, and cloud storage when configured.
          </p>
          <p>
            Public profile and marketplace content you publish may be visible to other users as
            intended by the product.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>4. Data Retention and Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>
            We retain information while your account is active and as needed for legal, security,
            and operational purposes. We use reasonable technical and organizational measures to
            protect data, but no system is completely secure.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>5. Your Choices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>
            You may update profile information in account settings where available. You may request
            account deletion or data access subject to applicable law and operational requirements.
          </p>
          <p>
            For questions about this policy, contact the project maintainers through the support
            channels you provide in production.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>6. Related Policies</CardTitle>
        </CardHeader>
        <CardContent className="text-secondary-700 leading-relaxed">
          <p>
            Please also review our{' '}
            <Link to="/terms" className="text-green-600 hover:text-green-700">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/rules" className="text-green-600 hover:text-green-700">Community Guidelines</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
