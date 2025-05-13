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
        profiles!user_id(
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
        profiles!user_id(
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
    
    // Create the review
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([{
        ...review,
        user_id: userData.user.id,
        helpful_votes: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    // After creating review, call the stored function to update the product's rating
    await updateProductRating(review.product_id);

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
    // Get the review to get the product_id
    const { data: reviewData, error: reviewError } = await supabase
      .from('product_reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();
      
    if (reviewError) {
      console.error('Error getting review:', reviewError);
      throw reviewError;
    }
    
    // Update the review
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

    // After updating review, update the product's rating
    await updateProductRating(reviewData.product_id);

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
    // Get the review to get the product_id
    const { data: reviewData, error: reviewError } = await supabase
      .from('product_reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();
      
    if (reviewError) {
      console.error('Error getting review:', reviewError);
      throw reviewError;
    }
    
    // Delete the review
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }

    // After deleting review, update the product's rating
    await updateProductRating(reviewData.product_id);
  } catch (error) {
    console.error('Error in deleteReview:', error);
    throw error;
  }
};

/**
 * Update product rating based on reviews
 */
export const updateProductRating = async (productId: string): Promise<void> => {
  try {
    // Call the RPC function to update product rating
    const { error } = await supabase
      .rpc('update_product_rating_manually', {
        product_id_param: productId
      });
    
    if (error) {
      console.error('Error updating product rating:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateProductRating:', error);
    // Don't throw - this shouldn't stop the review process
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