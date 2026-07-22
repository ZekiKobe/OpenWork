import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, DollarSign, User, Calendar, TrendingUp, Star, MapPin } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  job_type: 'fixed' | 'hourly';
  budget_min?: number;
  budget_max?: number;
  fixed_price?: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  duration: 'short' | 'medium' | 'long';
  status: string;
  deadline?: string;
  created_at: string;
  client: {
    id: number;
    username: string;
    avatar_url?: string;
    total_points: number;
    rating?: number;
  };
  tags: string[];
  total_applications: number;
}

interface JobCardProps {
  job: Job;
  onApply?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const formatBudget = () => {
    if (job.job_type === 'fixed' && job.fixed_price) {
      const price = typeof job.fixed_price === 'string' ? parseFloat(job.fixed_price) : job.fixed_price;
      return `ETB ${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (job.job_type === 'hourly' && job.budget_min && job.budget_max) {
      const min = typeof job.budget_min === 'string' ? parseFloat(job.budget_min) : job.budget_min;
      const max = typeof job.budget_max === 'string' ? parseFloat(job.budget_max) : job.budget_max;
      return `ETB ${min.toFixed(0)} - ${max.toFixed(0)}/hr`;
    }
    return 'Budget not specified';
  };

  const formatDuration = () => {
    const durationMap = {
      short: '1-2 weeks',
      medium: '1-3 months',
      long: '3+ months'
    };
    return durationMap[job.duration] || job.duration;
  };

  const formatExperienceLevel = () => {
    const levelMap = {
      entry: 'Entry Level',
      intermediate: 'Intermediate',
      expert: 'Expert'
    };
    return levelMap[job.experience_level] || job.experience_level;
  };

  const getExperienceColor = () => {
    const colorMap = {
      entry: 'bg-blue-100 text-blue-700 border-blue-200',
      intermediate: 'bg-purple-100 text-purple-700 border-purple-200',
      expert: 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colorMap[job.experience_level] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getDaysAgo = () => {
    const created = new Date(job.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-green-400 bg-white">
      <CardContent className="p-5">
        {/* Horizontal Layout */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Left Side - Main Content */}
          <div className="flex-1 min-w-0">
            {/* Experience Level Badge */}
            <div className="mb-3">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${getExperienceColor()}`}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{formatExperienceLevel()}</span>
              </div>
            </div>

            {/* Title */}
            <Link
              to={`/jobs/${job.id}`}
              className="text-lg font-bold text-gray-900 hover:text-green-600 mb-2 block transition-colors group-hover:text-green-600"
            >
              {job.title}
            </Link>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {job.description}
            </p>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {job.tags.slice(0, 5).map((tag, index) => (
                  <span 
                    key={index} 
                    className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 5 && (
                  <span className="text-xs text-gray-500 px-2 py-1">+{job.tags.length - 5}</span>
                )}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration()}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span>{getDaysAgo()}</span>
              <span className="text-gray-300">•</span>
              <span className="font-medium">
                {job.total_applications} {job.total_applications === 1 ? 'proposal' : 'proposals'}
              </span>
            </div>
          </div>

          {/* Right Side - Budget and Action */}
          <div className="lg:w-64 flex-shrink-0 flex flex-col items-start lg:items-end gap-3">
            {/* Budget */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">{formatBudget()}</span>
                {job.job_type === 'fixed' && (
                  <span className="text-xs text-gray-500">Fixed Price</span>
                )}
              </div>
            </div>

            {/* Deadline */}
            {job.deadline && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due {new Date(job.deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
              </div>
            )}

            {/* Apply Button */}
            {onApply && (
              <button
                onClick={() => onApply(job)}
                className="w-full lg:w-auto px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
