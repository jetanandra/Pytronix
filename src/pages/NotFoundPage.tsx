import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-32 bg-gray-50 dark:bg-dark-navy">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-24 w-24 text-neon-violet animate-pulse" />
        </div>
        <h1 className="text-8xl font-orbitron font-bold text-neon-blue dark:text-neon-blue mb-6 neon-text">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600 dark:text-soft-gray max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center justify-center"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <Link 
            to="/products" 
            className="btn-secondary inline-flex items-center justify-center"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;