import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      toast.error('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    try {
      setLoading(true);
      await apiService.resetPassword(token, password);
      setStatus('success');
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full" padding="lg">
          <div className="text-center">
            <CheckCircle className="w-10 h-10 text-success-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Password Reset!</h2>
            <p className="text-sm text-secondary-600 mb-4">
              Your password has been successfully reset. Redirecting to login...
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'error' && !token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full" padding="lg">
          <div className="text-center">
            <XCircle className="w-10 h-10 text-danger-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Invalid Link</h2>
            <p className="text-sm text-secondary-600 mb-4">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password">
              <Button variant="outline" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full" padding="lg">
        <div className="text-center mb-6">
          <Lock className="w-10 h-10 text-accent-600 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-1.5">Reset Password</h2>
          <p className="text-sm text-secondary-600">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-secondary-300 rounded bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              placeholder="Enter new password"
              required
              minLength={8}
            />
            <p className="text-xs text-secondary-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-700 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-secondary-300 rounded bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-xs text-accent-600 hover:text-accent-700"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};
