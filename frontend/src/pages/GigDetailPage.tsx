import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Star,
  Clock,
  RefreshCw,
  Check,
  User,
  MapPin,
  Briefcase,
  Award,
  MessageSquare,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Mail,
  Zap,
  Package,
  Shield,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import type { Gig } from '../types';

export const GigDetailPage: React.FC = () => {
  const { gigId } = useParams<{ gigId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [moreGigs, setMoreGigs] = useState<Gig[]>([]);

  useEffect(() => {
    loadGig();
  }, [gigId]);

  const loadGig = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGig(Number(gigId));
      setGig(response);

      // Load more gigs from the same seller
      if (response.freelancer?.id) {
        try {
          const gigsResponse = await apiService.getGigs({
            freelancer_id: response.freelancer.id,
            page: 1,
            limit: 4
          });
          // Filter out current gig
          const otherGigs = gigsResponse.gigs.filter((g: Gig) => g.id !== response.id);
          setMoreGigs(otherGigs.slice(0, 3));
        } catch (err) {
          console.error('Failed to load more gigs:', err);
        }
      }
    } catch (error) {
      console.error('Failed to load gig:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    return `${baseURL}${url}`;
  };

  const handleSendOffer = async () => {
    if (!offerAmount || !offerMessage) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // In a real app, you'd have an API endpoint for sending offers
      alert('Offer sent successfully!');
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferMessage('');
    } catch (error) {
      console.error('Failed to send offer:', error);
      alert('Failed to send offer');
    }
  };

  const handleContact = () => {
    if (gig?.freelancer?.id && gig?.freelancer?.username) {
      navigate(`/messages?recipient=${gig.freelancer.id}&gig_id=${gig.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gig not found</h3>
            <p className="text-gray-600 mb-6">This service may have been removed or is no longer available.</p>
            <Button onClick={() => navigate('/browse-gigs')}>
              Browse Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = gig.images && gig.images.length > 0 ? gig.images : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-green-50 hover:text-green-600 hover:border-green-600 transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden shadow-xl border-0">
              <CardContent className="p-0">
                {images.length > 0 ? (
                  <div className="relative group">
                    <div className="aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={getImageUrl(images[currentImageIndex])}
                        alt={gig.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-2xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-900" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-2xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-900" />
                        </button>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`h-2 rounded-full transition-all ${
                                idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/60 w-2 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center">
                    <Briefcase className="w-24 h-24 text-white/30" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Title & Quick Stats */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {gig.title}
                  </h1>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                  <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1 text-sm font-medium">
                    {gig.category}
                  </Badge>
                </div>

                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200">
                  {gig.rating && gig.rating > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-gray-900">{gig.rating.toFixed(1)}</span>
                      <span className="text-gray-600 text-sm">({gig.total_reviews || 0})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                    <Package className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">{gig.total_orders || 0}</span>
                    <span className="text-gray-600 text-sm">orders</span>
                  </div>
                  {gig.freelancer?.username && (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900 text-sm font-medium">Top Rated Seller</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-green-600" />
                    About This Gig
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {gig.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {gig.features && gig.features.length > 0 && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-white">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-green-600" />
                    What You'll Get
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gig.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-900 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {gig.requirements && gig.requirements.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Requirements From You
                  </h2>
                  <ul className="space-y-3">
                    {gig.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700 text-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2.5" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {gig.tags && gig.tags.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {gig.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-20 shadow-2xl border-0 overflow-hidden">
              {/* Accent Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-1">
                <div className="bg-white rounded-t-lg"></div>
              </div>
              
              <CardContent className="p-6 sm:p-8">
                {/* Price */}
                <div className="text-center mb-8 pb-6 border-b-2 border-gray-100">
                  <div className="inline-flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">
                      ETB {gig.price ? parseFloat(gig.price.toString()).toLocaleString() : '0'}
                    </span>
                  </div>
                  <p className="text-base text-gray-600 font-medium">
                    {gig.pricing_type === 'fixed' ? '✓ Fixed Price Package' : '⏱ Per Hour Rate'}
                  </p>
                </div>

                {/* Package Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Delivery Time</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">
                      {gig.delivery_time || 0} {gig.delivery_time === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Revisions</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">
                      {gig.revisions === 0 || !gig.revisions ? 'None' : gig.revisions}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                {user?.role === 'client' && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowOfferModal(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                    >
                      <DollarSign className="w-6 h-6 mr-2" />
                      Send Custom Offer
                    </Button>
                    <Button
                      onClick={handleContact}
                      variant="outline"
                      className="w-full py-6 text-lg font-semibold border-2 hover:bg-gray-50 hover:border-green-600 hover:text-green-600 transition-all"
                      disabled={!gig?.freelancer?.username}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Contact Seller
                    </Button>
                    <div className="flex items-center justify-center gap-2 pt-2 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Secure payment guaranteed</span>
                    </div>
                  </div>
                )}

                {!user && (
                  <div className="text-center">
                    <div className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-sm text-gray-700 font-medium">
                        🔒 Please log in to hire this freelancer
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-6 text-lg font-bold"
                    >
                      Log In to Continue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Freelancer Card */}
            <Card className="shadow-2xl border-0">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-green-600" />
                  About the Seller
                </h3>
                
                {gig.freelancer?.username ? (
                  <Link to={`/users/${gig.freelancer.username}`} className="block mb-6 group">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl hover:shadow-lg transition-all">
                      {gig.freelancer?.avatar_url ? (
                        <img
                          src={gig.freelancer.avatar_url}
                          alt={gig.freelancer.username}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-green-500 group-hover:ring-green-600 transition-all"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-green-500 group-hover:ring-green-600 transition-all">
                          <User className="w-10 h-10 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-1">
                          {gig.freelancer.username}
                        </h4>
                        {gig.freelancer?.title && (
                          <p className="text-sm text-gray-600 font-medium line-clamp-2">{gig.freelancer.title}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="block mb-6">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          Freelancer
                        </h4>
                        {gig.freelancer?.title && (
                          <p className="text-sm text-gray-600 font-medium line-clamp-2">{gig.freelancer.title}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Seller Stats */}
                {gig.freelancer && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl">
                      <div className="text-2xl font-black text-green-600">{gig.freelancer.total_gigs || 0}</div>
                      <div className="text-xs text-gray-700 font-semibold mt-1">Active Gigs</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl">
                      <div className="text-2xl font-black text-blue-600">{gig.freelancer.total_orders || 0}</div>
                      <div className="text-xs text-gray-700 font-semibold mt-1">Completed</div>
                    </div>
                  </div>
                )}

                {gig.freelancer?.bio && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                      {gig.freelancer.bio}
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {gig.freelancer?.location && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="truncate font-medium">{gig.freelancer.location}</span>
                    </div>
                  )}
                  {gig.freelancer?.member_since && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium">Member since {new Date(gig.freelancer.member_since).getFullYear()}</span>
                    </div>
                  )}
                </div>

                {gig.freelancer?.skills && gig.freelancer.skills.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {gig.freelancer.skills.slice(0, 4).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="px-3 py-1.5 text-xs font-medium bg-white">
                          {skill}
                        </Badge>
                      ))}
                      {gig.freelancer.skills.length > 4 && (
                        <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border-green-200">
                          +{gig.freelancer.skills.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {gig.freelancer?.username && (
                  <Link to={`/users/${gig.freelancer.username}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full py-6 text-base font-bold border-2 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-500 hover:text-white hover:border-green-600 transition-all transform hover:scale-[1.02]"
                    >
                      <User className="w-5 h-5 mr-2" />
                      View Full Profile
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* More from this seller */}
        {moreGigs.length > 0 && gig?.freelancer?.username && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  More Services by {gig.freelancer.username}
                </h2>
                <p className="text-gray-600">Explore other high-quality services from this seller</p>
              </div>
              <Link to={`/users/${gig.freelancer.username}/gigs`}>
                <Button variant="outline" size="lg" className="border-2 hover:border-green-600 hover:text-green-600">
                  View All →
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreGigs.map((relatedGig) => (
                <Link key={relatedGig.id} to={`/marketplace/gigs/${relatedGig.id}`}>
                  <Card className="hover:shadow-2xl transition-all duration-500 h-full group border-0 overflow-hidden transform hover:-translate-y-1">
                    <CardContent className="p-0">
                      {/* Gig Image */}
                      <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 overflow-hidden relative">
                        {relatedGig.images && relatedGig.images.length > 0 ? (
                          <img
                            src={getImageUrl(relatedGig.images[0])}
                            alt={relatedGig.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Briefcase className="w-16 h-16 text-green-400 group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        {relatedGig.rating && relatedGig.rating > 0 && (
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-900">
                              {relatedGig.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Gig Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-3 line-clamp-2 text-lg leading-tight">
                          {relatedGig.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <span className="text-sm text-gray-600 font-medium">Starting at</span>
                          <span className="text-xl font-black text-gray-900">
                            ETB {relatedGig.price ? parseFloat(relatedGig.price.toString()).toLocaleString() : '0'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Send Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0 animate-in slide-in-from-bottom duration-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    Send Custom Offer
                  </h2>
                  <p className="text-gray-600 mt-1">Make a custom offer to the freelancer</p>
                </div>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-500 rotate-90" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Gig Preview */}
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-2xl border-2 border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-600" />
                    Service Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-900 font-medium">
                      {gig.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-700">
                        <strong>Base Price:</strong> ETB {gig.price ? parseFloat(gig.price.toString()).toLocaleString() : '0'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700">
                        <strong>Delivery:</strong> {gig.delivery_time || 0} {gig.delivery_time === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offer Amount */}
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">
                    Your Offer Amount (ETB) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                      ETB
                    </div>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    💡 Tip: Consider the base price and project complexity
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-base font-bold text-gray-900 mb-3">
                    Project Details & Requirements *
                  </label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Describe your project in detail:&#10;&#10;• What do you need?&#10;• What are your expectations?&#10;• Any specific requirements?&#10;• Timeline and milestones"
                    rows={8}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all text-base"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">
                      Be as detailed as possible for the best results
                    </p>
                    <span className="text-sm text-gray-500">
                      {offerMessage.length} characters
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleSendOffer}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Send Offer
                  </Button>
                  <Button
                    onClick={() => setShowOfferModal(false)}
                    variant="outline"
                    className="px-8 py-6 text-lg font-semibold border-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
