import { supabase } from '../lib/supabaseClient';
import { Profile, Address, Wishlist, UserPreferences } from '../types';

// Profile functions
export const getProfile = async (): Promise<Profile | null> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    console.error('No user ID found.');
    return null;
  }
  
  const userId = userData.user.id;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // If profile doesn't exist for user, return null instead of throwing error
    if (error.code === 'PGRST116') {
      console.warn('No profile found for user, returning null');
      return null;
    }
    console.error('Error fetching profile:', error);
    throw error;
  }

  return profile;
};

export const updateProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error('No user ID found.');
  }
  
  const userId = userData.user.id;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data;
};

// Address functions
export const getAddresses = async (): Promise<Address[]> => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('is_default', { ascending: false });

  if (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }

  return data || [];
};

export const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error('No user ID found.');
  }
  
  const userId = userData.user.id;
  
  // Add the user_id to the address object
  const addressWithUserId = {
    ...address,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('addresses')
    .insert([addressWithUserId])
    .select()
    .single();

  if (error) {
    console.error('Error adding address:', error);
    throw error;
  }

  return data;
};

export const updateAddress = async (id: string, address: Partial<Address>): Promise<Address> => {
  const { data, error } = await supabase
    .from('addresses')
    .update(address)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating address:', error);
    throw error;
  }

  return data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Wishlist functions
export const getWishlist = async (): Promise<Wishlist[]> => {
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

export const addToWishlist = async (productId: string, priority: number = 0, notes: string = ''): Promise<Wishlist> => {
  const { data, error } = await supabase
    .from('wishlists')
    .insert([{
      product_id: productId,
      priority,
      notes
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }

  return data;
};

export const removeFromWishlist = async (productId: string): Promise<void> => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const updateWishlistItem = async (
  productId: string, 
  updates: { priority?: number, notes?: string }
): Promise<Wishlist> => {
  const { data, error } = await supabase
    .from('wishlists')
    .update(updates)
    .eq('product_id', productId)
    .select()
    .single();

  if (error) {
    console.error('Error updating wishlist item:', error);
    throw error;
  }

  return data;
};

// User preferences functions
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    console.error('No user ID found.');
    return null;
  }
  
  const userId = userData.user.id;
  
  // Try to get existing preferences
  let { data: preferences, error: selectError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('id', userId)
    .single();
  
  // If no preferences found, create default ones
  if (selectError && selectError.code === 'PGRST116') {
    // Create default preferences
    const { data: newPreferences, error: insertError } = await supabase
      .from('user_preferences')
      .insert([{ 
        id: userId, 
        theme: 'dark', 
        email_notifications: true 
      }])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating default user preferences:', insertError);
      throw insertError;
    }
    
    preferences = newPreferences;
  } else if (selectError) {
    console.error('Error fetching user preferences:', selectError);
    throw selectError;
  }
  
  return preferences;
};

export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData?.user?.id) {
    throw new Error('No user ID found.');
  }
  
  const userId = userData.user.id;
  
  const { data, error } = await supabase
    .from('user_preferences')
    .update(preferences)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }

  return data;
};

// Get all profile data at once (for initial load)
export const getUserProfileData = async () => {
  const [profile, addresses, wishlist, preferences] = await Promise.all([
    getProfile(),
    getAddresses(),
    getWishlist(),
    getUserPreferences()
  ]);

  return {
    profile,
    addresses,
    wishlist,
    preferences
  };
};

// Setup subscription for real-time updates
export const subscribeToWishlistChanges = (callback: (payload: any) => void) => {
  return supabase
    .channel('wishlist-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wishlists' },
      callback
    )
    .subscribe();
};