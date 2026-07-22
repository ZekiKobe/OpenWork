import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertTriangle } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

export const TermsPage: React.FC = () => {
  usePageTitle('Terms of Service');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">Terms of Service</h1>
        <p className="text-secondary-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              This is a placeholder template, not legal advice. Have a qualified attorney review
              these terms before using OpenWork in production.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>
            By creating an account or using OpenWork, you agree to these Terms of Service and
            our <Link to="/privacy" className="text-green-600 hover:text-green-700">Privacy Policy</Link>.
            If you do not agree, do not use the platform.
          </p>
          <p>
            OpenWork is a freelance marketplace that connects clients with freelancers for gigs,
            jobs, contracts, messaging, and community features.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>2. Accounts and Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>
            You must provide accurate registration information and keep your credentials secure.
            You are responsible for activity under your account. Users may register as freelancers,
            clients, or other roles supported by the platform.
          </p>
          <p>
            We may suspend or terminate accounts that violate community guidelines, engage in fraud,
            or misuse the marketplace.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>3. Marketplace Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>
            Clients and freelancers are responsible for the terms of their agreements, deliverables,
            and communications. OpenWork may facilitate escrow payments, wallet balances, and
            platform fees where enabled.
          </p>
          <p>
            Disputes between users should first be resolved directly. Platform support may assist
            but does not guarantee outcomes for every dispute.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>4. Acceptable Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Post unlawful, harassing, or misleading content</li>
            <li>Circumvent platform fees or payment protections where applicable</li>
            <li>Attempt unauthorized access to accounts, data, or systems</li>
            <li>Use automated scraping or abuse that degrades service quality</li>
          </ul>
          <p>
            See our <Link to="/rules" className="text-green-600 hover:text-green-700">Community Guidelines</Link> for additional expectations.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>5. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-secondary-700 leading-relaxed">
          <p>
            OpenWork is provided &quot;as is&quot; to the extent permitted by law. We are not liable for
            indirect, incidental, or consequential damages arising from use of the platform,
            third-party services, or user interactions.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>6. Changes</CardTitle>
        </CardHeader>
        <CardContent className="text-secondary-700 leading-relaxed">
          <p>
            We may update these terms from time to time. Continued use after changes are posted
            constitutes acceptance of the revised terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
