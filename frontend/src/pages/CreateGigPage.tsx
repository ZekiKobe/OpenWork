import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { GigCategory } from '../types/index';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Clock,
  FileText,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageTitle } from '../hooks/usePageTitle';

const gigSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000, 'Description must be less than 2000 characters'),
  category: z.enum(['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'data-science', 'consulting', 'other']),
  subcategory: z.string().optional(),
  tags: z.array(z.string().min(1).max(30)).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed'),
  pricing_type: z.enum(['fixed', 'hourly']),
  price: z.number().min(5, 'Price must be at least ETB 5').max(10000, 'Price must be less than ETB 10,000'),
  delivery_time: z.number().min(1, 'Delivery time must be at least 1 day').max(365, 'Delivery time must be less than 365 days'),
  revisions: z.number().min(0, 'Revisions cannot be negative').max(10, 'Maximum 10 revisions allowed'),
  requirements: z.array(z.string().min(1).max(200)).max(20, 'Maximum 20 requirements'),
  features: z.array(z.string().min(1).max(200)).min(1, 'At least one feature is required').max(20, 'Maximum 20 features'),
  images: z.array(z.string().url()).max(10, 'Maximum 10 images allowed')
});

type GigFormData = z.infer<typeof gigSchema>;

const categories = [
  { value: 'web-development', label: 'Web Development', icon: '💻' },
  { value: 'mobile-development', label: 'Mobile Development', icon: '📱' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'writing', label: 'Writing', icon: '✍️' },
  { value: 'marketing', label: 'Marketing', icon: '📈' },
  { value: 'data-science', label: 'Data Science', icon: '📊' },
  { value: 'consulting', label: 'Consulting', icon: '💼' },
  { value: 'other', label: 'Other', icon: '🔧' }
];

const CreateGigPage: React.FC = () => {
  usePageTitle('Create a Gig');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<GigFormData>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      pricing_type: 'fixed',
      tags: [],
      requirements: [],
      features: [],
      images: []
    }
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  });

  const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
    control,
    name: 'requirements'
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'features'
  });

  const pricingType = watch('pricing_type');

  const onSubmit = async (data: GigFormData) => {
    try {
      setLoading(true);
      await apiService.createGig(data);
      toast.success('Gig created successfully!');
      navigate('/marketplace');
    } catch (error: any) {
      console.error('Create gig error:', error);
      toast.error(error.response?.data?.error || 'Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Uploading ${files.length} image(s)...`);

      // Upload files to server
      const filesArray = Array.from(files);
      const response = await apiService.uploadImages(filesArray);

      // Update state with uploaded image URLs
      const currentImages = watch('images') || [];
      const updatedImages = [...currentImages, ...response.urls].slice(0, 10);
      
      // Set preview images (use the server URLs)
      const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
      const fullUrls = response.urls.map(url => `${baseURL}${url}`);
      setUploadedImages([...uploadedImages, ...fullUrls].slice(0, 10));
      
      // Set form value with relative URLs (for database storage)
      setValue('images', updatedImages);

      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      toast.success(`${response.count} image(s) uploaded successfully!`);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.response?.data?.error || 'Failed to upload images. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    setValue('images', updatedImages);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-secondary-600 mb-4">Please log in to create a gig</p>
            <Button onClick={() => navigate('/login')}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Create New Gig</h1>
              <p className="text-secondary-600">Offer your services to the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Gig Title"
                placeholder="e.g., I will create a modern React web application"
                error={errors.title?.message}
                {...register('title')}
                fullWidth
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                    errors.description ? 'border-danger-500' : 'border-secondary-300'
                  }`}
                  rows={6}
                  placeholder="Describe your service in detail. Include what you'll deliver, your process, and any requirements."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <label key={category.value} className="relative">
                      <input
                        type="radio"
                        value={category.value}
                        {...register('category')}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-secondary-200 rounded-lg cursor-pointer peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-secondary-300 transition-colors">
                        <div className="text-center">
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <div className="text-sm font-medium text-secondary-900">{category.label}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-2 text-sm text-danger-600">{errors.category.message}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tags (1-10)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tagFields.map((field, index) => (
                    <div key={field.id} className="flex items-center bg-secondary-100 rounded-full px-3 py-1">
                      <Tag className="w-3 h-3 mr-2 text-secondary-500" />
                      <input
                        type="text"
                        placeholder="Tag name"
                        className="bg-transparent border-none outline-none text-sm flex-1 min-w-0"
                        {...register(`tags.${index}` as const)}
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-secondary-400 hover:text-secondary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {tagFields.length < 10 && (
                    <button
                      type="button"
                      onClick={() => appendTag('')}
                      className="flex items-center bg-green-100 text-green-700 rounded-full px-3 py-1 hover:bg-green-200 transition-colors"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      Add Tag
                    </button>
                  )}
                </div>
                {errors.tags && (
                  <p className="text-sm text-danger-600">{errors.tags.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Pricing & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Pricing Type
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="fixed"
                      {...register('pricing_type')}
                      className="mr-2"
                    />
                    <span className="text-sm">Fixed Price</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="hourly"
                      {...register('pricing_type')}
                      className="mr-2"
                    />
                    <span className="text-sm">Hourly Rate</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label={`Price (${pricingType === 'hourly' ? 'per hour' : 'total'})`}
                  type="number"
                  min="5"
                  max="10000"
                  placeholder={pricingType === 'hourly' ? "50" : "500"}
                  error={errors.price?.message}
                  {...register('price', { valueAsNumber: true })}
                  fullWidth
                />

                <Input
                  label="Delivery Time (days)"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="7"
                  error={errors.delivery_time?.message}
                  {...register('delivery_time', { valueAsNumber: true })}
                  fullWidth
                />

                <Input
                  label="Revisions Included"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="2"
                  error={errors.revisions?.message}
                  {...register('revisions', { valueAsNumber: true })}
                  fullWidth
                />
              </div>
            </CardContent>
          </Card>

          {/* Features & Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Features & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  What's Included (1-20)
                </label>
                <div className="space-y-2">
                  {featureFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="e.g., Responsive design, 3 rounds of revisions"
                        className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        {...register(`features.${index}` as const)}
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-secondary-400 hover:text-secondary-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {featureFields.length < 20 && (
                    <button
                      type="button"
                      onClick={() => appendFeature('')}
                      className="flex items-center text-green-600 hover:text-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </button>
                  )}
                </div>
                {errors.features && (
                  <p className="mt-2 text-sm text-danger-600">{errors.features.message}</p>
                )}
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Client Requirements (Optional)
                </label>
                <div className="space-y-2">
                  {requirementFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-secondary-200 rounded-full flex-shrink-0"></div>
                      <input
                        type="text"
                        placeholder="e.g., Provide design mockups, access to hosting"
                        className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        {...register(`requirements.${index}` as const)}
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-secondary-400 hover:text-secondary-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {requirementFields.length < 20 && (
                    <button
                      type="button"
                      onClick={() => appendRequirement('')}
                      className="flex items-center text-secondary-600 hover:text-secondary-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Requirement
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Images (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-8 text-center hover:border-secondary-400 transition-colors">
                  <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600 mb-2">Drag and drop images here, or click to browse</p>
                  <p className="text-sm text-secondary-500">PNG, JPG up to 10MB each (max 10 images)</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block mt-4 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg cursor-pointer hover:bg-secondary-200 transition-colors"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Image Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/marketplace')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Gig
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGigPage;