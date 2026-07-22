import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Laptop } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usePageTitle } from '../hooks/usePageTitle';

export const RoleSelectionPage: React.FC = () => {
  usePageTitle('Choose Your Role');
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/register/${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with no background color */}
      <div className="w-full bg-white py-4 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            OpenWork
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Title */}
          <h1 className="text-3xl font-semibold text-gray-900 text-center mb-12">
            Join as a client or freelancer
          </h1>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Client Card */}
            <div
              onClick={() => setSelectedRole('client')}
              className={`
                relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${selectedRole === 'client'
                  ? 'border-green-600 bg-green-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-green-400 hover:shadow-sm'
                }
              `}
            >
              {/* Radio Button - Top Right */}
              <div className="absolute top-4 right-4">
                {selectedRole === 'client' ? (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>

              {/* Icon - Top Left */}
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
              </div>

              {/* Text */}
              <p className="text-base font-medium text-gray-900">
                I'm a client, hiring for a project
              </p>
            </div>

            {/* Freelancer Card */}
            <div
              onClick={() => setSelectedRole('freelancer')}
              className={`
                relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200
                ${selectedRole === 'freelancer'
                  ? 'border-green-600 bg-green-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-green-400 hover:shadow-sm'
                }
              `}
            >
              {/* Radio Button - Top Right */}
              <div className="absolute top-4 right-4">
                {selectedRole === 'freelancer' ? (
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>

              {/* Icon - Top Left */}
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Laptop className="w-6 h-6 text-green-600" />
                </div>
              </div>

              {/* Text */}
              <p className="text-base font-medium text-gray-900">
                I'm a freelancer, looking for work
              </p>
            </div>
          </div>

          {/* Create Account Button */}
          <div className="mb-6">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`
                w-full max-w-md mx-auto block
                ${!selectedRole
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
                py-3 text-base font-medium rounded-lg transition-colors
              `}
            >
              Create Account
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
