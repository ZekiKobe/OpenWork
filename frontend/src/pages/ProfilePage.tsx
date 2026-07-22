import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { UserProfile, Post, CreatePortfolioData, UpdatePortfolioData, PortfolioItem, UpdateProfileData } from '../types/index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import {
  User, Edit, Save, X, FileText, MessageCircle, Heart, Award, Calendar,
  Briefcase, MapPin, Globe, Github, Linkedin, Twitter, GraduationCap,
  Zap, Star, Plus, Minus, Upload, Camera, Settings, Shield, Code, Link as LinkIcon
} from 'lucide-react';
import ProfileSidebar from '../components/common/ProfileSidebar';
import { formatDistanceToNow, format } from 'date-fns';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  // Professional Information
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  company: z.string().max(100, 'Company must be less than 100 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  // Skills and Expertise
  skills: z.string().optional(),
  expertise_areas: z.string().optional(),
  // Experience
  years_of_experience: z.number().min(0).max(50).optional(),
  current_role: z.string().max(100, 'Role must be less than 100 characters').optional(),
  // Education
  education_level: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'other']).optional(),
  field_of_study: z.string().max(100, 'Field must be less than 100 characters').optional(),
  // Social Links
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  // Preferences
  is_public_profile: z.boolean().optional(),
  show_email: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const educationLevels = {
  high_school: 'High School',
  associate: 'Associate Degree',
  bachelor: 'Bachelor\'s Degree',
  master: 'Master\'s Degree',
  phd: 'PhD',
  other: 'Other'
};

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [educationData, setEducationData] = useState({
    education_level: '',
    field_of_study: '',
    school: '',
  });
  const [experienceData, setExperienceData] = useState({
    current_role: '',
    company: '',
    years_of_experience: 0,
  });
  const [skillsData, setSkillsData] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState<string>('');
  const [socialLinks, setSocialLinks] = useState({
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    website: '',
  });
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userGigs, setUserGigs] = useState<any[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(false);
  const [userPortfolios, setUserPortfolios] = useState<any[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any | null>(null);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState<CreatePortfolioData & UpdatePortfolioData>({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    category: '',
    technologies: [] as string[],
  });
  const [techInput, setTechInput] = useState('');
  const [portfolioErrors, setPortfolioErrors] = useState<Record<string, string>>({});

  const loadUserPortfolios = async (userId?: number) => {
    try {
      setLoadingPortfolios(true);
      
      // Fetch portfolios specifically for this user
      const response = await apiService.getMyPortfolios();
      
      setUserPortfolios(response.portfolios || []);
    } catch (error: any) {
      // Only log if it's not a 404 (endpoint might not be implemented yet)
      if (error.response?.status !== 404) {
        console.error('Failed to load user portfolios:', error);
      }
      // Don't set an error state for portfolios since they're supplementary to the profile
      setUserPortfolios([]);
    } finally {
      setLoadingPortfolios(false);
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;

    const fields = [
      { field: profile.username, weight: 10 },
      { field: profile.email, weight: 10 },
      { field: profile.bio, weight: 8 },
      { field: profile.title, weight: 6 },
      { field: profile.company, weight: 5 },
      { field: profile.location, weight: 4 },
      { field: profile.website, weight: 3 },
      { field: Array.isArray(profile.skills) && profile.skills.length > 0, weight: 8 },
      { field: Array.isArray(profile.expertise_areas) && profile.expertise_areas.length > 0, weight: 8 },
      { field: profile.years_of_experience, weight: 6 },
      { field: profile.current_role, weight: 5 },
      { field: profile.education_level, weight: 6 },
      { field: profile.field_of_study, weight: 5 },
      { field: profile.linkedin_url, weight: 3 },
      { field: profile.github_url, weight: 3 },
      { field: profile.twitter_url, weight: 3 },
      { field: profile.avatar_url, weight: 4 },
    ];

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = fields.reduce((sum, field) => {
      return sum + (field.field ? field.weight : 0);
    }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Modal states for adding profile sections
  // Removed unused modals since those sections are not implemented

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (username) {
      console.log('ProfilePage useEffect triggered for username:', username);
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading profile for username:', username);
      const profileResponse = await apiService.getPublicProfile(username!);
      console.log('Profile loaded successfully:', profileResponse);
      setProfile(profileResponse);
      setIsOwnProfile(user?.id === profileResponse.id);

      // Load user's posts (simplified - in real app, we'd have a dedicated endpoint)
      const postsResponse = await apiService.getPosts(1, 10);
      setUserPosts(postsResponse?.data?.filter(post => post?.author?.id === profileResponse.id) || []);

      // Load user's gigs if they are a freelancer
      if (profileResponse.role === 'freelancer') {
        await loadUserGigs(profileResponse.id);
      }

      // Load user's portfolios
      await loadUserPortfolios(profileResponse.id);

      if (isOwnProfile) {
        reset({
          username: profileResponse.username,
          bio: profileResponse.bio || '',
          title: profileResponse.title || '',
          company: profileResponse.company || '',
          location: profileResponse.location || '',
          website: profileResponse.website || '',
        skills: (Array.isArray(profileResponse.skills) ? profileResponse.skills.join(', ') : ''),
        expertise_areas: (Array.isArray(profileResponse.expertise_areas) ? profileResponse.expertise_areas.join(', ') : ''),
          years_of_experience: profileResponse.years_of_experience,
          current_role: profileResponse.current_role || '',
          education_level: profileResponse.education_level as 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'other' | undefined,
          field_of_study: profileResponse.field_of_study || '',
          linkedin_url: profileResponse.linkedin_url || '',
          github_url: profileResponse.github_url || '',
          twitter_url: profileResponse.twitter_url || '',
          is_public_profile: profileResponse.is_public_profile,
          show_email: profileResponse.show_email,
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserGigs = async (userId: number) => {
    try {
      setLoadingGigs(true);
      
      // Fetch gigs specifically for this freelancer
      const response = await apiService.getGigs({
        freelancer_id: userId,
        page: 1,
        limit: 10
      });
      
      setUserGigs(response.gigs || []);
    } catch (error: any) {
      // Only log if it's not a 404 (endpoint might not be implemented yet)
      if (error.response?.status !== 404) {
        console.error('Failed to load user gigs:', error);
      }
      // Don't set an error state for gigs since they're supplementary to the profile
      setUserGigs([]);
    } finally {
      setLoadingGigs(false);
    }
  };

  const handlePortfolioInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPortfolioForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (portfolioErrors[name]) {
      setPortfolioErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !(portfolioForm.technologies || []).includes(techInput.trim())) {
      setPortfolioForm(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setPortfolioForm(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(t => t !== tech)
    }));
  };

  // Education section handlers
  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEducationData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateEducation = async () => {
    if (!profile) return;
    
    try {
      const updateData: UpdateProfileData = {
        education_level: educationData.education_level,
        field_of_study: educationData.field_of_study,
      };
      
      const updatedProfile = await apiService.updateProfile(updateData);
      setProfile(updatedProfile);
      setEditingSection(null);
      alert('Education updated successfully');
    } catch (error) {
      console.error('Error updating education:', error);
      alert('Failed to update education');
    }
  };

  // Experience section handlers
  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExperienceData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateExperience = async () => {
    if (!profile) return;
    
    try {
      const updateData: UpdateProfileData = {
        current_role: experienceData.current_role,
        company: experienceData.company,
        years_of_experience: experienceData.years_of_experience,
      };
      
      const updatedProfile = await apiService.updateProfile(updateData);
      setProfile(updatedProfile);
      setEditingSection(null);
      alert('Experience updated successfully');
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Failed to update experience');
    }
  };

  // Skills section handlers
  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skillsData.includes(trimmedSkill)) {
      setSkillsData([...skillsData, trimmedSkill]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsData(skillsData.filter(skill => skill !== skillToRemove));
  };

  const handleSkillInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleUpdateSkills = async () => {
    if (!profile) return;
    
    try {
      const updateData: UpdateProfileData = {
        skills: skillsData,
      };
      
      const updatedProfile = await apiService.updateProfile(updateData);
      setProfile(updatedProfile);
      setEditingSection(null);
      alert('Skills updated successfully');
    } catch (error) {
      console.error('Error updating skills:', error);
      alert('Failed to update skills');
    }
  };

  // Social links handlers
  const handleSocialLinksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSocialLinks = async () => {
    if (!profile) return;
    
    try {
      const updateData: UpdateProfileData = {
        linkedin_url: socialLinks.linkedin_url,
        github_url: socialLinks.github_url,
        twitter_url: socialLinks.twitter_url,
        website: socialLinks.website,
      };
      
      const updatedProfile = await apiService.updateProfile(updateData);
      setProfile(updatedProfile);
      setEditingSection(null);
      alert('Social links updated successfully');
    } catch (error) {
      console.error('Error updating social links:', error);
      alert('Failed to update social links');
    }
  };

  const handleSavePortfolio = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!portfolioForm.title.trim()) newErrors.title = 'Title is required';
    if (!portfolioForm.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setPortfolioErrors(newErrors);
      return;
    }

    try {
      let response: { portfolio: PortfolioItem };
      if (editingPortfolio) {
        // Update existing portfolio
        response = await apiService.updatePortfolio(
          editingPortfolio.id,
          portfolioForm as UpdatePortfolioData
        );
        setUserPortfolios(prev => prev.map(p => p.id === editingPortfolio.id ? response.portfolio : p));
      } else {
        // Create new portfolio
        response = await apiService.createPortfolio(portfolioForm as CreatePortfolioData);
        setUserPortfolios(prev => [response.portfolio, ...prev]);
      }
      
      // Reset form and close modal
      setPortfolioForm({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        category: '',
        technologies: [],
      });
      setTechInput('');
      setPortfolioErrors({});
      setShowAddPortfolio(false);
      setEditingPortfolio(null);
    } catch (error: any) {
      console.error('Error saving portfolio:', error);
      setPortfolioErrors({ submit: error.response?.data?.error || 'Failed to save portfolio' });
    }
  };

  const handleCancelPortfolio = () => {
    setPortfolioForm({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      category: '',
      technologies: [],
    });
    setTechInput('');
    setPortfolioErrors({});
    setShowAddPortfolio(false);
    setEditingPortfolio(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      setError(null);

      const updateData = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        expertise_areas: data.expertise_areas ? data.expertise_areas.split(',').map(s => s.trim()).filter(s => s) : [],
      };

      await apiService.updateProfile(updateData);
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
      setEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      reset({
        username: profile.username,
        bio: profile.bio || '',
        title: profile.title || '',
        company: profile.company || '',
        location: profile.location || '',
        website: profile.website || '',
        skills: (Array.isArray(profile.skills) ? profile.skills.join(', ') : ''),
        expertise_areas: (Array.isArray(profile.expertise_areas) ? profile.expertise_areas.join(', ') : ''),
        years_of_experience: profile.years_of_experience,
        current_role: profile.current_role || '',
        education_level: profile.education_level as 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'other' | undefined,
        field_of_study: profile.field_of_study || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        twitter_url: profile.twitter_url || '',
        is_public_profile: profile.is_public_profile,
        show_email: profile.show_email,
      });
    }
    setEditing(false);
    setError(null);
  };

  const { scrollTo } = useSmoothScroll();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center mt-8">
        <LoadingSpinner size="lg" variant="primary" text="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              {error || 'User not found'}
            </h2>
          </CardContent>
        </Card>
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

      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar profile={profile} isOwnProfile={isOwnProfile} />
          <div className="flex-1">
            {/* Profile Header - Clean Modern Design */}
            <div className="relative mb-4">
              <Card className="shadow-md border border-secondary-200 bg-white overflow-hidden">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-30"></div>

                <CardContent className="relative p-4">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-3 md:space-y-0 md:space-x-4">
                    {/* Profile Avatar */}
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 shadow-sm border border-white transition-all duration-300">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={`${profile.username}'s avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center">
                            <User className="w-8 h-8 text-primary-600" />
                          </div>
                        )}
                      </div>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-success-400 to-success-500 rounded-full border border-white">
                        <div className="w-full h-full bg-white rounded-full border border-success-400"></div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary-900 mb-2 md:mb-0">
                              {profile.username}
                            </h1>
                            <div className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center ${
                              profile.role === 'freelancer'
                                ? 'bg-green-100 text-green-800'
                                : profile.role === 'client'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-primary-100 text-primary-800'
                            }`}>
                              {profile.role === 'freelancer' ? (
                                <Briefcase className="w-4 h-4 mr-2" />
                              ) : profile.role === 'client' ? (
                                <User className="w-4 h-4 mr-2" />
                              ) : (
                                <div className="w-2 h-2 bg-current rounded-full mr-2"></div>
                              )}
                              {profile.role === 'freelancer' ? 'Freelancer' :
                               profile.role === 'client' ? 'Client' :
                               profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
                            </div>
                          </div>

                          {/* Meta information */}
                          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-secondary-600">
                            {(profile.show_email && profile.email) && (
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-primary-500" />
                                <span>{profile.email}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-success-500" />
                              <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                            </div>
                            <div className="flex items-center text-primary-600 font-medium">
                              <Zap className="w-4 h-4 mr-2" />
                              <span>{profile.total_points.toLocaleString()} points</span>
                            </div>
                            {isOwnProfile && (
                              <div className="flex items-center text-orange-600 text-sm">
                                <User className="w-3 h-3 mr-1" />
                                <span>{profileCompletion}%</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit Button */}
                        {isOwnProfile && !editing && (
                          <Button
                            onClick={() => setEditing(true)}
                            className="bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mt-4 pt-4 border-t border-secondary-100">
                    {editing ? (
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                          label="Username"
                          error={errors.username?.message}
                          {...register('username')}
                          fullWidth
                        />

                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Bio (Optional)
                          </label>
                          <textarea
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
                              errors.bio ? 'border-danger-500' : 'border-secondary-300'
                            }`}
                            rows={3}
                            placeholder="Tell us about yourself..."
                            {...register('bio')}
                          />
                          {errors.bio && (
                            <p className="mt-1 text-sm text-danger-600">{errors.bio.message}</p>
                          )}
                        </div>

                        {error && (
                          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                            <p className="text-sm text-danger-600">{error}</p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <Button type="submit" loading={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button type="button" variant="outline" onClick={cancelEdit}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        {profile.bio ? (
                          <div className="bg-secondary-50 rounded-lg p-4">
                            <p className="text-secondary-700 leading-relaxed">{profile.bio}</p>
                          </div>
                        ) : isOwnProfile ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <User className="w-8 h-8 text-secondary-400" />
                            </div>
                            <p className="text-secondary-500 mb-3">No bio yet</p>
                            <Button
                              onClick={() => setEditing(true)}
                              variant="outline"
                              className="text-primary-600 border-primary-200 hover:bg-primary-50"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Add Bio
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <User className="w-8 h-8 text-secondary-400" />
                            </div>
                            <p className="text-secondary-500">This user hasn't added a bio yet.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Role-specific information */}
                    {profile.role === 'freelancer' && !isOwnProfile && (
                      <div className="mt-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-green-900 mb-2">Freelancer Profile</h3>
                              <p className="text-green-800 text-sm mb-3">
                                This user offers professional freelance services. Check out their gigs and completed projects.
                              </p>
                              <Link to={`/marketplace?freelancer=${profile.id}`}>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Briefcase className="w-4 h-4 mr-2" />
                                  View Services
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.role === 'client' && !isOwnProfile && (
                      <div className="mt-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-blue-900 mb-2">Client Profile</h3>
                              <p className="text-blue-800 text-sm mb-3">
                                This client posts projects and works with talented freelancers to bring their ideas to life.
                              </p>
                              <Link to="/jobs">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Briefcase className="w-4 h-4 mr-2" />
                                  Browse Jobs
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-1 mb-4">
              <Card className="group hover:shadow-md transition-all duration-300 border border-secondary-100 bg-white">
                <CardContent className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center transition-all duration-300">
                      <Award className="w-5 h-5 text-secondary-600" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-secondary-900 mb-0">
                    {profile.total_points.toLocaleString()}
                  </p>
                  <p className="text-xs text-secondary-500 uppercase tracking-wide">Points</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border border-secondary-100 hover:border-primary-200 bg-white hover:bg-secondary-50/30">
                <CardContent className="text-center p-6">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                      <FileText className="w-6 h-6 text-secondary-600" />
                    </div>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 mb-1">
                    {profile.stats.posts_count}
                  </p>
                  <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Posts</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-md transition-all duration-300 border border-secondary-100 bg-white">
                <CardContent className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center transition-all duration-300">
                      <MessageCircle className="w-5 h-5 text-secondary-600" strokeWidth={2} />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-secondary-900 mb-0">
                    {profile.stats.comments_count}
                  </p>
                  <p className="text-xs text-secondary-500 uppercase tracking-wide">Comments</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-md transition-all duration-300 border border-secondary-100 bg-white">
                <CardContent className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center transition-all duration-300">
                      <Heart className="w-5 h-5 text-secondary-600" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-secondary-900 mb-0">
                    {profile.stats.likes_received}
                  </p>
                  <p className="text-xs text-secondary-500 uppercase tracking-wide">Likes</p>
                </CardContent>
              </Card>

              {/* Role-specific stat */}
              <Card className="group hover:shadow-md transition-all duration-300 border border-secondary-100 bg-white">
                <CardContent className="text-center p-3">
                  <div className="flex items-center justify-center mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      profile.role === 'freelancer'
                        ? 'bg-green-100'
                        : profile.role === 'client'
                        ? 'bg-blue-100'
                        : 'bg-secondary-100'
                    }`}>
                      {profile.role === 'freelancer' ? (
                        <Briefcase className="w-5 h-5 text-green-600" />
                      ) : profile.role === 'client' ? (
                        <User className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Award className="w-5 h-5 text-secondary-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-secondary-900 mb-0">
                    {profile.role === 'freelancer' ? '5' : profile.role === 'client' ? '3' : '0'}
                  </p>
                  <p className="text-xs text-secondary-500 uppercase tracking-wide">
                    {profile.role === 'freelancer' ? 'Gigs' : profile.role === 'client' ? 'Jobs' : 'Activity'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Professional Information */}
            {(profile.title || profile.company || profile.location || profile.website) && (
              <Card className="mb-6 border border-secondary-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-bold text-secondary-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-2">
                      <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.title && (
                      <div className="group">
                        <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide mb-1">Title</p>
                        <p className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">{profile.title}</p>
                      </div>
                    )}
                    {profile.company && (
                      <div className="group">
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Company</p>
                        <p className="font-semibold text-secondary-900 text-lg group-hover:text-success-600 transition-colors">{profile.company}</p>
                      </div>
                    )}
                    {profile.location && (
                      <div className="group">
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Location</p>
                        <p className="font-semibold text-secondary-900 text-lg flex items-center group-hover:text-info-600 transition-colors">
                          <MapPin className="w-5 h-5 mr-2 text-info-500" />
                          {profile.location}
                        </p>
                      </div>
                    )}
                    {profile.website && (
                      <div className="group">
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Website</p>
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary-600 hover:text-primary-700 text-lg flex items-center transition-all duration-300 hover:translate-x-1"
                        >
                          <Globe className="w-5 h-5 mr-2" />
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills & Expertise */}
            {Array.isArray(profile.skills) && profile.skills.length > 0 || Array.isArray(profile.expertise_areas) && profile.expertise_areas.length > 0 ? (
              <Card className="mb-4 border border-secondary-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-bold text-secondary-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-success-600 rounded-lg flex items-center justify-center mr-2">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-4">
                    {Array.isArray(profile.skills) && profile.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-secondary-500 uppercase tracking-wide mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(profile.expertise_areas) && profile.expertise_areas.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-3">Expertise Areas</p>
                        <div className="flex flex-wrap gap-3">
                          {profile.expertise_areas.map((area, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-success-500 to-success-600 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Experience & Education */}
            {(profile.years_of_experience || profile.current_role || profile.education_level || profile.field_of_study) && (
              <Card className="mb-6 shadow-sm border bg-white hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl font-bold text-secondary-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-info-500 to-info-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    Experience & Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.years_of_experience && (
                      <div className="group">
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Years of Experience</p>
                        <p className="font-semibold text-secondary-900 text-lg group-hover:text-primary-600 transition-colors">{profile.years_of_experience} years</p>
                      </div>
                    )}
                    {profile.current_role && (
                      <div className="group">
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Current Role</p>
                        <p className="font-semibold text-secondary-900 text-lg group-hover:text-success-600 transition-colors">{profile.current_role}</p>
                      </div>
                    )}
                    {profile.education_level && (
                      <div className="group">
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Education Level</p>
                        <p className="font-semibold text-secondary-900 text-lg group-hover:text-info-600 transition-colors">{educationLevels[profile.education_level as keyof typeof educationLevels]}</p>
                      </div>
                    )}
                    {profile.field_of_study && (
                      <div className="group">
                        <p className="text-sm font-medium text-secondary-500 uppercase tracking-wide mb-1">Field of Study</p>
                        <p className="font-semibold text-secondary-900 text-lg group-hover:text-danger-600 transition-colors">{profile.field_of_study}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {(profile.linkedin_url || profile.github_url || profile.twitter_url) && (
              <Card className="mb-4 border border-secondary-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg font-bold text-secondary-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center mr-2">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-wrap gap-3">
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 px-3 py-2 rounded-lg transition-all duration-300"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded flex items-center justify-center">
                          <Linkedin className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-primary-700 text-sm group-hover:text-primary-800">LinkedIn</span>
                      </a>
                    )}
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-3 bg-gradient-to-r from-secondary-50 to-secondary-100 hover:from-secondary-100 hover:to-secondary-200 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-secondary-600 to-secondary-700 rounded-lg flex items-center justify-center shadow-md">
                          <Github className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-secondary-700 group-hover:text-secondary-800">GitHub</span>
                      </a>
                    )}
                    {profile.twitter_url && (
                      <a
                        href={profile.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-3 bg-gradient-to-r from-info-50 to-info-100 hover:from-info-100 hover:to-info-200 px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-info-500 to-info-600 rounded-lg flex items-center justify-center shadow-md">
                          <Twitter className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-info-700 group-hover:text-info-800">Twitter</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Section */}
            <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white to-purple-50/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-bold text-secondary-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-secondary-900">Portfolio</span>
                  </div>
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingPortfolio(null);
                        setPortfolioForm({
                          title: '',
                          description: '',
                          image_url: '',
                          link_url: '',
                          category: '',
                          technologies: [],
                        });
                        setShowAddPortfolio(true);
                      }}
                      className="flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Project
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingPortfolios ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" variant="secondary" text="Loading portfolios..." />
                  </div>
                ) : userPortfolios.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPortfolios.map((portfolio) => (
                      <div key={portfolio.id} className="border border-secondary-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-secondary-900">{portfolio.title}</h4>
                          {isOwnProfile && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setEditingPortfolio(portfolio);
                                  setPortfolioForm({
                                    title: portfolio.title,
                                    description: portfolio.description,
                                    image_url: portfolio.image_url || '',
                                    link_url: portfolio.link_url || '',
                                    category: portfolio.category || '',
                                    technologies: portfolio.technologies || [],
                                  });
                                  setShowAddPortfolio(true);
                                }}
                                className="p-1 h-auto"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this portfolio item?')) {
                                    try {
                                      await apiService.deletePortfolio(portfolio.id);
                                      setUserPortfolios(userPortfolios.filter(p => p.id !== portfolio.id));
                                    } catch (error) {
                                      console.error('Failed to delete portfolio:', error);
                                      alert('Failed to delete portfolio item');
                                    }
                                  }
                                }}
                                className="p-1 h-auto text-danger-600 hover:text-danger-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-secondary-600 text-sm mb-3">{portfolio.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {portfolio.technologies && Array.isArray(portfolio.technologies) && portfolio.technologies.map((tech: string, idx: number) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        {portfolio.link_url && (
                          <a 
                            href={portfolio.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
                          >
                            View Project
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-secondary-500 mb-4">No portfolio items yet</p>
                    {isOwnProfile && (
                      <Button 
                        onClick={() => {
                          setEditingPortfolio(null);
                          setPortfolioForm({
                            title: '',
                            description: '',
                            image_url: '',
                            link_url: '',
                            category: '',
                            technologies: [],
                          });
                          setShowAddPortfolio(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Add Your First Project
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Modal */}
            {showAddPortfolio && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                  <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
                            {editingPortfolio ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
                          </h3>
                          <div className="mt-2 space-y-4">
                            <div>
                              <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                                Title *
                              </label>
                              <Input
                                id="title"
                                name="title"
                                value={portfolioForm.title}
                                onChange={handlePortfolioInputChange}
                                error={portfolioErrors.title}
                                placeholder="Project title"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
                                Description *
                              </label>
                              <Textarea
                                id="description"
                                name="description"
                                value={portfolioForm.description}
                                onChange={handlePortfolioInputChange}
                                error={portfolioErrors.description}
                                placeholder="Describe your project..."
                                rows={4}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="link_url" className="block text-sm font-medium text-secondary-700 mb-1">
                                  Project Link
                                </label>
                                <Input
                                  id="link_url"
                                  name="link_url"
                                  type="url"
                                  value={portfolioForm.link_url}
                                  onChange={handlePortfolioInputChange}
                                  error={portfolioErrors.link_url}
                                  placeholder="https://example.com"
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="image_url" className="block text-sm font-medium text-secondary-700 mb-1">
                                  Image URL
                                </label>
                                <Input
                                  id="image_url"
                                  name="image_url"
                                  type="url"
                                  value={portfolioForm.image_url}
                                  onChange={handlePortfolioInputChange}
                                  error={portfolioErrors.image_url}
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-1">
                                Category
                              </label>
                              <Input
                                id="category"
                                name="category"
                                value={portfolioForm.category}
                                onChange={handlePortfolioInputChange}
                                error={portfolioErrors.category}
                                placeholder="e.g., Web Development, Mobile App, Design"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Technologies Used
                              </label>
                              <div className="flex">
                                <Input
                                  value={techInput}
                                  onChange={(e) => setTechInput(e.target.value)}
                                  placeholder="Add a technology (e.g., React, Node.js)"
                                  className="rounded-r-none"
                                />
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={handleAddTechnology}
                                  className="rounded-l-none border-l-0"
                                >
                                  Add
                                </Button>
                              </div>
                              
                              {(portfolioForm.technologies || []).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(portfolioForm.technologies || []).map((tech, index) => (
                                    <span 
                                      key={index}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                                    >
                                      {tech}
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveTechnology(tech)}
                                        className="ml-2 text-purple-600 hover:text-purple-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {portfolioErrors.submit && (
                              <div className="text-danger-600 text-sm">{portfolioErrors.submit}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <Button 
                        onClick={handleSavePortfolio}
                        className="ml-3"
                      >
                        {editingPortfolio ? 'Update' : 'Add'} Portfolio
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelPortfolio}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Education Section */}
            <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-bold text-secondary-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-secondary-900">Education</span>
                  </div>
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingSection(editingSection === 'education' ? null : 'education');
                        setEducationData({
                          education_level: profile?.education_level || '',
                          field_of_study: profile?.field_of_study || '',
                          school: '',
                        });
                      }}
                      className="flex items-center"
                    >
                      {editingSection === 'education' ? 'Cancel' : 'Edit'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {editingSection === 'education' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="education_level" className="block text-sm font-medium text-secondary-700 mb-1">
                        Education Level
                      </label>
                      <select
                        id="education_level"
                        name="education_level"
                        value={educationData.education_level}
                        onChange={handleEducationChange}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Education Level</option>
                        <option value="high_school">High School</option>
                        <option value="associate">Associate Degree</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="phd">PhD</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="field_of_study" className="block text-sm font-medium text-secondary-700 mb-1">
                        Field of Study
                      </label>
                      <Input
                        id="field_of_study"
                        name="field_of_study"
                        value={educationData.field_of_study}
                        onChange={handleEducationChange}
                        placeholder="e.g., Computer Science, Business Administration"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpdateEducation}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Save Education
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingSection(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.education_level && (
                      <div>
                        <span className="text-sm text-secondary-500">Level:</span>
                        <p className="font-medium">{profile.education_level}</p>
                      </div>
                    )}
                    {profile?.field_of_study && (
                      <div>
                        <span className="text-sm text-secondary-500">Field of Study:</span>
                        <p className="font-medium">{profile.field_of_study}</p>
                      </div>
                    )}
                    {!profile?.education_level && !profile?.field_of_study && (
                      <p className="text-secondary-500 italic">No education information added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience Section */}
            <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white to-orange-50/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-bold text-secondary-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-secondary-900">Experience</span>
                  </div>
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingSection(editingSection === 'experience' ? null : 'experience');
                        setExperienceData({
                          current_role: profile?.current_role || '',
                          company: profile?.company || '',
                          years_of_experience: profile?.years_of_experience || 0,
                        });
                      }}
                      className="flex items-center"
                    >
                      {editingSection === 'experience' ? 'Cancel' : 'Edit'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {editingSection === 'experience' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current_role" className="block text-sm font-medium text-secondary-700 mb-1">
                        Current Role
                      </label>
                      <Input
                        id="current_role"
                        name="current_role"
                        value={experienceData.current_role}
                        onChange={handleExperienceChange}
                        placeholder="e.g., Senior Developer, Product Manager"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-secondary-700 mb-1">
                        Company
                      </label>
                      <Input
                        id="company"
                        name="company"
                        value={experienceData.company}
                        onChange={handleExperienceChange}
                        placeholder="e.g., Google, Microsoft"
                      />
                    </div>
                    <div>
                      <label htmlFor="years_of_experience" className="block text-sm font-medium text-secondary-700 mb-1">
                        Years of Experience
                      </label>
                      <Input
                        id="years_of_experience"
                        name="years_of_experience"
                        type="number"
                        min="0"
                        max="50"
                        value={experienceData.years_of_experience}
                        onChange={(e) => setExperienceData(prev => ({
                          ...prev,
                          years_of_experience: parseInt(e.target.value) || 0
                        }))}
                        placeholder="Enter years of experience"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpdateExperience}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Save Experience
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingSection(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.current_role && (
                      <div>
                        <span className="text-sm text-secondary-500">Current Role:</span>
                        <p className="font-medium">{profile.current_role}</p>
                      </div>
                    )}
                    {profile?.company && (
                      <div>
                        <span className="text-sm text-secondary-500">Company:</span>
                        <p className="font-medium">{profile.company}</p>
                      </div>
                    )}
                    {profile?.years_of_experience !== undefined && profile?.years_of_experience !== null && typeof profile.years_of_experience === 'number' && profile.years_of_experience > 0 && (
                      <div>
                        <span className="text-sm text-secondary-500">Years of Experience:</span>
                        <p className="font-medium">{profile.years_of_experience} years</p>
                      </div>
                    )}
                    {!profile?.current_role && !profile?.company && (!profile?.years_of_experience || profile.years_of_experience === 0) && (
                      <p className="text-secondary-500 italic">No experience information added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-bold text-secondary-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-secondary-900">Skills</span>
                  </div>
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (editingSection === 'skills') {
                          setEditingSection(null);
                          setSkillInput('');
                        } else {
                          setEditingSection('skills');
                          setSkillsData(profile?.skills && Array.isArray(profile.skills) ? profile.skills : []);
                          setSkillInput('');
                        }
                      }}
                      className="flex items-center"
                    >
                      {editingSection === 'skills' ? 'Cancel' : 'Edit'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {editingSection === 'skills' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-secondary-700 mb-2">
                        Add Skills
                      </label>
                      <div className="flex space-x-2 mb-3">
                        <Input
                          id="skills"
                          name="skills"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={handleSkillInputKeyPress}
                          placeholder="e.g., JavaScript, React, Node.js"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddSkill}
                          variant="outline"
                          className="flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {skillsData.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {skillsData.map((skill, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-2 hover:bg-indigo-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpdateSkills}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Save Skills
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingSection(null);
                          setSkillInput('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary-500 italic">No skills added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links Section */}
            <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-bold text-secondary-800">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <LinkIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-secondary-900">Social Links</span>
                  </div>
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingSection(editingSection === 'social' ? null : 'social');
                        setSocialLinks({
                          linkedin_url: profile?.linkedin_url || '',
                          github_url: profile?.github_url || '',
                          twitter_url: profile?.twitter_url || '',
                          website: profile?.website || '',
                        });
                      }}
                      className="flex items-center"
                    >
                      {editingSection === 'social' ? 'Cancel' : 'Edit'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {editingSection === 'social' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="linkedin_url" className="block text-sm font-medium text-secondary-700 mb-1">
                        LinkedIn URL
                      </label>
                      <Input
                        id="linkedin_url"
                        name="linkedin_url"
                        type="url"
                        value={socialLinks.linkedin_url}
                        onChange={handleSocialLinksChange}
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                    </div>
                    <div>
                      <label htmlFor="github_url" className="block text-sm font-medium text-secondary-700 mb-1">
                        GitHub URL
                      </label>
                      <Input
                        id="github_url"
                        name="github_url"
                        type="url"
                        value={socialLinks.github_url}
                        onChange={handleSocialLinksChange}
                        placeholder="https://github.com/your-profile"
                      />
                    </div>
                    <div>
                      <label htmlFor="twitter_url" className="block text-sm font-medium text-secondary-700 mb-1">
                        Twitter/X URL
                      </label>
                      <Input
                        id="twitter_url"
                        name="twitter_url"
                        type="url"
                        value={socialLinks.twitter_url}
                        onChange={handleSocialLinksChange}
                        placeholder="https://x.com/your-profile"
                      />
                    </div>
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-secondary-700 mb-1">
                        Personal Website
                      </label>
                      <Input
                        id="website"
                        name="website"
                        type="url"
                        value={socialLinks.website}
                        onChange={handleSocialLinksChange}
                        placeholder="https://your-website.com"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpdateSocialLinks}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        Save Links
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingSection(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile?.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-secondary-600 hover:text-primary-600">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn Profile
                      </a>
                    )}
                    {profile?.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-secondary-600 hover:text-primary-600">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub Profile
                      </a>
                    )}
                    {profile?.twitter_url && (
                      <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-secondary-600 hover:text-primary-600">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter/X Profile
                      </a>
                    )}
                    {profile?.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-secondary-600 hover:text-primary-600">
                        <Globe className="w-4 h-4 mr-2" />
                        Personal Website
                      </a>
                    )}
                    {!profile?.linkedin_url && !profile?.github_url && !profile?.twitter_url && !profile?.website && (
                      <p className="text-secondary-500 italic">No social links added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Freelancer Gigs Section if user is a freelancer */}
            {profile?.role === 'freelancer' && (
              <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30 hover:shadow-2xl transition-all duration-500">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-lg sm:text-xl md:text-2xl font-bold text-secondary-800">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900">Services Offered</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {loadingGigs ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : userGigs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userGigs.map((gig) => (
                        <div key={gig.id} className="border border-secondary-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-secondary-900 mb-2">{gig.title}</h4>
                          <p className="text-secondary-600 text-sm mb-2 line-clamp-2">{gig.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-green-600 font-medium">${gig.price}</span>
                            <span className="text-secondary-500 text-xs">{gig.delivery_time} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-secondary-500 mb-4">No services offered yet</p>
                      {isOwnProfile && (
                        <Link to="/marketplace/create-gig" className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Create Your First Gig
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Posts */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-primary-50/20 hover:shadow-2xl transition-all duration-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-bold text-secondary-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  {isOwnProfile ? 'Your Posts' : `${profile.username}'s Posts`}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {userPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <FileText className="w-12 h-12 text-secondary-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                      {isOwnProfile
                        ? profile.role === 'client'
                          ? 'You haven\'t posted any jobs yet'
                          : 'You haven\'t created any posts yet'
                        : 'No posts yet'
                      }
                    </h3>
                    <p className="text-secondary-600 mb-6 text-lg max-w-md mx-auto">
                      {isOwnProfile
                        ? profile.role === 'client'
                          ? 'Post your first job and find talented freelancers to bring your project to life!'
                          : 'Share your knowledge and start contributing to the community!'
                        : 'This user hasn\'t created any posts yet.'
                      }
                    </p>
                    {isOwnProfile && (
                      <Link
                        to={profile.role === 'client' ? '/jobs/create' : '/marketplace/create-gig'}
                        className={`inline-flex items-center px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-lg text-white ${
                          profile.role === 'client' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {profile.role === 'client' ? (
                          <Briefcase className="w-5 h-5 mr-2" />
                        ) : (
                          <FileText className="w-5 h-5 mr-2" />
                        )}
                        <span>
                          {profile.role === 'client' ? 'Post Your First Job' : 'Create Your First Gig'}
                        </span>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userPosts.map((post) => (
                      <div key={post.id} className="group border border-secondary-200 rounded-2xl p-6 hover:shadow-xl hover:border-primary-200 transition-all duration-500 hover:-translate-y-1 bg-gradient-to-r from-white to-primary-50/20">
                        <a href={`/posts/${post.id}`} className="block">
                          <h3 className="font-bold text-secondary-900 mb-3 text-xl group-hover:text-primary-600 transition-colors leading-tight">
                            {post.title}
                          </h3>
                        </a>
                        <p className="text-secondary-700 mb-4 line-clamp-3 text-base leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </span>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2 text-secondary-600">
                              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                                <Heart className="w-4 h-4 text-danger-600" />
                              </div>
                              <span className="font-medium">{post.stats.likes_count}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-secondary-600">
                              <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-info-600" />
                              </div>
                              <span className="font-medium">{post.stats.comments_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};