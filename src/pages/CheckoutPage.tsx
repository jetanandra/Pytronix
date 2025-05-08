import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { createOrder } from '../services/orderService';
import { Address } from '../types';
import { 
  CheckCircle, 
  CreditCard, 
  Home,
  Truck,
  MapPin,
  Plus, 
  Trash, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses, loading: addressesLoading, addUserAddress } = useProfile();
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    type: 'shipping' as const,
    is_default: false
  });
  
  // Set default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.is_default && addr.type === 'shipping');
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(addresses[0].id);
      }
    }
  }, [addresses]);
  
  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddressFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Add the address to the user's saved addresses
      const newAddress = await addUserAddress({
        type: addressForm.type,
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state,
        postal_code: addressForm.postal_code,
        country: addressForm.country,
        is_default: addressForm.is_default
      });
      
      // Select the new address
      setSelectedAddressId(newAddress.id);
      
      // Close the form
      setShowAddressForm(false);
      
      // Reset the form
      setAddressForm({
        full_name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        type: 'shipping',
        is_default: false
      });
      
      toast.success('Address added successfully');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };
  
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }
    
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    try {
      setOrderLoading(true);
      
      // Get the selected address
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (!selectedAddress) {
        throw new Error('Selected address not found');
      }
      
      // Create shipping address object for the order
      const shippingAddress = {
        full_name: user?.user_metadata?.full_name || 'Customer',
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postal_code: selectedAddress.postal_code,
        country: selectedAddress.country,
        phone: addressForm.phone || user?.user_metadata?.phone || ''
      };
      
      // Create payment details object for the order
      const paymentDetails = {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'paid',
        date: new Date().toISOString()
      };
      
      // Create the order
      const order = await createOrder(shippingAddress, paymentDetails);
      
      if (!order) {
        throw new Error('Failed to create order');
      }
      
      // Clear the cart
      clearCart();
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Navigate to the order details page
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };
  
  if (addressesLoading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-12">
        <div className="container-custom">
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 text-center max-w-lg mx-auto">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-soft-gray mb-6">
              You need to add items to your cart before checking out.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-navy transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address Section */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-neon-blue" />
                  Shipping Address
                </h2>
              </div>
              
              <div className="p-6">
                {addresses.length === 0 && !showAddressForm ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Addresses Found
                    </h3>
                    <p className="text-gray-600 dark:text-soft-gray mb-6">
                      You haven't added any shipping addresses yet.
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="btn-primary inline-flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Address selection */}
                    {!showAddressForm && addresses.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {addresses.map((address) => (
                          <div 
                            key={address.id}
                            className={`border rounded-lg p-4 transition-all cursor-pointer ${
                              selectedAddressId === address.id 
                                ? 'border-neon-blue dark:border-neon-blue bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setSelectedAddressId(address.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-start">
                                <input
                                  type="radio"
                                  checked={selectedAddressId === address.id}
                                  onChange={() => setSelectedAddressId(address.id)}
                                  className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 mt-1"
                                />
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Address Type: {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-soft-gray">
                                    {address.street}, {address.city}, {address.state}, {address.postal_code}, {address.country}
                                  </p>
                                </div>
                              </div>
                              <div>
                                {address.is_default && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add New Address button */}
                    {!showAddressForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="inline-flex items-center text-neon-blue hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add New Address
                      </button>
                    )}
                    
                    {/* Address form */}
                    {showAddressForm && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          Add New Address
                        </h3>
                        <form onSubmit={handleAddressFormSubmit}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                name="full_name"
                                value={addressForm.full_name}
                                onChange={handleAddressFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={addressForm.phone}
                                onChange={handleAddressFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              Address Type
                            </label>
                            <select
                              name="type"
                              value={addressForm.type}
                              onChange={handleAddressFormChange}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                            >
                              <option value="shipping">Shipping</option>
                              <option value="billing">Billing</option>
                            </select>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              Street Address
                            </label>
                            <input
                              type="text"
                              name="street"
                              value={addressForm.street}
                              onChange={handleAddressFormChange}
                              required
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={addressForm.city}
                                onChange={handleAddressFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                name="state"
                                value={addressForm.state}
                                onChange={handleAddressFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                                Postal Code
                              </label>
                              <input
                                type="text"
                                name="postal_code"
                                value={addressForm.postal_code}
                                onChange={handleAddressFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                                Country
                              </label>
                              <input
                                type="text"
                                name="country"
                                value={addressForm.country}
                                onChange={handleAddressFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-navy"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-4">
                            <input
                              id="default-address"
                              name="is_default"
                              type="checkbox"
                              checked={addressForm.is_default}
                              onChange={(e) => setAddressForm(prev => ({...prev, is_default: e.target.checked}))}
                              className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 rounded"
                            />
                            <label htmlFor="default-address" className="ml-2 block text-sm text-gray-700 dark:text-soft-gray">
                              Set as default address
                            </label>
                          </div>
                          
                          <div className="flex justify-end space-x-4">
                            <button
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn-primary"
                            >
                              Add Address
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Payment Method Section */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-neon-blue" />
                  Payment Method
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {/* COD Option */}
                  <div 
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      paymentMethod === 'cod' 
                        ? 'border-neon-blue dark:border-neon-blue bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Cash on Delivery
                        </p>
                        <p className="text-sm text-gray-600 dark:text-soft-gray">
                          Pay when your order is delivered
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Prepaid Options (Coming Soon) */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-60 cursor-not-allowed">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        disabled
                        className="h-4 w-4 text-gray-400 focus:ring-gray-400 border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                          Credit/Debit Card <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded ml-2">Coming Soon</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-soft-gray">
                          Pay securely using your card
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-60 cursor-not-allowed">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        disabled
                        className="h-4 w-4 text-gray-400 focus:ring-gray-400 border-gray-300"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                          UPI <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded ml-2">Coming Soon</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-soft-gray">
                          Pay using UPI apps like Google Pay, PhonePe, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6 sticky top-28">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-dark-navy">
                        {item.product.image && (
                          <img 
                            src={item.product.image} 
                            alt={item.product.name} 
                            className="h-full w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{((item.product.discount_price || item.product.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-soft-gray">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">₹{cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-soft-gray">Shipping</span>
                  <span className="text-gray-900 dark:text-white">Free</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-neon-blue">₹{cart.total.toLocaleString()}</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || !paymentMethod || orderLoading}
                className={`w-full btn-primary mt-6 flex items-center justify-center ${
                  (!selectedAddressId || !paymentMethod) ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {orderLoading ? (
                  <LoaderSpinner size="sm" color="blue" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Place Order
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;