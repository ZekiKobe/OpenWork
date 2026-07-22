import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await apiService.requestPasswordReset(email);
      setSubmitted(true);
      toast.success('If the email exists, a password reset link has been sent');
    } catch (error: any) {
      // Always show success message for security (don't reveal if email exists)
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full" padding="lg">
        {!submitted ? (
          <>
            <div className="text-center mb-6">
              <Mail className="w-10 h-10 text-accent-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Forgot Password?</h2>
              <p className="text-sm text-secondary-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-accent-600 hover:text-accent-700"
                >
                  <ArrowLeft className="w-3 h-3 mr-1.5" />
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <Mail className="w-10 h-10 text-success-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Check Your Email</h2>
            <p className="text-sm text-secondary-600 mb-4">
              If an account with that email exists, we've sent a password reset link.
              Please check your inbox and follow the instructions.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="w-full mb-3">
              Try Another Email
            </Button>
            <Link to="/login" className="block text-xs text-accent-600 hover:text-accent-700">
              Back to Login
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
