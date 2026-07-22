import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'gray';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary', 
  text,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'text-gray-600',
    secondary: 'text-gray-400',
    gray: 'text-gray-500'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin rounded-full border-2 border-current border-t-transparent`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && <span className="mt-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;