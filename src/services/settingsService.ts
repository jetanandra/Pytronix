import { supabase } from '../lib/supabaseClient';
import { HeroSlide } from '../types';

/**
 * Get all hero slides
 */
export const getHeroSlides = async (): Promise<HeroSlide[]> => {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('order', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return [];
  }
};

/**
 * Create a new hero slide
 */
export const createHeroSlide = async (slide: Omit<HeroSlide, 'id' | 'created_at'>): Promise<HeroSlide> => {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([slide])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating hero slide:', error);
    throw error;
  }
};

/**
 * Update a hero slide
 */
export const updateHeroSlide = async (id: string, slide: Partial<HeroSlide>): Promise<HeroSlide> => {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .update(slide)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating hero slide:', error);
    throw error;
  }
};

/**
 * Delete a hero slide
 */
export const deleteHeroSlide = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    throw error;
  }
};

/**
 * Reorder hero slides
 */
export const reorderHeroSlides = async (slideIds: string[]): Promise<void> => {
  try {
    // Create an array of update operations
    const updates = slideIds.map((id, index) => ({
      id,
      order: index + 1
    }));
    
    // Update each slide with its new order
    for (const update of updates) {
      const { error } = await supabase
        .from('hero_slides')
        .update({ order: update.order })
        .eq('id', update.id);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error reordering hero slides:', error);
    throw error;
  }
};