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
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }

    // For each review, try to get the user's profile
    const reviewsWithProfiles = await Promise.all(
      (data || []).map(async (review) => {
        if (review.user_id) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, profile_picture, email')
              .eq('id', review.user_id)
              .single();
              
            if (profileData) {
              return {
                ...review,
                user: {
                  ...review.user,
                  full_name: profileData.full_name,
                  profile_picture: profileData.profile_picture,
                  email: profileData.email
                }
              };
            }
          } catch (profileError) {
            console.error('Error fetching profile for review:', profileError);
          }
        }
        return review;
      })
    );

    return reviewsWithProfiles;
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
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }

    // For each review, try to get the user's profile
    const reviewsWithProfiles = await Promise.all(
      (data || []).map(async (review) => {
        if (review.user_id) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, profile_picture, email')
              .eq('id', review.user_id)
              .single();
              
            if (profileData) {
              return {
                ...review,
                user: {
                  ...review.user,
                  full_name: profileData.full_name,
                  profile_picture: profileData.profile_picture,
                  email: profileData.email
                }
              };
            }
          } catch (profileError) {
            console.error('Error fetching profile for review:', profileError);
          }
        }
        return review;
      })
    );

    return reviewsWithProfiles;
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
      .single();

    if (error) {
      // If review doesn't exist, return null instead of throwing error
      if (error.code === 'PGRST116') {
        return null;
      }
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

    // After creating a review, manually update the product rating
    try {
      await supabase.rpc('update_product_rating_manually', {
        product_id_param: review.product_id
      });
    } catch (rpcError) {
      console.error('Error updating product rating:', rpcError);
      // Don't fail the whole operation if just the rating update fails
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
    // Get the review first to get the product_id
    const { data: existingReview, error: getError } = await supabase
      .from('product_reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();
      
    if (getError) {
      console.error('Error getting existing review:', getError);
      throw getError;
    }
    
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

    // After updating a review, manually update the product rating
    try {
      await supabase.rpc('update_product_rating_manually', {
        product_id_param: existingReview.product_id
      });
    } catch (rpcError) {
      console.error('Error updating product rating:', rpcError);
      // Don't fail the whole operation if just the rating update fails
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
    // Get the review first to get the product_id
    const { data: existingReview, error: getError } = await supabase
      .from('product_reviews')
      .select('product_id')
      .eq('id', reviewId)
      .single();
      
    if (getError) {
      console.error('Error getting existing review:', getError);
      throw getError;
    }
    
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }

    // After deleting a review, manually update the product rating
    try {
      await supabase.rpc('update_product_rating_manually', {
        product_id_param: existingReview.product_id
      });
    } catch (rpcError) {
      console.error('Error updating product rating:', rpcError);
      // Don't fail the whole operation if just the rating update fails
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