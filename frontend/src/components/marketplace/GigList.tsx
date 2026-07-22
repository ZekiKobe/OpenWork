import React from 'react';
import { GigCard } from './GigCard';
import LoadingSpinner from '../common/LoadingSpinner';
import type { Gig } from '../../types';

interface GigListProps {
  gigs: Gig[];
  loading: boolean;
  onContact?: (gigId: number, freelancerId: number) => void;
  emptyMessage?: string;
}

export const GigList: React.FC<GigListProps> = ({
  gigs,
  loading,
  onContact,
  emptyMessage = 'No gigs found. Try adjusting your filters.'
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (gigs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gigs.map((gig) => (
        <GigCard key={gig.id} gig={gig} onContact={onContact} />
      ))}
    </div>
  );
};
