import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Phone, MapPin, CreditCard, Truck, Check, AlertTriangle } from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { createOrder, createRazorpayOrder } from '../services/orderService';
import { Address, Order } from '../types';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';

interface FormState {
  name: string;
  email: string;
  phone: string;
  selectedAddressId: string;
  paymentMethod: 'razorpay' | 'cod';
}

interface OrderData {
  orderId: string;
  total: number;
}

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses, loading: profileLoading } = useProfile();
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: user?.email || '',
    phone: '',
    selectedAddressId: '',
    paymentMethod: 'razorpay'
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [razorpayOrder, setRazorpayOrder] = useState<Order | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cart.items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
    
    // Pre-select the default shipping address if available
    const defaultAddress = addresses.find(addr => addr.is_default && addr.type === 'shipping');
    if (defaultAddress && !formState.selectedAddressId) {
      setFormState(prev => ({
        ...prev,
        selectedAddressId: defaultAddress.id,
        name: defaultAddress.street.split(',')[0] || '', // Use first line of address as name if available
      }));
    }
  }, [cart.items, addresses, navigate, orderComplete, formState.selectedAddressId]);
  
  // Update selected address when selectedAddressId changes
  useEffect(() => {
    if (formState.selectedAddressId) {
      const address = addresses.find(addr => addr.id === formState.selectedAddressId);
      setSelectedAddress(address || null);
    } else {
      setSelectedAddress(null);
    }
  }, [formState.selectedAddressId, addresses]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddressChange = (id: string) => {
    setFormState(prev => ({
      ...prev,
      selectedAddressId: id
    }));
  };
  
  const handlePaymentMethodChange = (method: 'razorpay' | 'cod') => {
    setFormState(prev => ({
      ...prev,
      paymentMethod: method
    }));
    // Clear any previous payment errors when changing payment method
    setPaymentError(null);
  };
  
  const validateForm = (): boolean => {
    if (!formState.name) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formState.email) {
      toast.error('Please enter your email');
      return false;
    }
    if (!formState.phone) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!formState.selectedAddressId) {
      toast.error('Please select a shipping address');
      return false;
    }
    return true;
  };
  
  const handleRazorpaySuccess = () => {
    clearCart();
    setOrderComplete(true);
    toast.success('Payment successful! Your order has been placed.');
  };
  
  const handleRazorpayCancel = () => {
    setRazorpayOrder(null);
    setLoading(false);
    setPaymentError('Payment was cancelled. Please try again.');
    toast.error('Payment was cancelled. Please try again.');
  };
  
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    if (!user) {
      toast.error('You must be logged in to place an order');
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      setPaymentError(null);
      
      // Order details for database
      const orderDetails = {
        user_id: user.id,
        total: cart.total,
        shipping_address: {
          ...selectedAddress,
          full_name: formState.name,
          phone: formState.phone
        },
        payment_details: {
          method: formState.paymentMethod,
          status: 'pending'
        },
        status: 'pending'
      };
      
      // Create order in database
      try {
        const { id } = await createOrder(orderDetails);
        setOrderData({
          orderId: id,
          total: cart.total
        });
        
        // Handle payment method
        if (formState.paymentMethod === 'razorpay') {
          try {
            // Create Razorpay order
            console.log('Attempting to create Razorpay order for amount:', cart.total);
            const razorpayData = await createRazorpayOrder(id, cart.total);
            
            if (!razorpayData || !razorpayData.id) {
              console.error('Razorpay response missing order ID:', razorpayData);
              throw new Error('Invalid response from payment gateway');
            }
            
            console.log('Razorpay order created successfully:', razorpayData.id);
            
            // Set the Razorpay order with needed information for the component
            setRazorpayOrder({
              id: id,
              total: cart.total,
              payment_details: {
                razorpay_order_id: razorpayData.id,
                razorpay_key: razorpayData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_89CCL7nHE71FCf'
              },
              shipping_address: {
                full_name: formState.name,
                phone: formState.phone,
                ...selectedAddress
              }
            } as Order);
            
          } catch (error) {
            console.error('Razorpay order creation error:', error);
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Unknown payment gateway error';
              
            setPaymentError(`Payment setup failed: ${errorMessage}. Please try again or choose Cash on Delivery.`);
            setLoading(false);
            toast.error('Payment gateway error. Please try Cash on Delivery instead.');
          }
        } else {
          // COD flow
          clearCart();
          setOrderComplete(true);
          toast.success('Order placed successfully! You will pay on delivery.');
        }
      } catch (error) {
        console.error('Error creating order:', error);
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to create order';
          
        toast.error('Error creating order: ' + errorMessage);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to place order';
        
      toast.error('Error placing order: ' + errorMessage);
      setLoading(false);
    }
  };
  
  // Loader
  if (profileLoading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  // Order success
  if (orderComplete) {
    return (
      <div className="min-h-screen pt-32 pb-12">
        <div className="container-custom">
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Order Placed Successfully!
              </h1>
              <p className="text-gray-600 dark:text-soft-gray mb-6">
                {orderData?.orderId && `Order ID: ${orderData.orderId.substring(0, 8)}`}
              </p>
              <p className="text-gray-600 dark:text-soft-gray mb-8">
                Thank you for your purchase. We'll process your order soon.
                {formState.paymentMethod === 'cod' && ' You will pay ₹' + cart.total.toLocaleString() + ' on delivery.'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="btn-secondary"
                >
                  Return Home
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="btn-primary"
                >
                  View Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render Razorpay checkout if order is created
  if (razorpayOrder) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 max-w-lg w-full">
          <h2 className="text-xl font-semibold text-center mb-6">
            Processing Payment
          </h2>
          <RazorpayCheckout 
            order={razorpayOrder} 
            onSuccess={handleRazorpaySuccess} 
            onCancel={handleRazorpayCancel} 
          />
          {paymentError && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">
                {paymentError}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setRazorpayOrder(null)}
                  className="btn-secondary mr-2"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setRazorpayOrder(null);
                    setFormState(prev => ({...prev, paymentMethod: 'cod'}));
                  }}
                  className="btn-primary"
                >
                  Pay on Delivery Instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Checkout
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {/* Customer Information */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Customer Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Phone Number*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>
            
            {/* Shipping Address */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <MapPin className="w-5 h-5 text-neon-blue mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Shipping Address
                </h2>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center bg-gray-50 dark:bg-dark-navy rounded-lg p-6 mb-4">
                  <p className="text-gray-600 dark:text-soft-gray mb-4">
                    You don't have any saved addresses. Please add an address to continue.
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="btn-primary"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses
                    .filter(addr => addr.type === 'shipping')
                    .map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition ${
                          formState.selectedAddressId === address.id
                            ? 'border-neon-blue dark:border-neon-blue bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => handleAddressChange(address.id)}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            id={`address-${address.id}`}
                            name="selectedAddress"
                            checked={formState.selectedAddressId === address.id}
                            onChange={() => handleAddressChange(address.id)}
                            className="mt-1 h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {address.street}
                            </p>
                            <p className="text-gray-600 dark:text-soft-gray">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-gray-600 dark:text-soft-gray">
                              {address.country}
                            </p>
                            {address.is_default && (
                              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-neon-blue hover:text-blue-700 text-sm font-medium"
                  >
                    + Add New Address
                  </button>
                </div>
              )}
            </div>
            
            {/* Payment Method */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-6">
                <CreditCard className="w-5 h-5 text-neon-blue mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Payment Method
                </h2>
              </div>
              
              <div className="space-y-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    formState.paymentMethod === 'razorpay'
                      ? 'border-neon-blue dark:border-neon-blue bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handlePaymentMethodChange('razorpay')}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id="razorpay"
                      name="paymentMethod"
                      checked={formState.paymentMethod === 'razorpay'}
                      onChange={() => handlePaymentMethodChange('razorpay')}
                      className="mt-1 h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300"
                    />
                    <div className="ml-3">
                      <label htmlFor="razorpay" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                        Pay with Razorpay
                      </label>
                      <p className="text-sm text-gray-600 dark:text-soft-gray">
                        Pay securely with credit/debit cards, UPI, etc.
                      </p>
                      <div className="flex mt-2 space-x-2">
                        <img src="https://cdn.razorpay.com/logos/visa.png" alt="Visa" className="h-6" />
                        <img src="https://cdn.razorpay.com/logos/mastercard.png" alt="Mastercard" className="h-6" />
                        <img src="https://cdn.razorpay.com/logos/upi.png" alt="UPI" className="h-6" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    formState.paymentMethod === 'cod'
                      ? 'border-neon-blue dark:border-neon-blue bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handlePaymentMethodChange('cod')}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      checked={formState.paymentMethod === 'cod'}
                      onChange={() => handlePaymentMethodChange('cod')}
                      className="mt-1 h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300"
                    />
                    <div className="ml-3">
                      <label htmlFor="cod" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                        Cash on Delivery
                      </label>
                      <p className="text-sm text-gray-600 dark:text-soft-gray">
                        Pay when you receive your order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {paymentError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                Order Summary
              </h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-navy overflow-hidden flex-shrink-0 mr-3">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {product.name.length > 25 
                            ? product.name.substring(0, 25) + '...' 
                            : product.name
                          }
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          Qty: {quantity}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      ₹{((product.discount_price || product.price) * quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between py-2 text-gray-600 dark:text-soft-gray">
                  <span>Subtotal</span>
                  <span>₹{cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-600 dark:text-soft-gray">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between py-2 text-gray-600 dark:text-soft-gray">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-neon-blue">₹{cart.total.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || addresses.length === 0 || !formState.selectedAddressId}
                className={`w-full btn-primary mt-8 ${
                  (loading || addresses.length === 0 || !formState.selectedAddressId) 
                    ? 'opacity-60 cursor-not-allowed'
                    : ''
                }`}
              >
                {loading ? (
                  <LoaderSpinner size="sm" color="blue" />
                ) : (
                  'Place Order'
                )}
              </button>
              
              {/* Warning if no address */}
              {addresses.length === 0 && (
                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 mr-2" />
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Please add a shipping address in your profile to continue with checkout.
                  </p>
                </div>
              )}
              
              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-navy rounded-lg">
                <div className="flex items-start">
                  <Truck className="w-5 h-5 text-neon-blue mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600 dark:text-soft-gray">
                    <p className="font-medium">Express Shipping</p>
                    <p className="mt-1">Delivery within 2-3 working days after payment confirmation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;