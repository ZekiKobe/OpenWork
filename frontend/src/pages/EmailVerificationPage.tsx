import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setStatus('verifying');
      await apiService.verifyEmail(token);
      setStatus('success');
      toast.success('Email verified successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      toast.error(error.response?.data?.error || 'Invalid or expired verification link');
    }
  };

  const resendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await apiService.resendVerificationEmail(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send verification email');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full" padding="lg">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-600 border-t-transparent mx-auto mb-3"></div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Verifying Email</h2>
            <p className="text-sm text-secondary-600">Please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-10 h-10 text-success-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Email Verified!</h2>
            <p className="text-sm text-secondary-600 mb-4">
              Your email has been successfully verified. Redirecting...
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-10 h-10 text-danger-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Verification Failed</h2>
            <p className="text-sm text-secondary-600 mb-4">
              The verification link is invalid or has expired.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-secondary-300 rounded bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Enter your email"
                />
              </div>
              <Button onClick={resendVerification} className="w-full">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Resend Verification Email
              </Button>
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Back to Login
              </Button>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="text-center">
            <Mail className="w-10 h-10 text-accent-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Verify Your Email</h2>
            <p className="text-sm text-secondary-600 mb-4">
              Please check your email for the verification link, or request a new one.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-secondary-300 rounded bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Enter your email"
                />
              </div>
              <Button onClick={resendVerification} className="w-full">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                Resend Verification Email
              </Button>
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
