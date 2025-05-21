import { supabase } from '../lib/supabaseClient';
import { Workshop, WorkshopCategory, WorkshopRequest } from '../types';

export const getAllWorkshops = async (): Promise<Workshop[]> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        workshop_categories(id, name, image)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to maintain backward compatibility
    const transformedData = data?.map(workshop => ({
      ...workshop,
      // Keep the category field for backward compatibility
      category: workshop.workshop_categories?.name || workshop.category
    })) || [];
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching all workshops:', error);
    return [];
  }
};

export const getWorkshopById = async (id: string): Promise<Workshop | null> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        workshop_categories(id, name, image)
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Transform to maintain backward compatibility
    if (data) {
      return {
        ...data,
        category: data.workshop_categories?.name || data.category
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching workshop:', error);
    throw error;
  }
};

export const createWorkshop = async (workshop: Omit<Workshop, 'id' | 'created_at'>): Promise<Workshop> => {
  // Remove any potential workshop_categories data before insert
  const { workshop_categories, ...workshopData } = workshop as any;
  
  const { data, error } = await supabase
    .from('workshops')
    .insert([workshopData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateWorkshop = async (id: string, workshop: Partial<Workshop>): Promise<Workshop> => {
  // Remove any potential workshop_categories data before update
  const { workshop_categories, ...workshopData } = workshop as any;
  
  const { data, error } = await supabase
    .from('workshops')
    .update(workshopData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteWorkshop = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('workshops')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

export const getWorkshopCategories = async (): Promise<WorkshopCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('workshop_categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching workshop categories:', error);
    return [];
  }
};

export const createWorkshopCategory = async (category: Omit<WorkshopCategory, 'id' | 'created_at'>): Promise<WorkshopCategory> => {
  const { data, error } = await supabase
    .from('workshop_categories')
    .insert([category])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateWorkshopCategory = async (id: string, category: Partial<WorkshopCategory>): Promise<WorkshopCategory> => {
  const { data, error } = await supabase
    .from('workshop_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteWorkshopCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('workshop_categories')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
};

export const getWorkshopsByCategory = async (categoryId: string): Promise<Workshop[]> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select(`
        *,
        workshop_categories(id, name, image)
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // Transform the data to maintain backward compatibility
    const transformedData = data?.map(workshop => ({
      ...workshop,
      // Keep the category field for backward compatibility
      category: workshop.workshop_categories?.name || workshop.category
    })) || [];
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching workshops by category:', error);
    return [];
  }
};

// Workshop Requests
export const submitWorkshopRequest = async (request: Omit<WorkshopRequest, 'id' | 'created_at'>): Promise<WorkshopRequest> => {
  const { data, error } = await supabase
    .from('workshop_requests')
    .insert([request])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getAllWorkshopRequests = async (): Promise<WorkshopRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('workshop_requests')
      .select(`
        *,
        workshop:workshops (
          id,
          title,
          duration,
          category
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching workshop requests:', error);
    return [];
  }
};

export const getWorkshopRequestById = async (id: string): Promise<WorkshopRequest | null> => {
  try {
    const { data, error } = await supabase
      .from('workshop_requests')
      .select(`
        *,
        workshop:workshops (
          id,
          title,
          duration,
          category
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching workshop request:', error);
    throw error;
  }
};

export const updateWorkshopRequestStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'rejected',
  admin_response?: string
): Promise<void> => {
  const { error } = await supabase
    .from('workshop_requests')
    .update({ 
      status,
      admin_response: admin_response || null
    })
    .eq('id', id);
    
  if (error) throw error;
};