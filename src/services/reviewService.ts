import { supabase } from '../lib/supabaseClient';
import { ProductReview } from '../types';
import { toast } from 'react-hot-toast';

/**
 * Get all reviews for a product
 */
export const getProductReviews = async (productId: string): Promise<ProductReview[]> => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user:user_id(
          id,
          full_name,
          profile_picture
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    return [];
  }
};

/**
 * Get all reviews for admin management
 */
export const getAllReviews = async (): Promise<ProductReview[]> => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        user:user_id(
          id,
          full_name,
          profile_picture
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllReviews:', error);
    return [];
  }
};

/**
 * Get a user's review for a specific product
 */
export const getUserReviewForProduct = async (productId: string): Promise<ProductReview | null> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user?.id) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserReviewForProduct:', error);
    return null;
  }
};

/**
 * Create a new review
 */
export const createReview = async (review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at' | 'helpful_votes' | 'user'>): Promise<ProductReview> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
    if (!userData?.user?.id) {
      throw new Error('No user ID found.');
    }
    
    // Check if user already has a review for this product
    const existingReview = await getUserReviewForProduct(review.product_id);
    if (existingReview) {
      throw new Error('You have already reviewed this product. You can edit your existing review.');
    }
    
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([{
        ...review,
        user_id: userData.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
  }
};

/**
 * Update an existing review
 */
export const updateReview = async (reviewId: string, updates: Partial<ProductReview>): Promise<ProductReview> => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateReview:', error);
    throw error;
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteReview:', error);
    throw error;
  }
};

/**
 * Increment the helpful votes for a review
 */
export const voteReviewHelpful = async (reviewId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_review_helpful_votes', {
      review_id: reviewId
    });

    if (error) {
      console.error('Error voting review as helpful:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in voteReviewHelpful:', error);
    throw error;
  }
};

/**
 * Check if a user has purchased a product (for verified reviews)
 */
export const checkVerifiedPurchase = async (productId: string): Promise<boolean> => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user?.id) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        order_id,
        orders!inner(status)
      `)
      .eq('product_id', productId)
      .eq('orders.user_id', userData.user.id)
      .eq('orders.status', 'delivered')
      .limit(1);

    if (error) {
      console.error('Error checking verified purchase:', error);
      return false;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('Error in checkVerifiedPurchase:', error);
    return false;
  }
};