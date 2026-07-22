import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Briefcase, 
  Users, 
  DollarSign,
  GraduationCap,
  Award,
  Zap,
  MessageCircle
} from 'lucide-react';

// Types for talent data
interface Talent {
  id: number;
  username: string;
  title: string;
  bio: string;
  avatar_url?: string;
  location: string;
  total_points: number;
  rating: number;
  reviews_count: number;
  skills: string[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  education_level?: string;
  years_of_experience?: number;
  joined_date: string;
  is_online: boolean;
}

const TalentPage: React.FC = () => {
  const { user } = useAuth();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Fetch talents from API
  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getFreelancers({
          page: 1,
          limit: 50,
          skill: selectedSkill !== 'all' ? selectedSkill : undefined,
          experience_level: selectedExperience !== 'all' ? selectedExperience : undefined,
          location: selectedLocation !== 'all' ? selectedLocation : undefined,
          search: searchTerm || undefined,
          sortBy: 'rating',
          sortOrder: 'DESC'
        });
        
        setTalents(response.freelancers);
        setFilteredTalents(response.freelancers);
        setError(null);
      } catch (err) {
        setError('Failed to load talents');
        console.error('Error fetching talents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTalents();
  }, [selectedSkill, selectedExperience, selectedLocation, searchTerm]);

  // Filter and sort talents
  useEffect(() => {
    let filtered = talents.filter(talent => {
      const matchesSearch = talent.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          talent.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSkill = selectedSkill === 'all' || talent.skills.includes(selectedSkill);
      const matchesExperience = selectedExperience === 'all' || talent.experience_level === selectedExperience;
      const matchesLocation = selectedLocation === 'all' || talent.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesSkill && matchesExperience && matchesLocation;
    });

    // Sort talents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime();
        case 'points':
          return b.total_points - a.total_points;
        case 'rate-high':
          return (b.hourly_rate_max || 0) - (a.hourly_rate_max || 0);
        case 'rate-low':
          return (a.hourly_rate_min || 0) - (b.hourly_rate_min || 0);
        default:
          return 0;
      }
    });

    setFilteredTalents(filtered);
  }, [talents, searchTerm, selectedSkill, selectedExperience, selectedLocation, sortBy]);

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getEducationLabel = (level: string) => {
    const labels: Record<string, string> = {
      'high_school': 'High School',
      'associate': 'Associate Degree',
      'bachelor': 'Bachelor\'s Degree',
      'master': 'Master\'s Degree',
      'phd': 'PhD',
      'other': 'Other'
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Find Top Talent</h1>
              <p className="text-secondary-600 mt-1 text-sm sm:text-base">
                Discover skilled professionals ready to work on your projects
              </p>
            </div>
            {user?.role === 'client' && (
              <div className="mt-4 sm:mt-0">
                <Link to="/jobs/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Post a Job
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search talents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Skill */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Skills</label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Skills</option>
                    <option value="React">React</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Node.js">Node.js</option>
                    <option value="UI Design">UI Design</option>
                    <option value="Content Writing">Content Writing</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Experience Level</label>
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Locations</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="newest">Newest Members</option>
                    <option value="points">Most Points</option>
                    <option value="rate-high">Highest Rate</option>
                    <option value="rate-low">Lowest Rate</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Talent List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-secondary-600">{filteredTalents.length} talents found</p>
            </div>

            <div className="space-y-6">
              {filteredTalents.map((talent) => (
                <Card key={talent.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                      {/* Profile Info */}
                      <div className="flex-shrink-0 mb-4 md:mb-0">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-bold">
                              {talent.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {talent.is_online && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-secondary-900 mb-1">
                              <Link to={`/users/${talent.username}`} className="hover:text-blue-600">
                                {talent.username}
                              </Link>
                            </h3>
                            <p className="text-primary-600 font-medium mb-2">{talent.title}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {Array.isArray(talent.skills) ? talent.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="outline" size="sm">
                                  {skill}
                                </Badge>
                              )) : null}
                              {talent.skills && Array.isArray(talent.skills) && talent.skills.length > 3 && (
                                <Badge variant="outline" size="sm">
                                  +{talent.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right mb-4 md:mb-0">
                            <div className="flex items-center space-x-1 mb-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium text-secondary-900">{talent.rating}</span>
                              <span className="text-secondary-600">({talent.reviews_count})</span>
                            </div>
                            {talent.hourly_rate_min && talent.hourly_rate_max && (
                              <div className="text-lg font-bold text-green-600">
                                ${talent.hourly_rate_min}-${talent.hourly_rate_max}/hr
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-secondary-700 mb-4 line-clamp-2">
                          {talent.bio}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-secondary-400" />
                            <span>{talent.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-secondary-400" />
                            <Badge variant="secondary" size="sm" className={getExperienceColor(talent.experience_level)}>
                              {talent.experience_level.charAt(0).toUpperCase() + talent.experience_level.slice(1)} 
                              {talent.years_of_experience && ` (${talent.years_of_experience} years)`}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-secondary-400" />
                            <span>{talent.total_points} pts</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-secondary-400" />
                            <span>{talent.education_level ? getEducationLabel(talent.education_level) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="text-sm text-secondary-500">
                        Joined {new Date(talent.joined_date).toLocaleDateString()}
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link to={`/messages?user=${talent.id}`}>
                          <Button size="sm" variant="outline" className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>Message</span>
                          </Button>
                        </Link>
                        
                        <Link to={`/users/${talent.username}`}>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTalents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">No talents found</h3>
                <p className="text-secondary-600">
                  Try adjusting your filters or check back later for new professionals.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentPage;