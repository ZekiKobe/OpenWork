import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { X, Plus, DollarSign, Clock, Tag, Briefcase } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';

const jobSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000, 'Description must be less than 5000 characters'),
  category: z.enum(['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'data-science', 'consulting', 'other']),
  subcategory: z.string().optional(),
  job_type: z.enum(['fixed', 'hourly']),
  budget_min: z.number().min(5, 'Minimum budget must be at least ETB 5').optional(),
  budget_max: z.number().min(5, 'Maximum budget must be at least ETB 5').optional(),
  fixed_price: z.number().min(5, 'Fixed price must be at least ETB 5').optional(),
  estimated_hours: z.number().min(1, 'Estimated hours must be at least 1').max(2000, 'Estimated hours must be less than 2000').optional(),
  experience_level: z.enum(['entry', 'intermediate', 'expert']),
  duration: z.enum(['short', 'medium', 'long']),
  deadline: z.string().optional(),
  requirements: z.array(z.string()).min(1, 'Please add at least one requirement'),
  preferred_skills: z.array(z.string()).optional(),
  tags: z.array(z.string()).max(15, 'Maximum 15 tags allowed')
}).refine((data) => {
  if (data.job_type === 'hourly') {
    return data.budget_min !== undefined && data.budget_max !== undefined;
  } else {
    return data.fixed_price !== undefined;
  }
}, {
  message: "Please provide budget range for hourly jobs or fixed price for fixed-price jobs",
  path: ["job_type"]
});

type JobFormData = z.infer<typeof jobSchema>;

export const CreateJobPage: React.FC = () => {
  usePageTitle('Post a Job');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      requirements: [],
      preferred_skills: [],
      tags: [],
      job_type: 'fixed',
      experience_level: 'intermediate',
      duration: 'medium'
    }
  });

  const watchJobType = watch('job_type');
  const watchRequirements = watch('requirements') || [];
  const watchSkills = watch('preferred_skills') || [];
  const watchTags = watch('tags') || [];

  const onSubmit = async (data: JobFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare job data for API
      const jobData = {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        tags: data.tags || [],
        job_type: data.job_type,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        fixed_price: data.fixed_price,
        estimated_hours: data.estimated_hours,
        experience_level: data.experience_level,
        duration: data.duration,
        deadline: data.deadline,
        requirements: data.requirements || [],
        preferred_skills: data.preferred_skills || [],
      };

      // Call API to create job
      const response = await apiService.createJob(jobData);
      console.log('Job created:', response.job);

      // Navigate to jobs list
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error creating job:', error);
      setError(error.response?.data?.error || error.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setValue('requirements', [...watchRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setValue('requirements', watchRequirements.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setValue('preferred_skills', [...watchSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setValue('preferred_skills', watchSkills.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !watchTags.includes(newTag.trim())) {
      setValue('tags', [...watchTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', watchTags.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Post a New Job</h1>
          <p className="text-secondary-600">Find the perfect freelancer for your project</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Job Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Job Title"
                placeholder="e.g., Build a responsive e-commerce website"
                error={errors.title?.message}
                {...register('title')}
                fullWidth
              />

              <Textarea
                label="Job Description"
                placeholder="Describe your project requirements, goals, and deliverables..."
                rows={6}
                error={errors.description?.message}
                {...register('description')}
                fullWidth
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  error={errors.category?.message}
                  {...register('category')}
                  fullWidth
                >
                  <option value="">Select Category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="writing">Writing</option>
                  <option value="marketing">Marketing</option>
                  <option value="data-science">Data Science</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </Select>

                <Input
                  label="Subcategory (Optional)"
                  placeholder="e.g., React, Node.js"
                  {...register('subcategory')}
                  fullWidth
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Type & Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Budget & Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Job Type"
                error={errors.job_type?.message}
                {...register('job_type')}
                fullWidth
              >
                <option value="fixed">Fixed Price Project</option>
                <option value="hourly">Hourly Contract</option>
              </Select>

              {watchJobType === 'hourly' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Hourly Rate ($)"
                    type="number"
                    placeholder="30"
                    error={errors.budget_min?.message}
                    {...register('budget_min', { valueAsNumber: true })}
                    fullWidth
                  />
                  <Input
                    label="Maximum Hourly Rate ($)"
                    type="number"
                    placeholder="50"
                    error={errors.budget_max?.message}
                    {...register('budget_max', { valueAsNumber: true })}
                    fullWidth
                  />
                </div>
              ) : (
                <Input
                  label="Fixed Price ($)"
                  type="number"
                  placeholder="500"
                  error={errors.fixed_price?.message}
                  {...register('fixed_price', { valueAsNumber: true })}
                  fullWidth
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Experience Level"
                  error={errors.experience_level?.message}
                  {...register('experience_level')}
                  fullWidth
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </Select>

                <Select
                  label="Project Duration"
                  error={errors.duration?.message}
                  {...register('duration')}
                  fullWidth
                >
                  <option value="short">Less than 1 month</option>
                  <option value="medium">1-3 months</option>
                  <option value="long">3-6 months</option>
                </Select>

                <Input
                  label="Estimated Hours (Optional)"
                  type="number"
                  placeholder="40"
                  {...register('estimated_hours', { valueAsNumber: true })}
                  fullWidth
                />
              </div>

              <Input
                label="Deadline (Optional)"
                type="date"
                {...register('deadline')}
                fullWidth
              />
            </CardContent>
          </Card>

          {/* Requirements & Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Requirements & Skills</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Project Requirements *
                </label>
                <div className="flex space-x-2 mb-3">
                  <Input
                    placeholder="e.g., Must have experience with React and Node.js"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    fullWidth
                  />
                  <Button type="button" onClick={addRequirement} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchRequirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="ml-1 hover:bg-secondary-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.requirements && (
                  <p className="mt-2 text-sm text-danger-600">{errors.requirements.message}</p>
                )}
              </div>

              {/* Preferred Skills */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Preferred Skills (Optional)
                </label>
                <div className="flex space-x-2 mb-3">
                  <Input
                    placeholder="e.g., TypeScript, AWS"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    fullWidth
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-1 hover:bg-secondary-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex space-x-2 mb-3">
                  <Input
                    placeholder="e.g., urgent, remote"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    fullWidth
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchTags.map((tag, index) => (
                    <Badge key={index} variant="primary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 hover:bg-primary-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {errors.tags && (
                  <p className="mt-2 text-sm text-danger-600">{errors.tags.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};