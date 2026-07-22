import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../../types/index';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CheckCircle, AlertCircle, User as UserIcon, TrendingUp } from 'lucide-react';

interface ProfileCompletionProps {
  user: User;
  className?: string;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ user, className = '' }) => {
  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [
      // Basic Info (required)
      { field: user.username, weight: 10 },
      { field: user.email, weight: 10 },
      { field: user.bio, weight: 8 },

      // Professional Info
      { field: user.title, weight: 6 },
      { field: user.company, weight: 5 },
      { field: user.location, weight: 4 },
      { field: user.website, weight: 3 },

      // Skills & Expertise
      { field: Array.isArray(user.skills) && user.skills.length > 0, weight: 8 },
      { field: Array.isArray(user.expertise_areas) && user.expertise_areas.length > 0, weight: 8 },

      // Experience
      { field: user.years_of_experience, weight: 6 },
      { field: user.current_role, weight: 5 },

      // Education
      { field: user.education_level, weight: 6 },
      { field: user.field_of_study, weight: 5 },

      // Social Links
      { field: user.linkedin_url, weight: 3 },
      { field: user.github_url, weight: 3 },
      { field: user.twitter_url, weight: 3 },

      // Avatar
      { field: user.avatar_url, weight: 4 },
    ];

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = fields.reduce((sum, field) => {
      return sum + (field.field ? field.weight : 0);
    }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isComplete = completionPercentage >= 80;

  // Get missing fields
  const getMissingFields = () => {
    const missing = [];
    if (!user.bio) missing.push('Bio');
    if (!user.title) missing.push('Professional Title');
    if (!user.company) missing.push('Company');
    if (!user.location) missing.push('Location');
    if (!Array.isArray(user.skills) || user.skills.length === 0) missing.push('Skills');
    if (!Array.isArray(user.expertise_areas) || user.expertise_areas.length === 0) missing.push('Expertise Areas');
    if (!user.years_of_experience) missing.push('Years of Experience');
    if (!user.current_role) missing.push('Current Role');
    if (!user.education_level) missing.push('Education Level');
    if (!user.field_of_study) missing.push('Field of Study');
    if (!user.avatar_url) missing.push('Profile Picture');
    return missing;
  };

  const missingFields = getMissingFields();

  return (
    <Card className={`border-l-4 ${isComplete ? 'border-l-green-500' : 'border-l-orange-500'} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600" />
            )}
            <h3 className="font-semibold text-secondary-900">
              Profile Completion
            </h3>
          </div>
          <span className={`text-sm font-bold ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
            {completionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary-200 rounded-full h-2 mb-3">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Status Message */}
        <p className="text-sm text-secondary-600 mb-3">
          {isComplete ? (
            <>
              <span className="text-green-600 font-medium">Great!</span> Your profile is well-completed and ready for the knowledge marketplace.
            </>
          ) : (
            <>
              Complete your profile to unlock full access to buying and selling knowledge on GrowTogether.
            </>
          )}
        </p>

        {/* Missing Fields */}
        {!isComplete && missingFields.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-secondary-500 mb-1">Missing information:</p>
            <div className="flex flex-wrap gap-1">
              {missingFields.slice(0, 4).map((field, index) => (
                <span key={index} className="inline-block px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                  {field}
                </span>
              ))}
              {missingFields.length > 4 && (
                <span className="inline-block px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded">
                  +{missingFields.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link to={`/users/${user.username}`}>
            <Button
              size="sm"
              variant={isComplete ? "outline" : "default"}
              className="flex items-center space-x-1"
            >
              <UserIcon className="w-4 h-4" />
              <span>{isComplete ? 'Update Profile' : 'Complete Profile'}</span>
            </Button>
          </Link>

          {isComplete && (
            <Link to="/browse-gigs">
              <Button size="sm" variant="outline" className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Browse Services</span>
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
