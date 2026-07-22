import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Code,
  Palette,
  FileText,
  TrendingUp,
  BarChart3,
  Users,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Megaphone,
  Database,
  Shield,
  Globe,
  Smartphone,
  Video,
  Music
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  postCount?: number;
  trending: boolean;
}

const formatPostCount = (count?: number) =>
  count != null ? count.toLocaleString() : '—';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Category[] = [
    {
      id: 'web-development',
      name: 'Web Development',
      description: 'Frontend, backend, full-stack development and web technologies',
      icon: Code,
      color: 'from-blue-400 to-blue-600',
      trending: true
    },
    {
      id: 'mobile-development',
      name: 'Mobile Development',
      description: 'iOS, Android, React Native, Flutter and mobile app development',
      icon: Smartphone,
      color: 'from-purple-400 to-purple-600',
      trending: true
    },
    {
      id: 'design',
      name: 'Design',
      description: 'UI/UX, graphic design, branding, and creative work',
      icon: Palette,
      color: 'from-pink-400 to-pink-600',
      trending: false
    },
    {
      id: 'writing',
      name: 'Writing & Content',
      description: 'Content writing, copywriting, technical writing, and blogging',
      icon: FileText,
      color: 'from-green-400 to-green-600',
      trending: false
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Digital marketing, SEO, social media, and growth strategies',
      icon: TrendingUp,
      color: 'from-orange-400 to-orange-600',
      trending: true
    },
    {
      id: 'data-science',
      name: 'Data Science & AI',
      description: 'Machine learning, data analysis, AI, and analytics',
      icon: BarChart3,
      color: 'from-indigo-400 to-indigo-600',
      trending: true
    },
    {
      id: 'business',
      name: 'Business & Consulting',
      description: 'Business strategy, consulting, and entrepreneurship',
      icon: Briefcase,
      color: 'from-gray-400 to-gray-600',
      trending: false
    },
    {
      id: 'education',
      name: 'Education & Training',
      description: 'Teaching, tutoring, course creation, and mentorship',
      icon: GraduationCap,
      color: 'from-yellow-400 to-yellow-600',
      trending: false
    },
    {
      id: 'video-animation',
      name: 'Video & Animation',
      description: 'Video editing, motion graphics, 3D animation, and visual effects',
      icon: Video,
      color: 'from-red-400 to-red-600',
      trending: false
    },
    {
      id: 'music-audio',
      name: 'Music & Audio',
      description: 'Music production, audio editing, voice-over, and sound design',
      icon: Music,
      color: 'from-teal-400 to-teal-600',
      trending: false
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      description: 'Security, penetration testing, ethical hacking, and privacy',
      icon: Shield,
      color: 'from-red-500 to-red-700',
      trending: false
    },
    {
      id: 'blockchain',
      name: 'Blockchain & Crypto',
      description: 'Blockchain development, cryptocurrency, and Web3',
      icon: Database,
      color: 'from-cyan-400 to-cyan-600',
      trending: true
    },
    {
      id: 'networking',
      name: 'Networking & Cloud',
      description: 'Cloud computing, DevOps, networking, and infrastructure',
      icon: Globe,
      color: 'from-sky-400 to-sky-600',
      trending: false
    },
    {
      id: 'product-management',
      name: 'Product Management',
      description: 'Product strategy, roadmaps, and product development',
      icon: Lightbulb,
      color: 'from-amber-400 to-amber-600',
      trending: false
    },
    {
      id: 'social-media',
      name: 'Social Media',
      description: 'Social media management, content creation, and community building',
      icon: Megaphone,
      color: 'from-rose-400 to-rose-600',
      trending: false
    },
    {
      id: 'community',
      name: 'Community & Support',
      description: 'General discussions, Q&A, and community support',
      icon: Users,
      color: 'from-emerald-400 to-emerald-600',
      trending: false
    }
  ];

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/?category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse by Category</h1>
          <p className="text-lg text-gray-600">
            Explore posts and discussions organized by topics and interests
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Trending Categories */}
        {!searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
              Trending Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.filter(cat => cat.trending).map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                              {formatPostCount(category.postCount)} posts
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                              Trending
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchQuery ? 'Search Results' : 'All Categories'}
          </h2>
          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 mb-4">No categories found matching "{searchQuery}"</p>
                <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {category.description}
                          </p>
                          <span className="text-sm font-medium text-gray-500">
                            {formatPostCount(category.postCount)} posts
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
