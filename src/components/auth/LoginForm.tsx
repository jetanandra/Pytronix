import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoaderSpinner from '../ui/LoaderSpinner';
import Modal from '../ui/Modal';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [modal, setModal] = useState<{ open: boolean; type: 'error' | 'info'; message: string }>({ open: false, type: 'info', message: '' });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await signUp(email, password, name, phone);
      if (!error) {
        setModal({ open: true, type: 'info', message: 'Signup successful! Please check your email for confirmation.' });
      } else {
        setModal({ open: true, type: 'error', message: error });
      }
    } else {
      await signIn(email, password);
      if (!error) {
        // Navigate to the page they were trying to access
        navigate(from, { replace: true });
      } else {
        setModal({ open: true, type: 'error', message: error });
      }
    }
  };
  
  return (
    <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-soft-white">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600 dark:text-soft-gray mt-2">
          {isSignUp 
            ? 'Join the Phytronix community today' 
            : 'Sign in to access your account'}
        </p>
      </div>
      
      {modal.open && (
        <Modal
          open={modal.open}
          type={modal.type}
          message={modal.message}
          onClose={() => setModal({ ...modal, open: false })}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="your@email.com"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>
        
        {!isSignUp && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-soft-gray">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-neon-blue hover:text-blue-600">
                Forgot password?
              </Link>
            </div>
          </div>
        )}
        
        {isSignUp && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  placeholder="Your full name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  placeholder="Your phone number"
                />
              </div>
            </div>
          </>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex justify-center items-center"
        >
          {loading ? (
            <LoaderSpinner size="sm" color="blue" />
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="font-medium text-neon-blue hover:text-blue-600 flex items-center justify-center mx-auto"
        >
          <User className="mr-2 h-4 w-4" />
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;