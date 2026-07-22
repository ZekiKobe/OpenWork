import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  GraduationCap,
  Star,
  User,
  MapPin,
  Briefcase,
  Award,
  MessageSquare,
  Search
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Mentor {
  id: number;
  username: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  location?: string;
  expertise_areas?: string[];
  years_of_experience?: number;
  rating?: number;
  total_reviews?: number;
  hourly_rate?: number;
  is_available: boolean;
}

export const MentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all');

  const expertiseAreas = [
    'All',
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Marketing',
    'Business',
    'Writing'
  ];

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      // For now, we'll show a placeholder
      // In a real app, you'd have a dedicated mentors endpoint
      setMentors([]);
    } catch (error) {
      console.error('Failed to load mentors:', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = !searchQuery || 
      mentor.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesExpertise = selectedExpertise === 'all' || 
      mentor.expertise_areas?.some(area => 
        area.toLowerCase().includes(selectedExpertise.toLowerCase())
      );

    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find a Mentor</h1>
              <p className="text-gray-600">Connect with experienced professionals to guide your career</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentors by name, skills, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Expertise Filter */}
          <div className="flex flex-wrap gap-2">
            {expertiseAreas.map((expertise) => (
              <button
                key={expertise}
                onClick={() => setSelectedExpertise(expertise === 'All' ? 'all' : expertise)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  (expertise === 'All' && selectedExpertise === 'all') || 
                  (expertise !== 'All' && selectedExpertise === expertise)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {expertise}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredMentors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No mentors found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedExpertise('all'); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  {/* Mentor Header */}
                  <div className="text-center mb-4">
                    <Link to={`/users/${mentor.username}`}>
                      {mentor.avatar_url ? (
                        <img
                          src={mentor.avatar_url}
                          alt={mentor.username}
                          className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-purple-100"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </Link>
                    <Link to={`/users/${mentor.username}`}>
                      <h3 className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors">
                        {mentor.username}
                      </h3>
                    </Link>
                    {mentor.title && (
                      <p className="text-sm text-gray-600 mb-2">{mentor.title}</p>
                    )}
                    {mentor.rating && mentor.rating > 0 && (
                      <div className="flex items-center justify-center space-x-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
                        {mentor.total_reviews && (
                          <span className="text-gray-500">({mentor.total_reviews})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mentor Info */}
                  <div className="space-y-3 mb-4">
                    {mentor.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{mentor.location}</span>
                      </div>
                    )}
                    {mentor.years_of_experience && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{mentor.years_of_experience}+ years experience</span>
                      </div>
                    )}
                    {mentor.hourly_rate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>ETB {mentor.hourly_rate}/hour</span>
                      </div>
                    )}
                  </div>

                  {/* Expertise Areas */}
                  {mentor.expertise_areas && mentor.expertise_areas.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise_areas.slice(0, 3).map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                        {mentor.expertise_areas.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{mentor.expertise_areas.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link to={`/users/${mentor.username}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Profile
                      </Button>
                    </Link>
                    <Link to={`/messages?recipient=${mentor.id}`} className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
