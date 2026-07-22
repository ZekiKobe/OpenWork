import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileText, Tag, Save, X, Upload, Image as ImageIcon, Clock, Award } from 'lucide-react';

const createPostSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title must be less than 255 characters'),
  content: z
    .string()
    .min(50, 'Content must be at least 50 characters')
    .max(10000, 'Content must be less than 10,000 characters'),
  category: z.string().min(1, 'Please select a category'),
  expertise_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  estimated_read_time: z.number().min(1).max(60).optional(),
  tags: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const tagArray = val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      return tagArray.length <= 10 && tagArray.every(tag => tag.length >= 2 && tag.length <= 50);
    }, 'Tags must be comma-separated, each 2-50 characters, max 10 tags'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

const categories = [
  // Technology & Programming
  { id: 'web-development', name: 'Web Development', icon: '💻' },
  { id: 'mobile-development', name: 'Mobile Development', icon: '📱' },
  { id: 'backend-development', name: 'Backend Development', icon: '🖥️' },
  { id: 'frontend-development', name: 'Frontend Development', icon: '🌐' },
  { id: 'fullstack-development', name: 'Full Stack Development', icon: '⚡' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'csharp', name: 'C# / .NET', icon: '🔵' },
  { id: 'cpp', name: 'C++', icon: '🔧' },
  { id: 'golang', name: 'Go', icon: '🐹' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
  { id: 'php', name: 'PHP', icon: '🐘' },
  { id: 'ruby', name: 'Ruby', icon: '💎' },

  // Data & AI
  { id: 'data-science', name: 'Data Science', icon: '📊' },
  { id: 'machine-learning', name: 'Machine Learning', icon: '🤖' },
  { id: 'artificial-intelligence', name: 'Artificial Intelligence', icon: '🧠' },
  { id: 'deep-learning', name: 'Deep Learning', icon: '🎯' },
  { id: 'data-analysis', name: 'Data Analysis', icon: '📈' },
  { id: 'big-data', name: 'Big Data', icon: '📊' },
  { id: 'data-engineering', name: 'Data Engineering', icon: '🔧' },

  // DevOps & Infrastructure
  { id: 'devops', name: 'DevOps', icon: '⚙️' },
  { id: 'docker', name: 'Docker', icon: '🐳' },
  { id: 'kubernetes', name: 'Kubernetes', icon: '☸️' },
  { id: 'aws', name: 'AWS', icon: '☁️' },
  { id: 'azure', name: 'Azure', icon: '🔷' },
  { id: 'google-cloud', name: 'Google Cloud', icon: '🌐' },
  { id: 'linux', name: 'Linux', icon: '🐧' },
  { id: 'system-administration', name: 'System Administration', icon: '🖥️' },

  // Design & UX
  { id: 'design', name: 'Design', icon: '🎨' },
  { id: 'ui-ux', name: 'UI/UX Design', icon: '🎯' },
  { id: 'graphic-design', name: 'Graphic Design', icon: '✏️' },
  { id: 'product-design', name: 'Product Design', icon: '📱' },
  { id: 'web-design', name: 'Web Design', icon: '🌐' },

  // Business & Entrepreneurship
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', icon: '🚀' },
  { id: 'startup', name: 'Startup', icon: '💡' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'sales', name: 'Sales', icon: '💰' },
  { id: 'finance', name: 'Finance', icon: '💵' },
  { id: 'management', name: 'Management', icon: '👔' },

  // Science & Research
  { id: 'computer-science', name: 'Computer Science', icon: '🧪' },
  { id: 'mathematics', name: 'Mathematics', icon: '🔢' },
  { id: 'physics', name: 'Physics', icon: '⚛️' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧬' },
  { id: 'biology', name: 'Biology', icon: '🧬' },
  { id: 'research', name: 'Research', icon: '🔬' },

  // Other Technologies
  { id: 'blockchain', name: 'Blockchain', icon: '⛓️' },
  { id: 'cryptocurrency', name: 'Cryptocurrency', icon: '₿' },
  { id: 'iot', name: 'Internet of Things', icon: '📡' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒' },
  { id: 'game-development', name: 'Game Development', icon: '🎮' },
  { id: 'databases', name: 'Databases', icon: '🗄️' },
  { id: 'api-development', name: 'API Development', icon: '🔌' },
  { id: 'testing', name: 'Testing & QA', icon: '🧪' },

  // Soft Skills & Learning
  { id: 'career-development', name: 'Career Development', icon: '📈' },
  { id: 'learning', name: 'Learning & Education', icon: '📚' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
  { id: 'leadership', name: 'Leadership', icon: '👑' },
  { id: 'communication', name: 'Communication', icon: '💬' },

  // Other
  { id: 'other', name: 'Other', icon: '📝' },
];

const expertiseLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to the topic, basic concepts', color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience, practical knowledge', color: 'bg-blue-100 text-blue-700' },
  { value: 'advanced', label: 'Advanced', description: 'Deep understanding, complex scenarios', color: 'bg-purple-100 text-purple-700' },
  { value: 'expert', label: 'Expert', description: 'Master level, cutting-edge knowledge', color: 'bg-orange-100 text-orange-700' },
];

export const CreatePostPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      category: '',
      expertise_level: undefined,
      tags: '',
    }
  });

  const tagsValue = watch('tags', '');
  const selectedCategory = watch('category');
  const selectedLevel = watch('expertise_level');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
        // In a real app, you'd upload to a server and get back a URL
        // For now, we'll just store the data URL
        // setValue('thumbnail_url', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      setLoading(true);
      setError(null);

      const tagsArray = data.tags
        ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const postData = {
        title: data.title,
        content: data.content,
        tags: tagsArray,
        category: data.category,
        expertise_level: data.expertise_level,
        estimated_read_time: data.estimated_read_time,
      };

      console.log('Sending post data:', postData);
      await apiService.createPost(postData);
      navigate('/');
    } catch (error: any) {
      console.error('Post creation error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to create post. Please try again.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const tagPreview = tagsValue
    ? tagsValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
            <FileText className="w-4 h-4 mr-2" />
            Share Knowledge
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary-900 mb-2">Share Your Expertise</h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Create valuable content that helps others learn and grow. Quality posts earn more points and recognition.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Post Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Share Your Knowledge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Post Title"
                placeholder="e.g., Complete Guide to React Hooks: From Basics to Advanced Patterns"
                error={errors.title?.message}
                {...register('title')}
                fullWidth
                required
                helperText="Clear, descriptive titles attract more readers"
              />

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Category *
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setValue('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200 ${
                      errors.category ? 'border-danger-500' : 'border-secondary-300'
                    } bg-white`}>
                    <option value="">Select a category...</option>
                    {/* Technology & Programming */}
                    <optgroup label="💻 Technology & Programming">
                      {categories.filter(cat => ['web-development', 'mobile-development', 'backend-development', 'frontend-development', 'fullstack-development', 'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'golang', 'rust', 'php', 'ruby'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* Data & AI */}
                    <optgroup label="📊 Data & AI">
                      {categories.filter(cat => ['data-science', 'machine-learning', 'artificial-intelligence', 'deep-learning', 'data-analysis', 'big-data', 'data-engineering'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* DevOps & Infrastructure */}
                    <optgroup label="⚙️ DevOps & Infrastructure">
                      {categories.filter(cat => ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'google-cloud', 'linux', 'system-administration'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* Design & UX */}
                    <optgroup label="🎨 Design & UX">
                      {categories.filter(cat => ['design', 'ui-ux', 'graphic-design', 'product-design', 'web-design'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* Business & Entrepreneurship */}
                    <optgroup label="💼 Business & Entrepreneurship">
                      {categories.filter(cat => ['business', 'entrepreneurship', 'startup', 'marketing', 'sales', 'finance', 'management'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* Science & Research */}
                    <optgroup label="🧪 Science & Research">
                      {categories.filter(cat => ['computer-science', 'mathematics', 'physics', 'chemistry', 'biology', 'research'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* Other Technologies */}
                    <optgroup label="🔧 Other Technologies">
                      {categories.filter(cat => ['blockchain', 'cryptocurrency', 'iot', 'cybersecurity', 'game-development', 'databases', 'api-development', 'testing'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* Soft Skills & Learning */}
                    <optgroup label="📚 Soft Skills & Learning">
                      {categories.filter(cat => ['career-development', 'learning', 'productivity', 'leadership', 'communication'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                    {/* Other */}
                    <optgroup label="📝 Other">
                      {categories.filter(cat => ['other'].includes(cat.id)).map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {selectedCategory && (
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-lg">
                        {categories.find(cat => cat.id === selectedCategory)?.icon}
                      </span>
                      <span className="text-sm text-secondary-600">
                        Selected: {categories.find(cat => cat.id === selectedCategory)?.name}
                      </span>
                    </div>
                  )}
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
                )}
              </div>

              {/* Expertise Level */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Expertise Level *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {expertiseLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setValue('expertise_level', level.value as any)}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                        selectedLevel === level.value
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-secondary-200 hover:border-primary-300 hover:shadow-sm'
                      }`}>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${level.color}`}>
                        {level.label}
                      </div>
                      <p className="text-sm text-secondary-700">{level.description}</p>
                    </button>
                  ))}
                </div>
                {errors.expertise_level && (
                  <p className="mt-1 text-sm text-danger-600">{errors.expertise_level.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Estimated Read Time (minutes)"
                  type="number"
                  placeholder="e.g., 15"
                  min="1"
                  max="60"
                  {...register('estimated_read_time', { valueAsNumber: true })}
                  fullWidth
                  helperText="Help readers plan their time"
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Tags (Optional)
                  </label>
                  <Input
                    placeholder="javascript, react, tutorial, hooks"
                    error={errors.tags?.message}
                    {...register('tags')}
                    fullWidth
                    helperText="Comma-separated keywords"
                  />
                  {tagPreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tagPreview.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Thumbnail Image (Optional)
                </label>
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  {thumbnailPreview ? (
                    <div className="space-y-4">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="max-w-full h-32 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon className="w-8 h-8 text-secondary-400" />
                      </div>
                      <div>
                        <p className="text-sm text-secondary-600 mb-2">
                          Upload a thumbnail to make your post more attractive
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="mt-2 text-xs text-secondary-500">
                  Recommended: 1200x630px, max 5MB
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Post Content *
                </label>
                <textarea
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-vertical min-h-[300px] text-secondary-900 placeholder-secondary-400 ${
                    errors.content ? 'border-danger-500' : 'border-secondary-300'
                  }`}
                  placeholder="Write comprehensive, valuable content here. Include:

• Clear introduction and overview
• Step-by-step explanations
• Code examples (if applicable)
• Best practices and tips
• Common pitfalls to avoid
• Resources for further learning

Remember: Quality over quantity - focus on being helpful and accurate."
                  {...register('content')}
                  required
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-danger-600">{errors.content.message}</p>
                )}
                <p className="mt-2 text-xs text-secondary-500">
                  Minimum 50 characters. Use markdown for formatting if needed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-secondary-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              size="lg"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="px-8"
            >
              <Save className="w-5 h-5 mr-2" />
              Publish Post
            </Button>
          </div>
        </form>

        {/* Guidelines */}
        <Card className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Award className="w-6 h-6 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-primary-900">Quality Guidelines</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-primary-900 mb-2">✅ What We Love</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>• Comprehensive, accurate information</li>
                  <li>• Clear explanations with examples</li>
                  <li>• Original insights and experiences</li>
                  <li>• Well-structured, scannable content</li>
                  <li>• Proper categorization and tagging</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-primary-900 mb-2">❌ What We Avoid</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  <li>• Plagiarized or copied content</li>
                  <li>• Spam or promotional posts</li>
                  <li>• Inaccurate information</li>
                  <li>• Poor grammar and formatting</li>
                  <li>• Off-topic or inappropriate content</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>💡 Pro Tip:</strong> Quality posts earn 10-50 points and can become featured content.
                High-quality contributions get more visibility and help you build credibility in the community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};