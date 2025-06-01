import React from 'react';

const WarrantyPage: React.FC = () => (
  <div className="container-custom py-16 min-h-screen">
    <h1 className="text-4xl font-bold mb-8 text-neon-blue font-orbitron text-center">Warranty</h1>
    <div className="max-w-2xl mx-auto bg-white dark:bg-light-navy rounded-lg shadow p-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Standard Warranty</h2>
      <p className="mb-4 text-gray-600 dark:text-soft-gray">All products come with a standard 6-month warranty against manufacturing defects unless otherwise specified on the product page.</p>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">How to Claim</h2>
      <p className="mb-4 text-gray-600 dark:text-soft-gray">To claim warranty, contact our support team with your order details and a description of the issue. We may request photos or videos for verification.</p>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Exclusions</h2>
      <ul className="list-disc pl-6 text-gray-600 dark:text-soft-gray mb-2">
        <li>Damage due to misuse, improper installation, or modification</li>
        <li>Normal wear and tear</li>
        <li>Consumable parts (batteries, cables, etc.)</li>
        <li>Products without valid proof of purchase</li>
      </ul>
      <p className="text-gray-600 dark:text-soft-gray">For more details, see our Terms & Conditions or contact support.</p>
    </div>
  </div>
);

export default WarrantyPage; 