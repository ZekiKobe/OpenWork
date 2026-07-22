import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { 
  Plus, Edit, X, Briefcase, User, 
  Star, Award, Wallet, Settings, Eye
} from 'lucide-react';
import ProfileSidebar from '../components/common/ProfileSidebar';
import type { UserProfile, PortfolioItem } from '../types';

const PortfolioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    category: '',
    technologies: [] as string[],
  });
  const [techInput, setTechInput] = useState('');
  const [portfolioErrors, setPortfolioErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileResponse = await apiService.getPublicProfile(username!);
      setProfile(profileResponse);
      setIsOwnProfile(user?.id === profileResponse.id);

      // Load user's portfolios
      const portfolioResponse = await apiService.getMyPortfolios();
      setPortfolios(portfolioResponse.portfolios);
    } catch (error) {
      console.error('Failed to load profile or portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPortfolioForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (portfolioErrors[name]) {
      setPortfolioErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !(portfolioForm.technologies || []).includes(techInput.trim())) {
      setPortfolioForm(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setPortfolioForm(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter(t => t !== tech)
    }));
  };

  const handleSavePortfolio = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (!portfolioForm.title.trim()) newErrors.title = 'Title is required';
    if (!portfolioForm.description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setPortfolioErrors(newErrors);
      return;
    }

    try {
      if (editingPortfolio) {
        // Update existing portfolio
        const response = await apiService.updatePortfolio(
          editingPortfolio.id,
          portfolioForm
        );
        setPortfolios(prev => prev.map(p => p.id === editingPortfolio.id ? response.portfolio : p));
      } else {
        // Create new portfolio
        const response = await apiService.createPortfolio(portfolioForm);
        setPortfolios(prev => [...prev, response.portfolio]);
      }
      
      // Reset form
      setPortfolioForm({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        category: '',
        technologies: [],
      });
      setShowAddPortfolio(false);
      setEditingPortfolio(null);
    } catch (error) {
      console.error('Failed to save portfolio:', error);
    }
  };

  const handleEditPortfolio = (portfolio: PortfolioItem) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      title: portfolio.title,
      description: portfolio.description,
      image_url: portfolio.image_url || '',
      link_url: portfolio.link_url || '',
      category: portfolio.category || '',
      technologies: portfolio.technologies || [],
    });
    setShowAddPortfolio(true);
  };

  const handleDeletePortfolio = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await apiService.deletePortfolio(id);
        setPortfolios(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Failed to delete portfolio:', error);
      }
    }
  };

  const { scrollTo } = useSmoothScroll();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="primary" text="Loading portfolio..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">User not found</h2>
          <Link to="/" className="text-primary-600 hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileSidebar profile={profile} isOwnProfile={isOwnProfile} />
          
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden mb-6">
              <div className="p-5 border-b border-secondary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-secondary-900 flex items-center">
                      <Briefcase className="w-6 h-6 mr-3 text-primary-600" />
                      Portfolio
                    </h1>
                    <p className="text-secondary-600 mt-1">
                      {isOwnProfile 
                        ? "Manage your portfolio projects" 
                        : `View ${profile.username}'s portfolio projects`}
                    </p>
                  </div>
                  
                  {isOwnProfile && (
                    <Button 
                      onClick={() => {
                        setEditingPortfolio(null);
                        setPortfolioForm({
                          title: '',
                          description: '',
                          image_url: '',
                          link_url: '',
                          category: '',
                          technologies: [],
                        });
                        setShowAddPortfolio(true);
                      }}
                      className="flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="p-5">
                {portfolios.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No portfolio projects yet</h3>
                    <p className="text-secondary-600 mb-4">
                      {isOwnProfile 
                        ? "Add your first portfolio project to showcase your work" 
                        : `${profile.username} hasn't added any portfolio projects yet`}
                    </p>
                    {isOwnProfile && (
                      <Button 
                        onClick={() => {
                          setEditingPortfolio(null);
                          setPortfolioForm({
                            title: '',
                            description: '',
                            image_url: '',
                            link_url: '',
                            category: '',
                            technologies: [],
                          });
                          setShowAddPortfolio(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Project
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolios.map((portfolio) => (
                      <div key={portfolio.id} className="border border-secondary-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-secondary-900 text-lg">{portfolio.title}</h4>
                          {isOwnProfile && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditPortfolio(portfolio)}
                                className="p-1.5 h-auto"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeletePortfolio(portfolio.id)}
                                className="p-1.5 h-auto text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-secondary-600 mb-3">{portfolio.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {portfolio.technologies && Array.isArray(portfolio.technologies) && portfolio.technologies.map((tech: string, idx: number) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        
                        {portfolio.link_url && (
                          <a 
                            href={portfolio.link_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
                          >
                            View Project
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Portfolio Modal */}
      {showAddPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-secondary-900">
                  {editingPortfolio ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowAddPortfolio(false);
                    setEditingPortfolio(null);
                    setPortfolioForm({
                      title: '',
                      description: '',
                      image_url: '',
                      link_url: '',
                      category: '',
                      technologies: [],
                    });
                  }}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Title *</label>
                  <Input
                    name="title"
                    value={portfolioForm.title}
                    onChange={handlePortfolioInputChange}
                    placeholder="Project title"
                  />
                  {portfolioErrors.title && (
                    <p className="mt-1 text-sm text-danger-600">{portfolioErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Description *</label>
                  <Textarea
                    name="description"
                    value={portfolioForm.description}
                    onChange={handlePortfolioInputChange}
                    placeholder="Describe your project"
                    rows={3}
                  />
                  {portfolioErrors.description && (
                    <p className="mt-1 text-sm text-danger-600">{portfolioErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                  <Input
                    name="category"
                    value={portfolioForm.category}
                    onChange={handlePortfolioInputChange}
                    placeholder="e.g., Web Development, Mobile App"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Project Link</label>
                  <Input
                    name="link_url"
                    type="url"
                    value={portfolioForm.link_url}
                    onChange={handlePortfolioInputChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Image URL</label>
                  <Input
                    name="image_url"
                    type="url"
                    value={portfolioForm.image_url}
                    onChange={handlePortfolioInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Technologies Used</label>
                  <div className="flex">
                    <Input
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="Add a technology (e.g., React, Node.js)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
                    />
                    <Button type="button" onClick={handleAddTechnology} className="ml-2">
                      Add
                    </Button>
                  </div>
                  
                  {portfolioForm.technologies && portfolioForm.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(portfolioForm.technologies || []).map((tech, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                        >
                          {tech}
                          <button
                            type="button"
                            className="ml-1 text-secondary-500 hover:text-secondary-700"
                            onClick={() => handleRemoveTechnology(tech)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddPortfolio(false);
                    setEditingPortfolio(null);
                    setPortfolioForm({
                      title: '',
                      description: '',
                      image_url: '',
                      link_url: '',
                      category: '',
                      technologies: [],
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePortfolio}>
                  {editingPortfolio ? 'Update Project' : 'Add Project'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;