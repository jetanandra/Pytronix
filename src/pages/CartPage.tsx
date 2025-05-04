import React from 'react';

const CartPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <a href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
            Start Shopping
          </a>
        </div>
      </div>
    </div>
  );
};

export default CartPage;