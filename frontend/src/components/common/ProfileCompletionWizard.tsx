import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  X, ChevronLeft, ChevronRight, Check,
  User, Briefcase, GraduationCap, Code,
  MapPin, Globe, Github, Linkedin, Twitter,
  Camera, Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProfileCompletionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const wizardSchema = z.object({
  // Step 1: Basic Info
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),

  // Step 2: Professional Info
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  company: z.string().max(100, 'Company must be less than 100 characters').optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  current_role: z.string().max(100, 'Role must be less than 100 characters').optional(),

  // Step 3: Skills & Experience
  skills: z.string().optional(),
  expertise_areas: z.string().optional(),
  years_of_experience: z.number().min(0).max(50).optional(),

  // Step 4: Education
  education_level: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'other']).optional(),
  field_of_study: z.string().max(100, 'Field must be less than 100 characters').optional(),

  // Step 5: Social Links
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  github_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type WizardFormData = z.infer<typeof wizardSchema>;

const steps = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Tell us about yourself',
    icon: User,
    fields: ['bio']
  },
  {
    id: 'professional',
    title: 'Professional Info',
    description: 'Your career details',
    icon: Briefcase,
    fields: ['title', 'company', 'location', 'website', 'current_role']
  },
  {
    id: 'skills',
    title: 'Skills & Experience',
    description: 'Your expertise areas',
    icon: Code,
    fields: ['skills', 'expertise_areas', 'years_of_experience']
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Your educational background',
    icon: GraduationCap,
    fields: ['education_level', 'field_of_study']
  },
  {
    id: 'social',
    title: 'Social Links',
    description: 'Connect your profiles',
    icon: Globe,
    fields: ['linkedin_url', 'github_url', 'twitter_url']
  }
];

export const ProfileCompletionWizard: React.FC<ProfileCompletionWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      bio: user?.bio || '',
      title: user?.title || '',
      company: user?.company || '',
      location: user?.location || '',
      website: user?.website || '',
      current_role: user?.current_role || '',
      skills: (Array.isArray(user?.skills) ? user.skills.join(', ') : '') || '',
      expertise_areas: (Array.isArray(user?.expertise_areas) ? user.expertise_areas.join(', ') : '') || '',
      years_of_experience: user?.years_of_experience || undefined,
      education_level: user?.education_level as any || undefined,
      field_of_study: user?.field_of_study || '',
      linkedin_url: user?.linkedin_url || '',
      github_url: user?.github_url || '',
      twitter_url: user?.twitter_url || '',
    }
  });

  useEffect(() => {
    if (Array.isArray(user?.skills)) setSkills(user.skills);
    if (Array.isArray(user?.expertise_areas)) setExpertiseAreas(user.expertise_areas);
  }, [user]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: WizardFormData) => {
    setIsLoading(true);
    try {
      // Process skills and expertise areas - prioritize the interactive arrays
      const processedData = {
        ...data,
        skills: skills.length > 0 ? skills : [],
        expertise_areas: expertiseAreas.length > 0 ? expertiseAreas : [],
      };


      const result = await apiService.updateProfile(processedData);

      // Update local user state
      if (user) {
        updateUser({
          ...user,
          ...processedData
        });
      }

      toast.success('Profile updated successfully!');
      onComplete();
      onClose();
    } catch (error: any) {
      console.error('Profile update error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      const newSkills = [...skills, skill.trim()];
      setSkills(newSkills);
      setValue('skills', newSkills.join(', '));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(newSkills);
    setValue('skills', newSkills.join(', '));
  };

  const addExpertiseArea = (area: string) => {
    if (area.trim() && !expertiseAreas.includes(area.trim())) {
      const newAreas = [...expertiseAreas, area.trim()];
      setExpertiseAreas(newAreas);
      setValue('expertise_areas', newAreas.join(', '));
    }
  };

  const removeExpertiseArea = (areaToRemove: string) => {
    const newAreas = expertiseAreas.filter(area => area !== areaToRemove);
    setExpertiseAreas(newAreas);
    setValue('expertise_areas', newAreas.join(', '));
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary-900">{currentStepData.title}</h2>
              <p className="text-sm text-secondary-600">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-secondary-50 border-b border-secondary-200">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-green-100 text-green-600 border-2 border-green-500'
                    : 'bg-secondary-200 text-secondary-500'
                }`}>
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${
                    index < currentStep ? 'bg-green-500' : 'bg-secondary-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Bio <span className="text-secondary-500">(optional)</span>
                  </label>
                  <textarea
                    {...register('bio')}
                    placeholder="Tell others about yourself, your interests, and what you do..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Professional Title <span className="text-secondary-500">(optional)</span>
                    </label>
                    <Input
                      {...register('title')}
                      placeholder="e.g., Software Engineer, Data Scientist"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Company <span className="text-secondary-500">(optional)</span>
                    </label>
                    <Input
                      {...register('company')}
                      placeholder="Your current company"
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Location <span className="text-secondary-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
                    <Input
                      {...register('location')}
                      placeholder="City, Country"
                      className="pl-10"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Current Role <span className="text-secondary-500">(optional)</span>
                  </label>
                  <Input
                    {...register('current_role')}
                    placeholder="Your current position"
                  />
                  {errors.current_role && (
                    <p className="mt-1 text-sm text-red-600">{errors.current_role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Website <span className="text-secondary-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
                    <Input
                      {...register('website')}
                      placeholder="https://your-website.com"
                      className="pl-10"
                    />
                  </div>
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Skills <span className="text-secondary-500">(optional)</span>
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Add a skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value;
                          if (value.trim()) {
                            addSkill(value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-green-100 text-green-700">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Expertise Areas <span className="text-secondary-500">(optional)</span>
                  </label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Add an expertise area and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value;
                          if (value.trim()) {
                            addExpertiseArea(value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      {expertiseAreas.map((area, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                          {area}
                          <button
                            type="button"
                            onClick={() => removeExpertiseArea(area)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Years of Experience <span className="text-secondary-500">(optional)</span>
                  </label>
                  <select
                    {...register('years_of_experience', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="0">Less than 1 year</option>
                    <option value="1">1 year</option>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="4">4 years</option>
                    <option value="5">5 years</option>
                    <option value="6">6-8 years</option>
                    <option value="9">9-10 years</option>
                    <option value="11">10+ years</option>
                  </select>
                  {errors.years_of_experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.years_of_experience.message}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Education Level <span className="text-secondary-500">(optional)</span>
                  </label>
                  <select
                    {...register('education_level')}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select education level</option>
                    <option value="high_school">High School</option>
                    <option value="associate">Associate Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.education_level && (
                    <p className="mt-1 text-sm text-red-600">{errors.education_level.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Field of Study <span className="text-secondary-500">(optional)</span>
                  </label>
                  <Input
                    {...register('field_of_study')}
                    placeholder="e.g., Computer Science, Business Administration"
                  />
                  {errors.field_of_study && (
                    <p className="mt-1 text-sm text-red-600">{errors.field_of_study.message}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    LinkedIn <span className="text-secondary-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
                    <Input
                      {...register('linkedin_url')}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="pl-10"
                    />
                  </div>
                  {errors.linkedin_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkedin_url.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    GitHub <span className="text-secondary-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
                    <Input
                      {...register('github_url')}
                      placeholder="https://github.com/yourusername"
                      className="pl-10"
                    />
                  </div>
                  {errors.github_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.github_url.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Twitter <span className="text-secondary-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
                    <Input
                      {...register('twitter_url')}
                      placeholder="https://twitter.com/yourusername"
                      className="pl-10"
                    />
                  </div>
                  {errors.twitter_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.twitter_url.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-secondary-200 bg-secondary-50">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="text-sm text-secondary-500">
              Step {currentStep + 1} of {steps.length}
            </div>

            {currentStep === steps.length - 1 ? (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Profile</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
