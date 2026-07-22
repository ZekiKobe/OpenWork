import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { ProfileCompletionWizard } from './ProfileCompletionWizard';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { apiService } from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  Home,
  User,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  BookOpen,
  Menu,
  X,
  ChevronDown,
  Code,
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  MessageSquare,
  Search,
  Bell,
  Heart,
  Bookmark,
  FileText,
  Plus,
  Wallet
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const [isProfileWizardOpen, setIsProfileWizardOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Close mobile user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileUserMenuOpen && !target.closest('.mobile-user-menu-container')) {
        setIsMobileUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileUserMenuOpen]);

  // Load unread notification count
  useEffect(() => {
    if (user) {
      const loadUnreadCount = async () => {
        try {
          const response = await apiService.getUnreadNotificationCount();
          setUnreadNotificationCount(response.unreadCount || 0);
        } catch (error) {
          // Silently fail
        }
      };

      loadUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);

      const socket = getSocket();
      const handleNotification = () => {
        setUnreadNotificationCount((prev) => prev + 1);
      };
      socket?.on('notification', handleNotification);

      return () => {
        clearInterval(interval);
        socket?.off('notification', handleNotification);
      };
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;

    const fields = [
      { field: user.username, weight: 10 },
      { field: user.email, weight: 10 },
      { field: user.bio, weight: 8 },
      { field: user.title, weight: 6 },
      { field: user.company, weight: 5 },
      { field: user.location, weight: 4 },
      { field: user.website, weight: 3 },
      { field: Array.isArray(user.skills) && user.skills.length > 0, weight: 8 },
      { field: Array.isArray(user.expertise_areas) && user.expertise_areas.length > 0, weight: 8 },
      { field: user.years_of_experience, weight: 6 },
      { field: user.current_role, weight: 5 },
      { field: user.education_level, weight: 6 },
      { field: user.field_of_study, weight: 5 },
      { field: user.linkedin_url, weight: 3 },
      { field: user.github_url, weight: 3 },
      { field: user.twitter_url, weight: 3 },
      { field: user.avatar_url, weight: 4 },
    ];

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = fields.reduce((sum, field) => {
      return sum + (field.field ? field.weight : 0);
    }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const needsProfileCompletion = profileCompletion < 80;

  return (
    <>
      <nav className="bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to={user?.role === 'freelancer' ? '/browse-jobs' : user?.role === 'client' ? '/browse-gigs' : '/'} 
              className="flex items-center" 
              onClick={closeMobileMenu}
            >
              <span className="text-2xl font-bold text-secondary-900">OpenWork</span>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center ml-8">
              {/* For Freelancers - Logged In */}
              {user?.role === 'freelancer' && (
                <>
                  <div className="relative group">
                    <button className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2">
                      <span>Find Work</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <Link to="/browse-jobs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Browse Jobs
                      </Link>
                      <Link to="/marketplace/my-gigs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        My Gigs
                      </Link>
                      <Link to="/proposals" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        My Proposals
                      </Link>
                    </div>
                  </div>

                  <div className="relative group">
                    <button className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2">
                      <span>My Jobs</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <Link to="/my-jobs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Active Contracts
                      </Link>
                      <Link to="/offers" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Offers
                      </Link>
                      <Link to="/reports" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Reports
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* For Clients - Logged In */}
              {user?.role === 'client' && (
                <>
                  <div className="relative group">
                    <button className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2">
                      <span>Hire Freelancers</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <Link to="/browse-gigs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Browse Services
                      </Link>
                      <Link to="/talent" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Find Talent
                      </Link>
                      <Link to="/jobs/create" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Post a Job
                      </Link>
                    </div>
                  </div>

                  <div className="relative group">
                    <button className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2">
                      <span>My Jobs</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <Link to="/my-posted-jobs" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Posted Jobs
                      </Link>
                      <Link to="/my-contracts" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Active Contracts
                      </Link>
                      <Link to="/client-proposals" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Job Proposals
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* For Non-Logged-In Users - Show Find Work and Hire Freelancers */}
              {!user && (
                <>
                  <div className="relative group">
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2 cursor-pointer"
                    >
                      <span>Find Work</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button 
                        onClick={() => navigate('/login')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Browse Jobs
                      </button>
                      <button 
                        onClick={() => navigate('/login')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Gigs
                      </button>
                      <button 
                        onClick={() => navigate('/login')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Proposals
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <button 
                      onClick={() => navigate('/login')}
                      className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2 cursor-pointer"
                    >
                      <span>Hire Freelancers</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button 
                        onClick={() => navigate('/login')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Browse Services
                      </button>
                      <button 
                        onClick={() => navigate('/login')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Find Talent
                      </button>
                      <button 
                        onClick={() => navigate('/login')}
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Post a Job
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Community - Available to all */}
              <div className="relative group">
                <button className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2">
                  <span>Community</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <Link to="/trending" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    Trending Posts
                  </Link>
                  <Link to="/categories" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    Browse by Category
                  </Link>
                  <Link to="/posts" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    All Posts
                  </Link>
                  <Link to="/mentors" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    Mentors
                  </Link>
                </div>
              </div>

              {/* Messages - Available to authenticated users */}
              {user && (
                <Link to="/messages" className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors relative py-2">
                  Messages
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              )}

              {/* Why OpenWork - Available to all */}
              <div className="relative group">
                <button className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1 py-2">
                  <span>Why OpenWork</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <Link to="/rules" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    How It Works
                  </Link>
                  <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    Success Stories
                  </a>
                  <a href="#" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                    About Us
                  </a>
                </div>
              </div>

              {/* Pricing - Available to all */}
              <Link to="#" className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors py-2">
                Pricing
              </Link>
            </div>

            {/* Desktop User Actions - Right Side */}
            <div className="hidden lg:flex items-center space-x-6">
              {user ? (
                <>
                  {/* Notifications */}
                  <button
                    onClick={() => setIsNotificationCenterOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 relative"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {/* Account Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-base text-gray-900">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.total_points} points</p>
                          </div>
                        </div>
                      </div>

                      <Link to={`/users/${user.username}`} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        View Profile
                      </Link>
                      <Link to="/dashboard" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Dashboard
                      </Link>
                      <Link to="/wallet" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Wallet
                      </Link>
                      <Link to="/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        Settings
                      </Link>


                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/admin/login" className="no-underline">
          
                  </Link>
                  <Link to="/login" className="text-base text-gray-700 hover:text-gray-900 font-medium transition-colors no-underline">
                    Log in
                  </Link>
                  <Link to="/register" className="no-underline">
                    <Button size="lg" className="!bg-green-600 hover:!bg-green-700 !text-white !px-6 !py-2.5 !text-base !font-medium">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-3 lg:hidden">
              {user ? (
                <>
                  {/* Notifications on Mobile */}
                  <button
                    onClick={() => setIsNotificationCenterOpen(true)}
                    className="p-2 text-secondary-600 hover:text-secondary-900 relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {/* User Menu on Mobile */}
                  <div className="relative mobile-user-menu-container">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileUserMenuOpen(!isMobileUserMenuOpen);
                      }}
                      className="flex items-center space-x-1 text-secondary-600 hover:text-secondary-900"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                    </button>
                                  
                    {/* Mobile User Dropdown */}
                    {isMobileUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded border border-secondary-200 shadow-lg py-2 z-50">
                        <div className="px-4 py-3 border-b border-secondary-100">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-secondary-900">{user.username}</p>
                              <p className="text-xs text-secondary-500">{user.total_points} points</p>
                            </div>
                          </div>
                        </div>
                                      
                        <Link to={`/users/${user.username}`} className="block px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50" onClick={() => setIsMobileUserMenuOpen(false)}>
                          View Profile
                        </Link>
                        <Link to="/dashboard" className="block px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50" onClick={() => setIsMobileUserMenuOpen(false)}>
                          Dashboard
                        </Link>
                        <Link to="/wallet" className="block px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50" onClick={() => setIsMobileUserMenuOpen(false)}>
                          Wallet
                        </Link>
                        <Link to="/settings" className="block px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50" onClick={() => setIsMobileUserMenuOpen(false)}>
                          Settings
                        </Link>
                                      
                                      
                        <div className="border-t border-secondary-100 my-1"></div>
                        <button onClick={() => { handleLogout(); setIsMobileUserMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50">
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/admin/login" className="no-underline">
                    <button className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                      <Shield className="w-5 h-5" />
                    </button>
                  </Link>
                  <Link to="/login" className="text-sm text-secondary-700 hover:text-secondary-900 font-medium transition-colors no-underline">
                    Log in
                  </Link>
                  <Link to="/register" className="no-underline">
                    <Button size="sm" className="!bg-green-600 hover:!bg-green-700 !text-white">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
                          
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-secondary-600 hover:text-secondary-900"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
        </div>
      </div>

      {/* Profile Completion Banner */}

    </nav>

    {/* Profile Completion Wizard */}
    {user && (
      <ProfileCompletionWizard
        isOpen={isProfileWizardOpen}
        onClose={() => setIsProfileWizardOpen(false)}
        onComplete={() => setIsProfileWizardOpen(false)}
      />
    )}

    {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeMobileMenu}
        ></div>

        {/* Sidebar */}
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200">
              <Link 
                to={user?.role === 'freelancer' ? '/browse-jobs' : user?.role === 'client' ? '/browse-gigs' : '/'} 
                onClick={closeMobileMenu} 
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VL</span>
                </div>
                <span className="text-xl font-bold text-secondary-900">OpenWork</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-secondary-600 hover:text-secondary-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-secondary-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900">{user.username}</p>
                    <p className="text-sm text-secondary-500">{user.total_points} points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* Main Navigation */}
                <div>
                  <nav className="space-y-1">
                    <Link 
                      to={user?.role === 'freelancer' ? '/browse-jobs' : user?.role === 'client' ? '/browse-gigs' : '/'} 
                      onClick={closeMobileMenu} 
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600"
                    >
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>

                    {/* Freelancer Navigation */}
                    {user?.role === 'freelancer' && (
                      <>
                        <Link to="/browse-jobs" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-blue-50 hover:text-blue-600">
                          <Briefcase className="w-5 h-5" />
                          <span>Find Work</span>
                        </Link>

                        <div className="ml-6 space-y-1">
                          <Link to="/my-jobs" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-green-600 text-sm">
                            <Briefcase className="w-4 h-4" />
                            <span>Active Contracts</span>
                          </Link>
                          <Link to="/proposals" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-green-600 text-sm">
                            <FileText className="w-4 h-4" />
                            <span>My Proposals</span>
                          </Link>
                          <Link to="/offers" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-green-600 text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>Offers</span>
                          </Link>
                        </div>

                        <Link to="/marketplace/my-gigs" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                          <TrendingUp className="w-5 h-5" />
                          <span>My Gigs</span>
                        </Link>

                        <Link to="/reports" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                          <BarChart3 className="w-5 h-5" />
                          <span>Reports</span>
                        </Link>
                      </>
                    )}

                    {/* Client Navigation */}
                    {user?.role === 'client' && (
                      <>
                        <Link to="/browse-gigs" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                          <Users className="w-5 h-5" />
                          <span>Browse Services</span>
                        </Link>

                        <div className="ml-6 space-y-1">
                          <Link to="/my-posted-jobs" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-green-600 text-sm">
                            <Briefcase className="w-4 h-4" />
                            <span>Posted Jobs</span>
                          </Link>
                          <Link to="/my-contracts" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-green-600 text-sm">
                            <FileText className="w-4 h-4" />
                            <span>Active Contracts</span>
                          </Link>
                          <Link to="/client-proposals" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-green-600 text-sm">
                            <FileText className="w-4 h-4" />
                            <span>Job Proposals</span>
                          </Link>
                          <Link to="/talent" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-green-600 text-sm">
                            <Users className="w-4 h-4" />
                            <span>Hire Talent</span>
                          </Link>
                        </div>

                        <Link to="/talent" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                          <Users className="w-5 h-5" />
                          <span>Talent</span>
                        </Link>
                      </>
                    )}

                    {/* Messages - Available to both */}
                    <Link to="/messages" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600 relative">
                      <MessageSquare className="w-5 h-5" />
                      <span>Messages</span>
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>
                  </nav>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-3">Services</h3>
                  <nav className="space-y-1">
                    <Link to="/search" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                      <Search className="w-5 h-5" />
                      <span>Browse Content</span>
                    </Link>
                    <Link to="/trending" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                      <TrendingUp className="w-5 h-5" />
                      <span>Trending</span>
                    </Link>
                    <Link to="/categories" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                      <Briefcase className="w-5 h-5" />
                      <span>Categories</span>
                    </Link>
                    <Link to="/mentors" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                      <GraduationCap className="w-5 h-5" />
                      <span>Mentors</span>
                    </Link>
                  </nav>
                </div>

                {/* Account */}
                {user && (
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-900 uppercase tracking-wider mb-3">Account</h3>
                    <nav className="space-y-1">
                      <Link to={`/users/${user.username}`} onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                      <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                        <BarChart3 className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to="/saved" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                        <Bookmark className="w-5 h-5" />
                        <span>Saved Posts</span>
                      </Link>
                      <Link to="/liked" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                        <Heart className="w-5 h-5" />
                        <span>Liked Posts</span>
                      </Link>
                      <Link to="/settings" onClick={closeMobileMenu} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-secondary-700 hover:bg-green-50 hover:text-green-600">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                    </nav>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-secondary-200">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <Link to="/admin/login" onClick={closeMobileMenu}>
                    <Button className="w-full !bg-purple-600 hover:!bg-purple-700 !text-white flex items-center justify-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Admin Login</span>
                    </Button>
                  </Link>
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu}>
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => {
          setIsNotificationCenterOpen(false);
          // Refresh unread count when closing
          if (user) {
            apiService.getUnreadNotificationCount().then(response => {
              setUnreadNotificationCount(response.unreadCount || 0);
            }).catch(() => {});
          }
        }}
      />
    </>
  );
};
