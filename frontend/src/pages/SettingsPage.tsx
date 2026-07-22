import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { usePageTitle } from '../hooks/usePageTitle';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { 
  Settings, User, Lock, Bell, Mail, 
  Globe, Shield, Eye, EyeOff, Check
} from 'lucide-react';
import type { UserProfile } from '../types';

const SettingsPage: React.FC = () => {
  usePageTitle('Settings');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    title: '',
    company: '',
    location: '',
    website: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    is_public_profile: true,
    show_email: false,
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user) {
        const profileResponse = await apiService.getUserProfile();
        setProfile(profileResponse);
        
        setFormData({
          username: profileResponse.username || '',
          bio: profileResponse.bio || '',
          title: profileResponse.title || '',
          company: profileResponse.company || '',
          location: profileResponse.location || '',
          website: profileResponse.website || '',
          linkedin_url: profileResponse.linkedin_url || '',
          github_url: profileResponse.github_url || '',
          twitter_url: profileResponse.twitter_url || '',
          is_public_profile: profileResponse.is_public_profile ?? true,
          show_email: profileResponse.show_email ?? false,
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));

    if (errors[`password_${name}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`password_${name}`];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const updatedProfile = await apiService.updateProfile({
        username: formData.username,
        bio: formData.bio,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        website: formData.website,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        twitter_url: formData.twitter_url,
        is_public_profile: formData.is_public_profile,
        show_email: formData.show_email,
      });
      
      setProfile(updatedProfile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.current_password) newErrors.password_current_password = 'Current password is required';
    if (!passwordData.new_password) newErrors.password_new_password = 'New password is required';
    if (passwordData.new_password.length < 8) newErrors.password_new_password = 'Password must be at least 8 characters';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.new_password)) {
      newErrors.password_new_password = 'Password must contain uppercase, lowercase, and a number';
    }
    if (passwordData.new_password !== passwordData.confirm_new_password) newErrors.password_confirm_new_password = 'Passwords do not match';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setSaving(true);
      await apiService.changePassword(passwordData.current_password, passwordData.new_password);
      alert('Password updated successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_new_password: '',
      });
    } catch (error: any) {
      console.error('Failed to update password:', error);
      const message = error.response?.data?.error || 'Failed to update password';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { scrollTo } = useSmoothScroll();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="primary" text="Loading settings..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Please log in to access settings</h2>
          <a href="/login" className="text-primary-600 hover:underline">Go to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="p-5 border-b border-secondary-100">
            <div className="flex items-center">
              <Settings className="w-6 h-6 mr-3 text-primary-600" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
                <p className="text-secondary-600 mt-1">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <a 
                        href="#profile" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </a>
                      <a 
                        href="#account" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-lg"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Account
                      </a>
                      <a 
                        href="#security" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-lg"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Security
                      </a>
                      <a 
                        href="#notifications" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-lg"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </a>
                      <a 
                        href="#privacy" 
                        className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Privacy
                      </a>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-secondary-100">
                      <Button 
                        variant="danger" 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Settings */}
                <Card id="profile">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary-600" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Username</label>
                        <Input
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="Enter your username"
                        />
                        {errors.username && <p className="mt-1 text-sm text-danger-600">{errors.username}</p>}
                      </div>
                      

                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Bio</label>
                        <Textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Title</label>
                          <Input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Your title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Company</label>
                          <Input
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Your company"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Location</label>
                          <Input
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Your location"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">Website</label>
                          <Input
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" disabled={saving} className="mt-4">
                        {saving ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                {/* Security Settings */}
                <Card id="security">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-primary-600" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Current Password</label>
                        <div className="relative">
                          <Input
                            name="current_password"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            placeholder="Enter your current password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-500"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password_current_password && <p className="mt-1 text-sm text-danger-600">{errors.password_current_password}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">New Password</label>
                        <Input
                          name="new_password"
                          type="password"
                          value={passwordData.new_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter your new password"
                        />
                        {errors.password_new_password && <p className="mt-1 text-sm text-danger-600">{errors.password_new_password}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Confirm New Password</label>
                        <Input
                          name="confirm_new_password"
                          type="password"
                          value={passwordData.confirm_new_password}
                          onChange={handlePasswordChange}
                          placeholder="Confirm your new password"
                        />
                        {errors.password_confirm_new_password && <p className="mt-1 text-sm text-danger-600">{errors.password_confirm_new_password}</p>}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button type="submit" disabled={saving}>
                          {saving ? 'Updating...' : 'Update Password'}
                        </Button>
                        <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                          Forgot password?
                        </a>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                {/* Notification Settings */}
                <Card id="notifications">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-primary-600" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-secondary-900">Email Notifications</label>
                          <p className="text-sm text-secondary-500">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="email_notifications"
                            checked={true} // Assuming default true
                            onChange={() => {}}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-secondary-900">Push Notifications</label>
                          <p className="text-sm text-secondary-500">Receive push notifications on your device</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="push_notifications"
                            checked={false} // Assuming default false
                            onChange={() => {}}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-secondary-900">Marketing Emails</label>
                          <p className="text-sm text-secondary-500">Receive marketing and promotional emails</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="marketing_emails"
                            checked={false} // Assuming default false
                            onChange={() => {}}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Privacy Settings */}
                <Card id="privacy">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-primary-600" />
                      Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Profile Visibility</label>
                        <Select
                          name="is_public_profile"
                          value={formData.is_public_profile ? "public" : "private"}
                          onChange={(e) => setFormData({...formData, is_public_profile: e.target.value === "public"})}
                        >
                          <option value="public">Public - Anyone can see</option>
                          <option value="private">Private - Only you can see</option>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-secondary-900">Show Email</label>
                          <p className="text-sm text-secondary-500">Allow others to see your email address</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="show_email"
                            checked={formData.show_email}
                            onChange={handlePreferenceChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;