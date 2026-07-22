import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Briefcase, 
  FileText, 
  Settings, 
  MessageCircle, 
  Star,
  Eye,
  Edit,
  Wallet,
  Award
} from 'lucide-react';

interface ProfileSidebarProps {
  profile: any;
  isOwnProfile: boolean;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ profile, isOwnProfile }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Define navigation items based on user role and ownership
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: User,
      path: `/users/${profile?.username}`,
      visible: true
    },
    {
      id: 'gigs',
      label: profile?.role === 'freelancer' ? 'My Gigs' : 'View Gigs',
      icon: Briefcase,
      path: profile?.role === 'freelancer' && isOwnProfile ? '/marketplace/my-gigs' : `/users/${profile?.username}/gigs`,
      visible: profile?.role === 'freelancer'
    },
    {
      id: 'jobs',
      label: profile?.role === 'client' ? 'My Jobs' : 'View Jobs',
      icon: FileText,
      path: profile?.role === 'client' && isOwnProfile ? '/my-posted-jobs' : `/users/${profile?.username}/jobs`,
      visible: profile?.role === 'client'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Briefcase,
      path: '/marketplace',
      visible: profile?.role === 'client' && isOwnProfile
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: Eye,
      path: `/users/${profile?.username}/portfolio`,
      visible: profile?.role === 'freelancer'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: Star,
      path: `/users/${profile?.username}/reviews`,
      visible: profile?.role === 'freelancer'
    },
    {
      id: 'posts',
      label: 'Posts',
      icon: FileText,
      path: `/users/${profile?.username}/posts`,
      visible: true
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages',
      visible: isOwnProfile
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      visible: isOwnProfile
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: Wallet,
      path: '/dashboard/earnings',
      visible: profile?.role === 'freelancer' && isOwnProfile
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      path: `/users/${profile?.username}/achievements`,
      visible: true
    }
  ].filter(item => item.visible);

  return (
    <div className="lg:w-64 flex-shrink-0 mb-6 lg:mb-0">
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
        <div className="p-5 border-b border-secondary-100">
          <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary-600" />
            Navigation
          </h2>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            
            {isOwnProfile && (
              <li className="pt-4 border-t border-secondary-100">
                <Link
                  to={`/marketplace/create-gig`}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Briefcase className="w-4 h-4 mr-3" />
                  <span>Create Gig</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
      
      {/* Stats Summary */}
      {profile && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
          <div className="p-5 border-b border-secondary-100">
            <h3 className="text-sm font-medium text-secondary-700">Account Stats</h3>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">Total Points</span>
              <span className="text-sm font-semibold text-primary-600">
                {profile.total_points?.toLocaleString() || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">Completed Orders</span>
              <span className="text-sm font-semibold text-green-600">
                {profile.stats?.completed_orders || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">Response Rate</span>
              <span className="text-sm font-semibold text-blue-600">
                {profile.response_rate || 'N/A'}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSidebar;