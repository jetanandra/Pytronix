import React from 'react';
import { AlertTriangle } from 'lucide-react';

const OrderList = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Orders
      </h1>
      
      <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          Order Management Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-soft-gray mb-6 max-w-md mx-auto">
          This feature is currently under development. Check back soon for order management functionality.
        </p>
      </div>
    </div>
  );
};

export default OrderList;