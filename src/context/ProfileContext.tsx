import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Profile, Address, Wishlist, UserPreferences } from '../types';
import { 
  getUserProfileData, 
  updateProfile, 
  addAddress, 
  updateAddress, 
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  updateUserPreferences,
  subscribeToWishlistChanges
} from '../services/profileService';
import toast from 'react-hot-toast';

interface ProfileContextType {
  profile: Profile | null;
  addresses: Address[];
  wishlist: Wishlist[];
  preferences: UserPreferences | null;
  loading: boolean;
  updateUserProfile: (data: Partial<Profile>) => Promise<void>;
  addUserAddress: (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUserAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteUserAddress: (id: string) => Promise<void>;
  addProductToWishlist: (productId: string, priority?: number, notes?: string) => Promise<void>;
  removeProductFromWishlist: (productId: string) => Promise<void>;
  updateWishlistItemDetails: (productId: string, updates: { priority?: number, notes?: string }) => Promise<void>;
  updateUserPrefs: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshProfileData: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user profile data
  const loadUserData = async () => {
    if (!user) {
      setProfile(null);
      setAddresses([]);
      setWishlist([]);
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserProfileData();
      setProfile(data.profile);
      setAddresses(data.addresses);
      setWishlist(data.wishlist);
      setPreferences(data.preferences);
    } catch (error) {
      console.error('Error loading user profile data:', error);
      toast.error('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for wishlist
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToWishlistChanges((payload) => {
      // Refresh wishlist data when changes occur
      refreshWishlist();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Load data when user changes
  useEffect(() => {
    loadUserData();
  }, [user]);

  // Profile operations
  const updateUserProfile = async (data: Partial<Profile>) => {
    try {
      setLoading(true);
      const updatedProfile = await updateProfile(data);
      setProfile(updatedProfile);
      toast.success('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Address operations
  const addUserAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      await addAddress(address);
      // Refresh addresses to get the updated list with the new address
      const updatedAddresses = await getAddresses();
      setAddresses(updatedAddresses);
      toast.success('Address added successfully.');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserAddress = async (id: string, address: Partial<Address>) => {
    try {
      setLoading(true);
      await updateAddress(id, address);
      // Update local state
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => addr.id === id ? { ...addr, ...address } : addr)
      );
      toast.success('Address updated successfully.');
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAddress = async (id: string) => {
    try {
      setLoading(true);
      await deleteAddress(id);
      // Update local state
      setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== id));
      toast.success('Address deleted successfully.');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Wishlist operations
  const refreshWishlist = async () => {
    try {
      const updatedWishlist = await getWishlist();
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    }
  };

  const addProductToWishlist = async (productId: string, priority = 0, notes = '') => {
    try {
      setLoading(true);
      await addToWishlist(productId, priority, notes);
      await refreshWishlist();
      toast.success('Product added to wishlist.');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add product to wishlist.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeProductFromWishlist = async (productId: string) => {
    try {
      setLoading(true);
      await removeFromWishlist(productId);
      // Update local state
      setWishlist(prevWishlist => prevWishlist.filter(item => item.product_id !== productId));
      toast.success('Product removed from wishlist.');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove product from wishlist.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateWishlistItemDetails = async (
    productId: string, 
    updates: { priority?: number, notes?: string }
  ) => {
    try {
      setLoading(true);
      await updateWishlistItem(productId, updates);
      // Update local state
      setWishlist(prevWishlist => 
        prevWishlist.map(item => 
          item.product_id === productId ? { ...item, ...updates } : item
        )
      );
      toast.success('Wishlist item updated.');
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      toast.error('Failed to update wishlist item.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // User preferences operations
  const updateUserPrefs = async (prefs: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      const updatedPreferences = await updateUserPreferences(prefs);
      setPreferences(updatedPreferences);
      toast.success('Preferences updated successfully.');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh all profile data
  const refreshProfileData = async () => {
    await loadUserData();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        addresses,
        wishlist,
        preferences,
        loading,
        updateUserProfile,
        addUserAddress,
        updateUserAddress,
        deleteUserAddress,
        addProductToWishlist,
        removeProductFromWishlist,
        updateWishlistItemDetails,
        updateUserPrefs,
        refreshProfileData
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

// Import function from profileService.ts that we need here
const getWishlist = async () => {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      product:products(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }

  return data || [];
};

// Import supabase client
import { supabase } from '../lib/supabaseClient';
import { getAddresses } from '../services/profileService';