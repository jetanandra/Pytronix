import { supabase } from '../lib/supabaseClient';
import { Profile, Address, Wishlist, UserPreferences } from '../types';

// Profile functions
export const getProfile = async (): Promise<Profile | null> => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    if (!userData?.user?.id) {
      console.log('No user is currently logged in');
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
  } catch (error) {
    console.error('Unexpected error in getProfile:', error);
    return null;
  }
};

export const updateProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
    if (!userData?.user?.id) {
      throw new Error('No user ID found.');
    }
    
    const userId = userData.user.id;
    const email = userData.user.email;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profile, email })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Encourage users to set their full name if not set
    if (!data.full_name) {
      import('react-hot-toast').then(({ toast }) => {
        toast('Please set your full name in your profile for a better experience!', { icon: 'ℹ️' });
      });
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
};

// Address functions
export const getAddresses = async (): Promise<Address[]> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return [];
    }
    
    if (!userData?.user?.id) {
      console.log('No user is currently logged in');
      return [];
    }
    
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAddresses:', error);
    return [];
  }
};

export const addAddress = async (address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    if (!userData?.user?.id) {
      throw new Error('No user ID found.');
    }
    const userId = userData.user.id;
    // Add the user_id to the address object
    const addressWithUserId = {
      ...address,
      user_id: userId,
      name: address.name,
      phone: address.phone
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
  } catch (error) {
    console.error('Error in addAddress:', error);
    throw error;
  }
};

export const updateAddress = async (id: string, address: Partial<Address>): Promise<Address> => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .update({
        ...address,
        name: address.name,
        phone: address.phone
      })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating address:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in updateAddress:', error);
    throw error;
  }
};

export const deleteAddress = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteAddress:', error);
    throw error;
  }
};

// Wishlist functions
export const getWishlist = async (): Promise<Wishlist[]> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return [];
    }
    
    if (!userData?.user?.id) {
      console.log('No user is currently logged in');
      return [];
    }
    
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWishlist:', error);
    return [];
  }
};

export const addToWishlist = async (productId: string, priority: number = 0, notes: string = ''): Promise<Wishlist> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
    if (!userData?.user?.id) {
      throw new Error('No user ID found.');
    }
    
    const { data, error } = await supabase
      .from('wishlists')
      .insert([{
        product_id: productId,
        user_id: userData.user.id,
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
  } catch (error) {
    console.error('Error in addToWishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId: string): Promise<void> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
    if (!userData?.user?.id) {
      throw new Error('No user ID found.');
    }
    
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in removeFromWishlist:', error);
    throw error;
  }
};

export const updateWishlistItem = async (
  productId: string, 
  updates: { priority?: number, notes?: string }
): Promise<Wishlist> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
    if (!userData?.user?.id) {
      throw new Error('No user ID found.');
    }
    
    const { data, error } = await supabase
      .from('wishlists')
      .update(updates)
      .eq('product_id', productId)
      .eq('user_id', userData.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating wishlist item:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateWishlistItem:', error);
    throw error;
  }
};

// User preferences functions
export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    if (!userData?.user?.id) {
      console.log('No user is currently logged in');
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
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
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
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    throw error;
  }
};

// Get all profile data at once (for initial load)
export const getUserProfileData = async () => {
  try {
    // Check if user is logged in first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      // Return empty data instead of throwing an error when there's no session
      return {
        profile: null,
        addresses: [],
        wishlist: [],
        preferences: null
      };
    }
    
    if (!userData?.user?.id) {
      console.log('No user is currently logged in');
      return {
        profile: null,
        addresses: [],
        wishlist: [],
        preferences: null
      };
    }
    
    // Only try to fetch profile data if we have a valid user
    try {
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
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return {
        profile: null,
        addresses: [],
        wishlist: [],
        preferences: null
      };
    }
  } catch (error) {
    console.error('Error in getUserProfileData:', error);
    return {
      profile: null,
      addresses: [],
      wishlist: [],
      preferences: null
    };
  }
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

// Delete user account and all related data
export const deleteUserAccount = async (): Promise<void> => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData?.user?.id) throw new Error('No user ID found.');
    const userId = userData.user.id;

    // Delete related data (order matters for foreign keys)
    await supabase.from('addresses').delete().eq('user_id', userId);
    await supabase.from('wishlists').delete().eq('user_id', userId);
    await supabase.from('user_preferences').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('id', userId);

    // Delete user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};