import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Star, Clock, DollarSign, User, Heart } from 'lucide-react';
import type { Gig } from '../../types';

interface GigCardProps {
  gig: Gig;
  onContact?: (gigId: number, freelancerId: number) => void;
}

export const GigCard: React.FC<GigCardProps> = ({ gig, onContact }) => {
  // Get base URL for images
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Relative URL from server
    const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    return `${baseURL}${url}`;
  };

  const formatPrice = () => {
    if (gig.pricing_type === 'fixed') {
      return `ETB ${parseFloat(gig.price.toString()).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return `ETB ${parseFloat(gig.price.toString()).toFixed(2)}/hr`;
  };

  const formatDeliveryTime = () => {
    if (gig.delivery_time === 1) {
      return '1 day';
    }
    return `${gig.delivery_time} days`;
  };

  // Calculate level based on total_orders or rating
  const getLevel = () => {
    if (gig.total_orders >= 100) return { level: 3, label: 'Level 3' };
    if (gig.total_orders >= 50) return { level: 2, label: 'Level 2' };
    if (gig.total_orders >= 10) return { level: 1, label: 'Level 1' };
    return null;
  };

  const level = getLevel();

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-gray-200 hover:border-green-400 bg-white overflow-hidden cursor-pointer rounded-xl">
      <CardContent className="p-0 flex flex-col flex-1">
        {/* Gig Image/Thumbnail - Fiverr Style */}
        <Link to={`/marketplace/gigs/${gig.id}`} className="relative block">
          {gig.images && gig.images.length > 0 && !gig.images[0].startsWith('blob:') ? (
            <div className="w-full h-64 overflow-hidden bg-gray-100 relative">
              <img
                src={getImageUrl(gig.images[0])}
                alt={gig.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <svg class="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                    `;
                  }
                }}
              />
              {/* Heart Icon - Fiverr Style */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Implement favorite functionality
                }}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Save gig"
              >
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-green-100 via-green-50 to-green-200 flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 bg-white/50 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-xs text-green-600 font-medium">Service</p>
              </div>
              {/* Heart Icon */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Save gig"
              >
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          {/* Freelancer Info - Below Image */}
          <div className="flex items-center gap-3 mb-4">
            {gig.freelancer?.avatar_url ? (
              <img
                src={gig.freelancer.avatar_url}
                alt={gig.freelancer.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link
                to={`/users/${gig.freelancer?.username || ''}`}
                onClick={(e) => e.stopPropagation()}
                className="text-base font-semibold text-gray-900 hover:text-green-600 truncate block"
              >
                {gig.freelancer?.username || 'Freelancer'}
              </Link>
            </div>
            {level && (
              <div className="flex items-center gap-0.5 px-2 py-1 bg-yellow-100 rounded border border-yellow-300">
                {[...Array(level.level)].map((_, i) => (
                  <span key={i} className="text-yellow-600 text-xs">◆</span>
                ))}
                <span className="text-xs font-semibold text-yellow-700 ml-1">{level.label}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/marketplace/gigs/${gig.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-green-600 mb-3 line-clamp-2 transition-colors min-h-[3.5rem] leading-snug"
          >
            {gig.title}
          </Link>

          {/* Rating and Reviews */}
          {gig.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-base font-bold text-gray-900">{gig.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-600">
                ({gig.total_reviews || 0} reviews)
              </span>
            </div>
          )}

          {/* Description - Truncated */}
          <p className="text-base text-gray-600 mb-5 line-clamp-3 flex-shrink-0 leading-relaxed">
            {gig.description}
          </p>

          {/* Footer - Price and Delivery */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500 font-medium mb-1 block">Starting at</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{formatPrice()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatDeliveryTime()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
