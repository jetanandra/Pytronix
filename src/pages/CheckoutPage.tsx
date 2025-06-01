import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { Phone, MapPin, CreditCard, Truck, Check, AlertTriangle, X, Plus, Calendar, InfoIcon } from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { createOrder, createRazorpayOrder } from '../services/orderService';
import { Address, Order } from '../types';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';
import { motion, AnimatePresence } from 'framer-motion';

interface FormState {
  selectedAddressId: string;
  paymentMethod: 'razorpay' | 'cod';
}

interface OrderData {
  orderId: string;
  total: number;
}

interface NewAddressFormState {
  full_name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  type: 'shipping' | 'billing';
  is_default: boolean;
}

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { addresses, loading: profileLoading, addUserAddress } = useProfile();
  const [formState, setFormState] = useState<FormState>({
    selectedAddressId: '',
    paymentMethod: 'razorpay'
  });
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [razorpayOrder, setRazorpayOrder] = useState<Order | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [addingAddress, setAddingAddress] = useState<boolean>(false);
  const [newAddressForm, setNewAddressForm] = useState<NewAddressFormState>({
    full_name: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
    type: 'shipping',
    is_default: false
  });
  
  // Calculate shipping fee
  const FREE_SHIPPING_THRESHOLD = 1499;
  const SHIPPING_FEE = 99;
  const qualifiesForFreeShipping = cart.total >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = qualifiesForFreeShipping ? 0 : SHIPPING_FEE;
  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.total);
  const progressPercentage = Math.min(100, (cart.total / FREE_SHIPPING_THRESHOLD) * 100);

  // Calculate expected delivery date
  const getExpectedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Add 7 days
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
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
  
  const handleNewAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setNewAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateForm = (): boolean => {
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
  
  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newAddressForm.full_name || !newAddressForm.street || !newAddressForm.city || 
        !newAddressForm.state || !newAddressForm.postal_code || !newAddressForm.phone) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setAddingAddress(true);
      await addUserAddress({
        name: newAddressForm.full_name,
        phone: newAddressForm.phone,
        type: newAddressForm.type,
        street: newAddressForm.street,
        city: newAddressForm.city,
        state: newAddressForm.state,
        postal_code: newAddressForm.postal_code,
        country: newAddressForm.country,
        is_default: newAddressForm.is_default,
      });
      
      toast.success('Address added successfully');
      setShowAddressModal(false);
      
      // Get the newly added address and update form state
      setTimeout(() => {
        const newDefaultAddress = addresses.find(a => 
          a.street === newAddressForm.street && 
          a.city === newAddressForm.city
        );
        
        if (newDefaultAddress) {
          setFormState(prev => ({
            ...prev,
            selectedAddressId: newDefaultAddress.id,
            name: newAddressForm.full_name,
            phone: newAddressForm.phone
          }));
        }
      }, 500);
      
      // Reset form
      setNewAddressForm({
        full_name: '',
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        phone: '',
        type: 'shipping',
        is_default: false
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setAddingAddress(false);
    }
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
      
      const finalTotal = cart.total + shippingFee;
      
      // Order details for database
      const orderDetails = {
        user_id: user.id,
        total: finalTotal,
        shipping_address: {
          ...selectedAddress,
          full_name: selectedAddress?.name || '',
          phone: selectedAddress?.phone || ''
        },
        email: user.email,
        payment_details: {
          method: formState.paymentMethod,
          status: 'pending',
          shipping_fee: shippingFee
        },
        status: 'pending'
      };
      
      // Create order in database
      try {
        const { id } = await createOrder(orderDetails, cart.items);
        setOrderData({
          orderId: id,
          total: finalTotal
        });
        
        // Handle payment method
        if (formState.paymentMethod === 'razorpay') {
          try {
            // Create Razorpay order
            console.log('Attempting to create Razorpay order for amount:', finalTotal);
            const razorpayData = await createRazorpayOrder(id, finalTotal);
            
            if (!razorpayData || !razorpayData.id) {
              console.error('Razorpay response missing order ID:', razorpayData);
              throw new Error('Invalid response from payment gateway');
            }
            
            console.log('Razorpay order created successfully:', razorpayData.id);
            
            // Set the Razorpay order with needed information for the component
            setRazorpayOrder({
              id: id,
              total: finalTotal,
              payment_details: {
                razorpay_order_id: razorpayData.id,
                razorpay_key: razorpayData.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_89CCL7nHE71FCf',
                shipping_fee: shippingFee
              },
              shipping_address: {
                full_name: selectedAddress?.name || '',
                phone: selectedAddress?.phone || '',
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
    const finalTotal = cart.total + shippingFee;
    
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
                {formState.paymentMethod === 'cod' && ` You will pay ₹${finalTotal.toLocaleString()} on delivery.`}
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
            {/* Shipping Address */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-6 mb-8 mt-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-neon-blue mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Shipping Address
                  </h2>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center text-sm text-neon-blue hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New Address
                </button>
              </div>
              
              {addresses.length === 0 ? (
                <div className="text-center bg-gray-50 dark:bg-dark-navy rounded-lg p-6 mb-4">
                  <p className="text-gray-600 dark:text-soft-gray mb-4">
                    You don't have any saved addresses. Please add an address to continue.
                  </p>
                  <button
                    onClick={() => setShowAddressModal(true)}
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
                            ? 'border-neon-blue dark:border-neon-blue bg-blue-50 dark:bg-blue-900/20 shadow-lg'
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
                            {address.name && (
                              <p className="font-bold text-gray-900 dark:text-white">{address.name}</p>
                            )}
                            <p className="font-medium text-gray-900 dark:text-white">
                              {address.street}
                            </p>
                            <p className="text-gray-600 dark:text-soft-gray">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            <p className="text-gray-600 dark:text-soft-gray">
                              {address.country}
                            </p>
                            {address.phone && (
                              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{address.phone}</p>
                            )}
                            {address.is_default && (
                              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* Show Customer Information only if a shipping address is selected */}
            {selectedAddress && (
              <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-6 mb-8 animate-fade-in">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                  Customer Information
                </h2>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-800 dark:text-blue-200 text-sm flex items-center">
                  <InfoIcon className="w-5 h-5 mr-2 text-blue-400 dark:text-blue-300" />
                  No need to enter these details. Your name, phone number, and email are automatically fetched from your selected address and profile.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Full Name
                    </label>
                    <div className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {selectedAddress?.name || <span className="text-gray-400">No name</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Email
                    </label>
                    <div className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
                      {user?.email || <span className="text-gray-400">No email</span>}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Phone Number
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-100 dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
                    {selectedAddress?.phone || <span className="text-gray-400">No phone</span>}
                  </div>
                </div>
              </div>
            )}
            
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
                    <div className="ml-3 w-full">
                      <label htmlFor="razorpay" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                        Pay with Razorpay
                      </label>
                      <p className="text-sm text-gray-600 dark:text-soft-gray">
                        Pay securely with credit/debit cards, UPI, etc.
                      </p>
                      <div className="flex flex-wrap items-center justify-start gap-2 mt-3 md:gap-4 md:flex-nowrap">
                        <img src="/public/fonts/upi-logo.png" alt="UPI" className="h-7 w-12 object-contain rounded bg-white shadow-sm border border-gray-200" style={{maxWidth:'48px'}} />
                        <img src="/public/fonts/visa-logo.png" alt="Visa" className="h-7 w-12 object-contain rounded bg-white shadow-sm border border-gray-200" style={{maxWidth:'48px'}} />
                        <img src="/public/fonts/mastercard-logo.png" alt="Mastercard" className="h-7 w-12 object-contain rounded bg-white shadow-sm border border-gray-200" style={{maxWidth:'48px'}} />
                      </div>
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
              
              {/* Free Shipping Banner */}
              {!qualifiesForFreeShipping && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                    Add ₹{amountForFreeShipping.toLocaleString()} more for FREE Delivery
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div 
                      className="bg-neon-blue h-2 rounded-full" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Free delivery on orders above ₹{FREE_SHIPPING_THRESHOLD}
                  </p>
                </div>
              )}
              
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between py-2 text-gray-600 dark:text-soft-gray">
                  <span>Subtotal</span>
                  <span>₹{cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-gray-600 dark:text-soft-gray">
                  <span>Shipping</span>
                  {qualifiesForFreeShipping ? (
                    <span className="text-green-600 dark:text-green-400">Free</span>
                  ) : (
                    <span>₹{SHIPPING_FEE}</span>
                  )}
                </div>
                <div className="flex justify-between py-2 text-gray-600 dark:text-soft-gray">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-neon-blue">₹{(cart.total + shippingFee).toLocaleString()}</span>
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
                    Please add a shipping address to continue with checkout.
                  </p>
                </div>
              )}
              
              {/* Delivery Info */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-navy rounded-lg">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-neon-blue mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600 dark:text-soft-gray">
                    <p className="font-medium">Express Shipping</p>
                    <p className="mt-1">Delivery within 7-8 working days after payment confirmation.</p>
                    <p className="mt-1 font-medium">Expected Delivery: {getExpectedDeliveryDate()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-light-navy rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add New Address
                </h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddNewAddress} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={newAddressForm.full_name}
                    onChange={handleNewAddressInputChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newAddressForm.phone}
                    onChange={handleNewAddressInputChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Street Address*
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={newAddressForm.street}
                    onChange={handleNewAddressInputChange}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newAddressForm.city}
                      onChange={handleNewAddressInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      State*
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={newAddressForm.state}
                      onChange={handleNewAddressInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      PIN Code*
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={newAddressForm.postal_code}
                      onChange={handleNewAddressInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Country*
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={newAddressForm.country}
                      onChange={handleNewAddressInputChange}
                      required
                      className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Address Type
                  </label>
                  <select
                    name="type"
                    value={newAddressForm.type}
                    onChange={handleNewAddressInputChange}
                    className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="shipping">Shipping</option>
                    <option value="billing">Billing</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={newAddressForm.is_default}
                    onChange={handleNewAddressInputChange}
                    className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 rounded"
                  />
                  <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700 dark:text-soft-gray">
                    Set as default address
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingAddress}
                    className="btn-primary"
                  >
                    {addingAddress ? (
                      <LoaderSpinner size="sm" color="blue" />
                    ) : (
                      'Save Address'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;