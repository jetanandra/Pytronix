import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Trash, Plus, Minus } from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';

const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { items, total } = cart;
  const navigate = useNavigate();

  if (!items) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  // Calculate total original price and discount
  const totalOriginal = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const totalDiscount = totalOriginal - total;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="container-custom py-16 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
        <ShoppingCart className="w-8 h-8 mr-3 text-neon-blue" /> Your Shopping Cart
      </h1>
      {items.length === 0 ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4 text-lg">Your cart is empty</p>
          <Link to="/products" className="btn-primary inline-flex items-center">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white dark:bg-light-navy rounded-lg shadow p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map(({ product, quantity }) => {
                    const price = product.discount_price || product.price;
                    return (
                      <tr key={product.id}>
                        <td className="px-4 py-4 flex items-center gap-4 min-w-[220px]">
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-navy" />
                          <div>
                            <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-neon-blue dark:hover:text-neon-blue">
                              {product.name}
                            </Link>
                            <div className="text-xs text-gray-500 dark:text-soft-gray mt-1">
                              {product.category || 'Uncategorized'}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-lg font-medium text-gray-900 dark:text-white">
                          {product.discount_price ? (
                            <>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.discount_price.toLocaleString()}</span>
                              <span className="ml-2 text-sm line-through text-gray-500 dark:text-soft-gray">₹{product.price.toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              disabled={quantity <= 1}
                              className="p-1 rounded bg-gray-100 dark:bg-dark-navy text-gray-600 dark:text-soft-gray hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              disabled={quantity >= product.stock}
                              className="p-1 rounded bg-gray-100 dark:bg-dark-navy text-gray-600 dark:text-soft-gray hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-lg text-neon-blue font-bold">
                          ₹{(price * quantity).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                            aria-label="Remove from cart"
                          >
                            <Trash className="w-5 h-5 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={clearCart}
                className="btn-secondary"
              >
                Clear Cart
              </button>
              <Link to="/products" className="btn-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
          {/* Cart Summary */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 dark:text-soft-gray">Total Price</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">₹{totalOriginal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 dark:text-soft-gray">Discount Applied</span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">-₹{totalDiscount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 dark:text-soft-gray">Total After Discount</span>
              <span className="text-2xl font-bold text-neon-blue">₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 dark:text-soft-gray">Shipping</span>
              <span className="text-gray-500 dark:text-soft-gray">Calculated at checkout</span>
            </div>
            <button 
              className="btn-primary w-full py-3 text-lg font-semibold mt-2" 
              disabled={items.length === 0}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
            <p className="text-xs text-gray-500 dark:text-soft-gray mt-4 text-center">
              By placing your order, you agree to our <Link to="/terms" className="underline">Terms & Conditions</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;