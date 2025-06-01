import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Join the <span className="text-neon-blue dark:text-neon-blue neon-text">Phytronix</span> Community
            </h1>
            <p className="text-gray-600 dark:text-soft-gray mb-6">
              Access exclusive deals, track your orders, and get technical support for your electronics projects.
            </p>
            <div className="bg-gradient-to-r from-neon-blue/10 to-neon-violet/10 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-soft-white">
                Member Benefits
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-neon-green mr-2">✓</span>
                  <span className="text-gray-700 dark:text-soft-gray">Exclusive discounts on IoT components</span>
                </li>
                <li className="flex items-start">
                  <span className="text-neon-green mr-2">✓</span>
                  <span className="text-gray-700 dark:text-soft-gray">Early access to new product launches</span>
                </li>
                <li className="flex items-start">
                  <span className="text-neon-green mr-2">✓</span>
                  <span className="text-gray-700 dark:text-soft-gray">Free technical consultation for your projects</span>
                </li>
                <li className="flex items-start">
                  <span className="text-neon-green mr-2">✓</span>
                  <span className="text-gray-700 dark:text-soft-gray">Access to community forums and tutorials</span>
                </li>
              </ul>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LoginForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;