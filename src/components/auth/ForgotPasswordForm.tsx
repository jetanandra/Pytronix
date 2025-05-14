import React, { useState } from 'react';
import Modal from '../ui/Modal';

// Dummy sendResetEmail function for demonstration; replace with actual implementation
const sendResetEmail = async (email: string) => {
  // Simulate async call
  if (!email.includes('@')) return 'Invalid email address.';
  return null;
};

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [modal, setModal] = useState<{ open: boolean; type: 'error' | 'info'; message: string }>({ open: false, type: 'info', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setModal({ open: true, type: 'error', message: 'Please enter your email address.' });
      return;
    }
    const error = await sendResetEmail(email);
    if (error) {
      setModal({ open: true, type: 'error', message: error });
    } else {
      setModal({ open: true, type: 'info', message: 'If an account exists for this email, a password reset link has been sent.' });
    }
  };

  return (
    <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-soft-white mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
            placeholder="your@email.com"
          />
        </div>
        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center"
        >
          Send Reset Link
        </button>
      </form>
      {modal.open && (
        <Modal
          open={modal.open}
          type={modal.type}
          message={modal.message}
          onClose={() => setModal({ ...modal, open: false })}
        />
      )}
    </div>
  );
};

export default ForgotPasswordForm; 