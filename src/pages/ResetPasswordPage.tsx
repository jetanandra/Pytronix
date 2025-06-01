import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated! You can now log in with your new password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-navy px-4">
      <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-navy focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="Enter new password"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-navy focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        {message && <div className="mt-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
};

export default ResetPasswordPage; 