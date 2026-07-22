import React, { useState, useEffect } from 'react';
import { X, DollarSign, Clock, Calendar, FileText, Briefcase, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';
import { apiService } from '../../services/api';

interface Job {
  id: number;
  title: string;
  job_type: 'fixed' | 'hourly';
  fixed_price?: number;
  budget_min?: number;
  budget_max?: number;
  description?: string;
  duration?: string;
  experience_level?: string;
}

interface JobApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cover_letter: '',
    proposed_rate: '',
    proposed_hours: '',
    estimated_completion: '',
    availability: '',
    portfolio_links: '',
    relevant_experience: '',
    questions_for_client: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cover_letter.trim()) {
      newErrors.cover_letter = 'Cover letter is required';
    } else if (formData.cover_letter.length < 50) {
      newErrors.cover_letter = 'Cover letter must be at least 50 characters';
    }

    if (job.job_type === 'hourly' && !formData.proposed_rate) {
      newErrors.proposed_rate = 'Proposed rate is required for hourly jobs';
    } else if (formData.proposed_rate) {
      const rate = parseFloat(formData.proposed_rate);
      if (isNaN(rate) || rate <= 0) {
        newErrors.proposed_rate = 'Please enter a valid rate';
      }
    }

    if (!formData.availability) {
      newErrors.availability = 'Please specify your availability';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      const applicationData: any = {
        job_id: job.id,
        cover_letter: formData.cover_letter
      };

      if (job.job_type === 'hourly') {
        applicationData.proposed_rate = parseFloat(formData.proposed_rate);
        if (formData.proposed_hours) {
          applicationData.proposed_hours = parseInt(formData.proposed_hours);
        }
      } else if (formData.proposed_rate) {
        applicationData.proposed_rate = parseFloat(formData.proposed_rate);
      }

      if (formData.estimated_completion) {
        applicationData.estimated_completion = formData.estimated_completion;
      }

      // Add additional fields to cover letter for now
      let fullCoverLetter = formData.cover_letter;
      if (formData.relevant_experience) {
        fullCoverLetter += `\n\nRelevant Experience:\n${formData.relevant_experience}`;
      }
      if (formData.portfolio_links) {
        fullCoverLetter += `\n\nPortfolio/Work Samples:\n${formData.portfolio_links}`;
      }
      if (formData.availability) {
        fullCoverLetter += `\n\nAvailability: ${formData.availability}`;
      }
      if (formData.questions_for_client) {
        fullCoverLetter += `\n\nQuestions for Client:\n${formData.questions_for_client}`;
      }
      applicationData.cover_letter = fullCoverLetter;

      await apiService.applyForJob(applicationData);
      showToast('Application submitted successfully!', 'success');
      onSuccess();
      onClose();
      setFormData({
        cover_letter: '',
        proposed_rate: '',
        proposed_hours: '',
        estimated_completion: '',
        availability: '',
        portfolio_links: '',
        relevant_experience: '',
        questions_for_client: ''
      });
      setErrors({});
    } catch (error: any) {
      console.error('Error applying for job:', error);
      showToast(
        error.response?.data?.error || 'Failed to submit application',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setErrors({});
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Slide-in Panel from Right */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] lg:w-[700px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Submit a Proposal</h2>
                <p className="text-sm text-gray-500">Complete all required fields</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Job Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">{job.title}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">
                    {job.job_type === 'fixed' 
                      ? `ETB ${job.fixed_price || 'N/A'} Fixed`
                      : `ETB ${job.budget_min || 'N/A'} - ${job.budget_max || 'N/A'}/hr`
                    }
                  </span>
                </div>
                {job.duration && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="capitalize">{job.duration} term</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Terms */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <DollarSign className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900 text-lg">Terms</h3>
                </div>

                {job.job_type === 'hourly' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Hourly Rate <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs">ETB</span>
                        <Input
                          type="number"
                          step="0.01"
                          min={job.budget_min || 0}
                          max={job.budget_max || 1000}
                          value={formData.proposed_rate}
                          onChange={(e) => setFormData({ ...formData, proposed_rate: e.target.value })}
                          className={`pl-12 ${errors.proposed_rate ? 'border-red-500' : ''}`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.proposed_rate && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.proposed_rate}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Client's budget: ETB {job.budget_min || 0} - {job.budget_max || 0}/hr
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Estimated Hours
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.proposed_hours}
                        onChange={(e) => setFormData({ ...formData, proposed_hours: e.target.value })}
                        placeholder="e.g., 40"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        How many hours do you estimate this project will take?
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Bid Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs">ETB</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.proposed_rate}
                        onChange={(e) => setFormData({ ...formData, proposed_rate: e.target.value })}
                        className={`pl-12 ${errors.proposed_rate ? 'border-red-500' : ''}`}
                        placeholder={`${job.fixed_price || '0.00'}`}
                      />
                    </div>
                    {errors.proposed_rate && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.proposed_rate}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Client's budget: ETB {job.fixed_price || 'N/A'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Project Duration
                  </label>
                  <Input
                    type="date"
                    value={formData.estimated_completion}
                    onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When can you complete this project?
                  </p>
                </div>
              </div>

              {/* Section 2: Cover Letter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900 text-lg">Cover Letter</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Why are you the best fit? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.cover_letter}
                    onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    rows={8}
                    maxLength={2000}
                    className={`w-full px-4 py-3 border ${errors.cover_letter ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm`}
                    placeholder="Introduce yourself and explain why you're the perfect fit for this job. Include relevant experience, skills, and what makes you stand out..."
                  />
                  {errors.cover_letter && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.cover_letter}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                      Minimum 50 characters
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.cover_letter.length}/2000
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Briefcase className="w-5 h-5 text-gray-700" />
                  <h3 className="font-bold text-gray-900 text-lg">Additional Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Relevant Experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.relevant_experience}
                    onChange={(e) => setFormData({ ...formData, relevant_experience: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                    placeholder="Describe your relevant experience for this project. Include similar projects you've completed, technologies you've worked with, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Portfolio Links / Work Samples
                  </label>
                  <textarea
                    value={formData.portfolio_links}
                    onChange={(e) => setFormData({ ...formData, portfolio_links: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                    placeholder="Add links to your portfolio, GitHub, previous work samples, or any relevant projects (one per line)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className={`w-full px-4 py-3 border ${errors.availability ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm`}
                  >
                    <option value="">Select your availability</option>
                    <option value="full-time">Full-time (40+ hours/week)</option>
                    <option value="part-time">Part-time (20-40 hours/week)</option>
                    <option value="flexible">Flexible (10-20 hours/week)</option>
                    <option value="weekends">Weekends only</option>
                    <option value="as-needed">As needed</option>
                  </select>
                  {errors.availability && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.availability}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Questions for the Client
                  </label>
                  <textarea
                    value={formData.questions_for_client}
                    onChange={(e) => setFormData({ ...formData, questions_for_client: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                    placeholder="Do you have any questions about the project requirements, timeline, or expectations?"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 !bg-green-600 hover:!bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Proposal'
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
