import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const AdminSetupPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretCode) {
      toast.error('Please enter the admin secret code');
      return;
    }
    
    if (!user?.id) {
      toast.error('User ID not found. Please sign in again.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call the Supabase Edge Function directly passing the user ID
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // We're using the anon key here, as we're passing the userId explicitly
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ 
            secretCode,
            userId: user.id 
          })
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set admin role');
      }
      
      setSuccess(true);
      toast.success(data.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  // Check if user already has admin role
  const isAdmin = user?.user_metadata?.role === 'admin';
  
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            Please sign in to access admin setup.
          </p>
          <a href="/login" className="btn-primary">Sign In</a>
        </div>
      </div>
    );
  }
  
  if (isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-12">
        <div className="container-custom max-w-md mx-auto">
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg overflow-hidden p-6">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Privileges Active
              </h1>
              <p className="text-gray-600 dark:text-soft-gray mt-2">
                You already have admin privileges
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <p>You have admin access to the system</p>
              </div>
              <p className="text-gray-600 dark:text-soft-gray mb-6">
                You can now access the admin dashboard and manage the system.
              </p>
              <a 
                href="/admin"
                className="btn-primary block mb-4"
              >
                Go to Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom max-w-md mx-auto">
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg overflow-hidden p-6">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-neon-blue mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Setup
            </h1>
            <p className="text-gray-600 dark:text-soft-gray mt-2">
              Enter the admin secret code to gain admin privileges
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {success ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <p>Admin role assigned successfully!</p>
              </div>
              <p className="text-gray-600 dark:text-soft-gray mb-6">
                Please sign out and sign back in for the changes to take effect.
              </p>
              <button 
                onClick={handleSignOut}
                className="btn-primary flex items-center mx-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdminSetup} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Admin Secret Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    required
                    className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    placeholder="Enter secret code"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  The admin secret code is: pytronix-admin-2025
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {loading ? (
                  <LoaderSpinner size="sm" color="blue" />
                ) : (
                  'Set Admin Role'
                )}
              </button>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Current user: {user.email}</p>
                <p className="mt-1">User ID: {user.id}</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;