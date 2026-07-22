import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'gray';
  text?: string;
  className?: string;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  isLoading, 
  children, 
  size = 'md', 
  variant = 'primary', 
  text, 
  className = '' 
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <LoadingSpinner size={size} variant={variant} text={text} />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;