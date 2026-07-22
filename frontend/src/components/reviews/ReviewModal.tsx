import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'contract' | 'job' | 'gig';
  contractId?: number;
  jobId?: number;
  gigId?: number;
  revieweeId?: number;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  type,
  contractId,
  jobId,
  gigId,
  revieweeId,
  onSuccess
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.length < 10) {
      toast.error('Comment must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);

      if (type === 'contract' && contractId) {
        await apiService.createContractReview(contractId, rating, comment);
      } else if (type === 'job' && jobId && revieweeId) {
        await apiService.createJobReview(jobId, revieweeId, rating, comment);
      } else if (type === 'gig' && gigId && revieweeId) {
        await apiService.createGigReview(gigId, revieweeId, rating, comment);
      }

      toast.success('Review submitted successfully');
      setRating(0);
      setComment('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Rating
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-secondary-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Share your experience..."
            minLength={10}
            maxLength={1000}
          />
          <p className="text-sm text-secondary-500 mt-1">
            {comment.length}/1000 characters
          </p>
        </div>

        <div className="flex space-x-4">
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0 || comment.length < 10}
            className="flex-1"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
