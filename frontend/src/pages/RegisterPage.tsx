import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';
import { useToast } from '../contexts/ToastContext';
import { Home } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  role: z.enum(['freelancer', 'client']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  usePageTitle('Create Account');
  const { role: roleParam } = useParams<{ role: 'freelancer' | 'client' }>();
  const { register: registerUser, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  // Redirect to role selection if no role is provided
  useEffect(() => {
    if (!roleParam || (roleParam !== 'freelancer' && roleParam !== 'client')) {
      navigate('/register');
    }
  }, [roleParam, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: roleParam || 'freelancer',
    },
  });

  // Set role when roleParam changes
  useEffect(() => {
    if (roleParam && (roleParam === 'freelancer' || roleParam === 'client')) {
      setValue('role', roleParam);
    }
  }, [roleParam, setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      await registerUser(data.email, data.password, data.username, data.role);
      showToast('Registration successful! Welcome to our platform.', 'success');
      setJustRegistered(true);
      // Navigation will be handled by useEffect
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation after registration
  useEffect(() => {
    if (justRegistered) {
      // Use a small timeout to ensure state is updated
      const timer = setTimeout(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const registeredUser = JSON.parse(userStr);
          if (registeredUser.role === 'freelancer') {
            navigate('/browse-jobs', { replace: true });
          } else if (registeredUser.role === 'client') {
            navigate('/browse-gigs', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else if (user) {
          // Fallback to user from context if localStorage is not available
          if (user.role === 'freelancer') {
            navigate('/browse-jobs', { replace: true });
          } else if (user.role === 'client') {
            navigate('/browse-gigs', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
        setJustRegistered(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [justRegistered, user, navigate]);

  if (!roleParam || (roleParam !== 'freelancer' && roleParam !== 'client')) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <div className="w-full py-6 px-4 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-secondary-900 lowercase hover:text-green-600 transition-colors">
            OpenWork
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
        <Card className="w-full max-w-md" padding="lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Join OpenWork</CardTitle>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
              fullWidth
            />

            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              error={errors.username?.message}
              {...register('username')}
              fullWidth
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              error={errors.password?.message}
              {...register('password')}
              fullWidth
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              fullWidth
            />

            {/* Role Display (read-only) */}
            {roleParam && (
              <div className="p-3 bg-secondary-50 rounded border border-secondary-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-secondary-700">Registering as:</span>
                  <span className="text-xs font-semibold text-secondary-900 capitalize">{roleParam}</span>
                  <Link
                    to="/register"
                    className="ml-auto text-xs text-accent-600 hover:text-accent-700"
                  >
                    Change
                  </Link>
                </div>
              </div>
            )}
            
            <input type="hidden" {...register('role')} />



            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="md"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-secondary-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <GoogleLoginButton
                onSuccess={() => {
                  setJustRegistered(true);
                  // Navigation will be handled by useEffect
                }}
                onError={(error) => showToast('Google registration failed. Please try again.', 'error')}
              />
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-secondary-600">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-600 hover:text-accent-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-secondary-50 border border-secondary-200 rounded">
            <p className="text-xs text-secondary-700">
              By joining, you agree to our{' '}
              <Link to="/terms" className="text-accent-600 hover:text-accent-700 font-medium">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-accent-600 hover:text-accent-700 font-medium">Privacy Policy</Link>.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Simple Footer */}
      <div className="w-full py-4 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center space-y-2">
          <p className="text-xs text-secondary-500">
            <Link to="/terms" className="hover:text-secondary-700">Terms</Link>
            {' · '}
            <Link to="/privacy" className="hover:text-secondary-700">Privacy</Link>
          </p>
          <p className="text-xs text-secondary-400">
            © {new Date().getFullYear()} OpenWork. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
