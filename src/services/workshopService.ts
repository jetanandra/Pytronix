import { supabase } from '../lib/supabaseClient';
import { Workshop, WorkshopCategory, WorkshopRequest } from '../types';

export const getAllWorkshops = async (): Promise<Workshop[]> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all workshops:', error);
    return [];
  }
};

export const getWorkshopById = async (id: string): Promise<Workshop | null> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching workshop:', error);
    throw error;
  }
};

export const createWorkshop = async (workshop: Omit<Workshop, 'id' | 'created_at'>): Promise<Workshop> => {
  const { data, error } = await supabase
    .from('workshops')
    .insert([workshop])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateWorkshop = async (id: string, workshop: Partial<Workshop>): Promise<Workshop> => {
  const { data, error } = await supabase
    .from('workshops')
    .update(workshop)
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

export const getWorkshopsByCategory = async (categoryId: string): Promise<Workshop[]> => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
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