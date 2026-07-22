import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { useToast } from '../contexts/ToastContext';
import { User, Lock, ArrowLeft, Home } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().min(1, 'Username or Email is required'),
});

const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    setEmail(data.email);
    setStep('password');
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      await login(email, data.password);
      showToast('Login successful!', 'success');
      setJustLoggedIn(true);
      // Navigation will be handled by ProtectedRoute or useEffect
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation after login
  useEffect(() => {
    if (justLoggedIn) {
      // Use a small timeout to ensure state is updated
      const timer = setTimeout(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const loggedInUser = JSON.parse(userStr);
          // Redirect admins/moderators to admin panel
          if (loggedInUser.role === 'admin' || loggedInUser.role === 'moderator') {
            navigate('/admin/dashboard', { replace: true });
          } else if (loggedInUser.role === 'freelancer') {
            navigate('/browse-jobs', { replace: true });
          } else if (loggedInUser.role === 'client') {
            navigate('/browse-gigs', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else if (user) {
          // Fallback to user from context if localStorage is not available
          // Redirect admins/moderators to admin panel
          if (user.role === 'admin' || user.role === 'moderator') {
            navigate('/admin/dashboard', { replace: true });
          } else if (user.role === 'freelancer') {
            navigate('/browse-jobs', { replace: true });
          } else if (user.role === 'client') {
            navigate('/browse-gigs', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
        setJustLoggedIn(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [justLoggedIn, user, navigate]);

  const handleBack = () => {
    setStep('email');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col">
      {/* Simple Header */}
      <div className="w-full py-6 px-4 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-secondary-900 lowercase hover:text-green-600 transition-colors">
            GrowTogether
          </Link>
          <Link
            to="/"
            className="flex items-center space-x-1 text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-12">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-secondary-200 p-8">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-secondary-900 mb-6">Log in to GrowTogether</h1>

        {step === 'email' ? (
          <>
            {/* Email Step Form */}
            <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-4">
              {/* Username or Email Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <User className="w-5 h-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  placeholder="Username or Email"
                  className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    emailErrors.email ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300'
                  }`}
                  {...registerEmail('email')}
                />
                {emailErrors.email && (
                  <p className="mt-1 text-sm text-danger-600">{emailErrors.email.message}</p>
                )}
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="!bg-green-600 hover:!bg-green-700 !text-white !text-base !py-3"
              >
                Continue
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-secondary-500">or</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <GoogleLoginButton
                onSuccess={() => {
                  setJustLoggedIn(true);
                  // Navigation will be handled by useEffect
                }}
                onError={(error) => showToast('Google login failed. Please try again.', 'error')}
              />
              
              {/* Apple Login Button (Placeholder) */}
              <button
                type="button"
                className="w-full bg-white border-2 border-secondary-200 hover:bg-secondary-50 text-secondary-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center space-x-3 text-base"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Sign Up Section */}
            <div className="mt-8 pt-6 border-t border-secondary-200">
              <p className="text-sm text-secondary-600 text-center mb-4">
                Don't have a GrowTogether account?
              </p>
              <Link to="/register" className="block w-full">
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  className="!border-green-600 !text-green-600 hover:!bg-green-50 !text-base !py-3"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Password Step Form */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center text-sm text-secondary-600 hover:text-secondary-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <p className="text-sm text-secondary-600 mb-2">
                Enter password for <span className="font-medium text-secondary-900">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
              {/* Password Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-5 h-5 text-secondary-400" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className={`w-full pl-10 pr-4 py-3 text-base border rounded-lg bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    passwordErrors.password ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : 'border-secondary-300'
                  }`}
                  {...registerPassword('password')}
                  autoFocus
                />
                {passwordErrors.password && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.password.message}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Log In Button */}
              <Button
                type="submit"
                loading={loading}
                fullWidth
                size="lg"
                className="!bg-green-600 hover:!bg-green-700 !text-white !text-base !py-3"
              >
                Log in
              </Button>
            </form>
          </>
        )}
        </div>
      </div>

      {/* Simple Footer */}
      <div className="w-full py-4 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-secondary-400">
            © {new Date().getFullYear()} GrowTogether. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
