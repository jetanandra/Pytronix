import React from 'react';

interface LoaderSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'violet';
}

const LoaderSpinner: React.FC<LoaderSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue'
}) => {
  // Map size to Tailwind classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };
  
  // Map color to Tailwind classes
  const colorClasses = {
    blue: 'border-t-neon-blue',
    green: 'border-t-neon-green',
    violet: 'border-t-neon-violet',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]} 
          rounded-full border-gray-200 dark:border-gray-700 animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoaderSpinner;