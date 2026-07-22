import React from 'react';
import { JobCard } from './JobCard';
import LoadingSpinner from '../common/LoadingSpinner';

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

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  onApply?: (job: Job) => void;
  emptyMessage?: string;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  onApply,
  emptyMessage = 'No jobs found. Try adjusting your filters.'
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onApply={onApply} />
      ))}
    </div>
  );
};
