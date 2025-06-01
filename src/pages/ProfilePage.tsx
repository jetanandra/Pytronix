import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Heart, MapPin, Lock, Phone, Mail, Save, Edit, Trash, Plus, AlertTriangle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { Product, Address } from '../types';
import ProductCard from '../components/product/ProductCard';
import { createTestNotification } from '../services/notificationService';

interface UserProfileFormState {
  fullName: string;
  phone: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AddressFormState {
  name: string;
  phone: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { 
    profile, 
    addresses, 
    wishlist, 
    loading, 
    updateUserProfile,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    removeProductFromWishlist,
    deleteUserAccount
  } = useProfile();
  
  const [activeTab, setActiveTab] = useState<'personal' | 'password' | 'addresses' | 'wishlist' | 'notifications'>('personal');
  
  // Form states
  const [profileForm, setProfileForm] = useState<UserProfileFormState>({
    fullName: '',
    phone: ''
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    name: '',
    phone: '',
    type: 'shipping',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });
  
  // UI states
  const [editMode, setEditMode] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const editSectionRef = useRef<HTMLDivElement>(null);
  
  const [wishlistState, setWishlistState] = useState(wishlist);
  useEffect(() => { setWishlistState(wishlist); }, [wishlist]);
  
  // Initialize profile form when profile data loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);
  
  // Show prompt if full_name or phone is missing
  useEffect(() => {
    if (profile && (!profile.full_name || !profile.phone)) {
      setShowProfilePrompt(true);
      // Optionally scroll to edit section
      setEditMode(true);
      setTimeout(() => {
        editSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [profile]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUserProfile({
        full_name: profileForm.fullName,
        phone: profileForm.phone
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error in profile update handler:', error);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      // Here we would use Supabase auth to update password
      // For now, just simulate success
      toast.success('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };
  
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addUserAddress(addressForm);
      setAddingAddress(false);
      resetAddressForm();
    } catch (error) {
      console.error('Error in add address handler:', error);
    }
  };
  
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAddressId) return;
    
    try {
      await updateUserAddress(editingAddressId, addressForm);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error in update address handler:', error);
    }
  };
  
  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteUserAddress(id);
      } catch (error) {
        console.error('Error in delete address handler:', error);
      }
    }
  };
  
  const handleEditAddress = (address: Address) => {
    setAddressForm({
      name: address.name || '',
      phone: address.phone || '',
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
    setEditingAddressId(address.id);
  };
  
  const resetAddressForm = () => {
    setAddressForm({
      name: '',
      phone: '',
      type: 'shipping',
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false
    });
  };
  
  const handleRemoveFromWishlist = async (productId: string) => {
    // Optimistically update local state
    setWishlistState(prev => prev.filter(item => item.product_id !== productId));
    try {
      await removeProductFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };
  
  // Add handler for account deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await deleteUserAccount();
      await signOut();
      toast.success('Your account has been deleted.');
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account.');
    }
  };

  // Handle creating a test notification
  const handleCreateTestNotification = async () => {
    try {
      await createTestNotification();
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast.error('Failed to create test notification');
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            Please sign in to view your profile.
          </p>
          <a href="/login" className="btn-primary">Sign In</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg overflow-hidden relative">
          {showProfilePrompt && (
            <div className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-6 py-4 text-center text-sm font-medium flex items-center justify-between">
              <span>
                Please complete your profile by providing your full name and phone number.
              </span>
              <button
                className="ml-4 px-3 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-300 dark:hover:bg-yellow-700"
                onClick={() => setShowProfilePrompt(false)}
              >
                Dismiss
              </button>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20 flex items-center justify-center z-10">
              <LoaderSpinner size="lg" color="blue" />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-1/4 bg-gray-50 dark:bg-dark-navy p-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-neon-blue/10 mx-auto rounded-full flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-neon-blue" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {profile?.full_name || user.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-gray-600 dark:text-soft-gray text-sm mt-1">
                  {user.email}
                </p>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'personal' 
                      ? 'bg-neon-blue text-white' 
                      : 'text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'password' 
                      ? 'bg-neon-blue text-white' 
                      : 'text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span>Change Password</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'addresses' 
                      ? 'bg-neon-blue text-white' 
                      : 'text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Addresses</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'wishlist' 
                      ? 'bg-neon-blue text-white' 
                      : 'text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'notifications' 
                      ? 'bg-neon-blue text-white' 
                      : 'text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button>
              </nav>
            </div>
            
            {/* Content Area */}
            <div className="md:w-3/4 p-6">
              {/* Personal Information */}
              {activeTab === 'personal' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center text-neon-blue hover:text-blue-600 transition"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditMode(false);
                          if (profile) {
                            setProfileForm({
                              fullName: profile.full_name || '',
                              phone: profile.phone || ''
                            });
                          }
                        }}
                        className="text-gray-600 dark:text-soft-gray hover:text-gray-800 dark:hover:text-white transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={handleUpdateProfile}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={user.email || ''}
                            disabled
                            className="pl-10 w-full px-4 py-2 bg-gray-100 dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Your email cannot be changed
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                          disabled={!editMode}
                          className={`w-full px-4 py-2 ${
                            editMode 
                              ? 'bg-white dark:bg-dark-navy border-gray-300 dark:border-gray-700' 
                              : 'bg-gray-100 dark:bg-dark-navy/50 text-gray-700 dark:text-gray-300'
                          } border rounded-lg`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                            disabled={!editMode}
                            className={`pl-10 w-full px-4 py-2 ${
                              editMode 
                                ? 'bg-white dark:bg-dark-navy border-gray-300 dark:border-gray-700' 
                                : 'bg-gray-100 dark:bg-dark-navy/50 text-gray-700 dark:text-gray-300'
                            } border rounded-lg`}
                          />
                        </div>
                      </div>
                      
                      {editMode && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="btn-primary flex items-center"
                            disabled={loading}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                  {/* Delete Account Button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                      onClick={handleDeleteAccount}
                      disabled={loading}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Account
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Change Password */}
              {activeTab === 'password' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Change Password
                  </h2>
                  
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                        className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                        minLength={6}
                        className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Password must be at least 6 characters
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                        minLength={6}
                        className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
              
              {/* Addresses */}
              {activeTab === 'addresses' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Addresses
                    </h2>
                    
                    {!addingAddress && !editingAddressId && (
                      <button
                        onClick={() => setAddingAddress(true)}
                        className="btn-primary flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Address
                      </button>
                    )}
                  </div>
                  
                  {addingAddress && (
                    <div className="mb-8 bg-gray-50 dark:bg-dark-navy p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Add New Address
                      </h3>
                      
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                            required
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                            required
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Address Type
                          </label>
                          <select
                            value={addressForm.type}
                            onChange={(e) => setAddressForm({...addressForm, type: e.target.value as 'shipping' | 'billing'})}
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          >
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                            required
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={addressForm.postal_code}
                              onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              Country
                            </label>
                            <input
                              type="text"
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="default-address"
                            type="checkbox"
                            checked={addressForm.is_default}
                            onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                            className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 rounded"
                          />
                          <label htmlFor="default-address" className="ml-2 block text-sm text-gray-700 dark:text-soft-gray">
                            Set as default address
                          </label>
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setAddingAddress(false);
                              resetAddressForm();
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60"
                          >
                            Cancel
                          </button>
                          
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                          >
                            Add Address
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {editingAddressId && (
                    <div className="mb-8 bg-gray-50 dark:bg-dark-navy p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Edit Address
                      </h3>
                      
                      <form onSubmit={handleUpdateAddress} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                            required
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                            required
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Address Type
                          </label>
                          <select
                            value={addressForm.type}
                            onChange={(e) => setAddressForm({...addressForm, type: e.target.value as 'shipping' | 'billing'})}
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          >
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                            required
                            className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              value={addressForm.postal_code}
                              onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                              Country
                            </label>
                            <input
                              type="text"
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                              required
                              className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="default-address-edit"
                            type="checkbox"
                            checked={addressForm.is_default}
                            onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})}
                            className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300 rounded"
                          />
                          <label htmlFor="default-address-edit" className="ml-2 block text-sm text-gray-700 dark:text-soft-gray">
                            Set as default address
                          </label>
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddressId(null);
                              resetAddressForm();
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60"
                          >
                            Cancel
                          </button>
                          
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                          >
                            Update Address
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {addresses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Addresses Found
                      </h3>
                      <p className="text-gray-600 dark:text-soft-gray mb-6">
                        You haven't added any shipping addresses yet.
                      </p>
                      {!addingAddress && (
                        <button
                          onClick={() => setAddingAddress(true)}
                          className="btn-primary inline-flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Address
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div 
                          key={address.id}
                          className={`p-4 rounded-lg border ${
                            address.is_default 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                              : 'bg-white dark:bg-dark-navy border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          {address.is_default && (
                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                              {address.type === 'shipping' ? 'Default Shipping Address' : 'Default Billing Address'}
                            </div>
                          )}
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                            <div>
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
                              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {address.type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="p-2 text-blue-600 hover:text-blue-800 transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="p-2 text-red-600 hover:text-red-800 transition"
                                disabled={addresses.length === 1 && address.is_default}
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    My Wishlist
                  </h2>
                  
                  {wishlistState.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Your Wishlist is Empty
                      </h3>
                      <p className="text-gray-600 dark:text-soft-gray mb-6">
                        Items added to your wishlist will appear here.
                      </p>
                      <a href="/products" className="btn-primary">
                        Browse Products
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {wishlistState.map(item => (
                        <div key={item.id} className="relative group">
                          <button
                            onClick={() => handleRemoveFromWishlist(item.product_id)}
                            className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 dark:bg-dark-navy/80 rounded-full hover:bg-white dark:hover:bg-dark-navy text-red-500 hover:text-red-600 transition-all"
                            aria-label="Remove from wishlist"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          {item.product && <ProductCard product={item.product} />}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Notification Settings
                    </h2>
                  </div>

                  <div className="bg-white dark:bg-dark-navy p-6 rounded-lg shadow-sm mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Email Notifications
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Order Updates</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive emails about your order status</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                          <input
                            type="checkbox"
                            id="order-updates"
                            className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-6 checked:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue"
                            defaultChecked
                          />
                          <label
                            htmlFor="order-updates"
                            className="block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 dark:bg-gray-700 peer-checked:bg-neon-blue"
                          ></label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Promotions & Offers</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive emails about special offers and discounts</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                          <input
                            type="checkbox"
                            id="promotions"
                            className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-6 checked:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue"
                            defaultChecked
                          />
                          <label
                            htmlFor="promotions"
                            className="block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 dark:bg-gray-700 peer-checked:bg-neon-blue"
                          ></label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Account Activity</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive emails about account security and updates</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                          <input
                            type="checkbox"
                            id="account-activity"
                            className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-6 checked:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue"
                            defaultChecked
                          />
                          <label
                            htmlFor="account-activity"
                            className="block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 dark:bg-gray-700 peer-checked:bg-neon-blue"
                          ></label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-dark-navy p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Push Notifications
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Order Status</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications when your order status changes</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                          <input
                            type="checkbox"
                            id="order-status"
                            className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-6 checked:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue"
                            defaultChecked
                          />
                          <label
                            htmlFor="order-status"
                            className="block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 dark:bg-gray-700 peer-checked:bg-neon-blue"
                          ></label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Workshop Updates</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications about workshop requests and updates</p>
                        </div>
                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                          <input
                            type="checkbox"
                            id="workshop-updates"
                            className="absolute w-6 h-6 transition duration-200 ease-in-out transform bg-white border rounded-full appearance-none cursor-pointer peer border-gray-300 dark:border-gray-600 checked:translate-x-6 checked:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue"
                            defaultChecked
                          />
                          <label
                            htmlFor="workshop-updates"
                            className="block w-full h-full overflow-hidden rounded-full cursor-pointer bg-gray-300 dark:bg-gray-700 peer-checked:bg-neon-blue"
                          ></label>
                        </div>
                      </div>
                    </div>

                    {/* Test Notification Button */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Testing</h4>
                      <button
                        onClick={handleCreateTestNotification}
                        className="btn-secondary text-sm"
                      >
                        Send Test Notification
                      </button>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        This will create a test notification to verify your notification settings.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          <div ref={editSectionRef} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;