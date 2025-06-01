import React from 'react';

const ShippingReturnsPage: React.FC = () => (
  <div className="container-custom py-16 min-h-screen">
    <h1 className="text-4xl font-bold mb-8 text-neon-blue font-orbitron text-center">Shipping & Returns</h1>
    <div className="max-w-2xl mx-auto bg-white dark:bg-light-navy rounded-lg shadow p-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Shipping Policy</h2>
      <p className="mb-6 text-gray-600 dark:text-soft-gray">We ship orders within 24-48 hours. Delivery times vary by location, typically 2-7 business days. Free shipping on orders above ₹1000.</p>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Return Policy</h2>
      <p className="mb-2 text-gray-600 dark:text-soft-gray">You may return most new, unopened items within 7 days of delivery for a full refund. Items must be unused and in original packaging.</p>
      <p className="mb-2 text-gray-600 dark:text-soft-gray">To initiate a return, contact our support team with your order details. Refunds are processed within 7-10 business days after we receive the returned item.</p>
      <p className="text-gray-600 dark:text-soft-gray">Shipping costs are non-refundable unless the return is due to our error.</p>
    </div>
  </div>
);

export default ShippingReturnsPage; 