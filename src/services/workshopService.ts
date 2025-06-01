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
  if (!request.user_id) throw new Error('user_id is required for workshop request');
  
  // Get the workshop details for the notification
  let workshopTitle = '';
  try {
    const { data: workshop } = await supabase
      .from('workshops')
      .select('title')
      .eq('id', request.workshop_id)
      .single();
    
    if (workshop) {
      workshopTitle = workshop.title;
    }
  } catch (error) {
    console.error('Error fetching workshop title:', error);
  }
  
  // Insert the workshop request
  const { data, error } = await supabase
    .from('workshop_requests')
    .insert([request])
    .select()
    .single();
    
  if (error) throw error;
  
  // Create notification for the user
  try {
    await supabase
      .from('user_notifications')
      .insert([{
        user_id: request.user_id,
        type: 'workshop_request_submitted',
        title: 'Workshop Request Submitted',
        message: `Your request for the "${workshopTitle}" workshop has been submitted successfully.`,
        data: { 
          workshop_id: request.workshop_id,
          workshop_title: workshopTitle,
          request_id: data.id
        }
      }]);
  } catch (notificationError) {
    console.error('Error creating workshop request notification:', notificationError);
    // Don't throw error for notification failure
  }
  
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
    // Ensure user_id and workshop_id are present in all returned objects
    return (data || []).map((req: any) => ({ ...req, user_id: req.user_id, workshop_id: req.workshop_id, workshop: req.workshop }));
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
    if (!data) return null;
    return { ...data, user_id: data.user_id, workshop_id: data.workshop_id, workshop: data.workshop };
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
  try {
    // Get the request first to get the user_id and workshop_id
    const { data: request, error: getRequestError } = await supabase
      .from('workshop_requests')
      .select('user_id, workshop_id, workshop:workshops(title)')
      .eq('id', id)
      .single();
      
    if (getRequestError) {
      console.error('Error fetching workshop request:', getRequestError);
      throw getRequestError;
    }
    
    // Update the request status
    const { error } = await supabase
      .from('workshop_requests')
      .update({ 
        status,
        admin_response: admin_response || null
      })
      .eq('id', id);
      
    if (error) throw error;
    
    // Create notification for the user
    if (request && request.user_id) {
      try {
        const workshopTitle = request.workshop?.title || 'requested workshop';
        
        await supabase
          .from('user_notifications')
          .insert([{
            user_id: request.user_id,
            type: status === 'approved' ? 'workshop_request_approved' : 'workshop_request_rejected',
            title: `Workshop Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: status === 'approved'
              ? `Your request for the "${workshopTitle}" workshop has been approved.`
              : `Your request for the "${workshopTitle}" workshop has been rejected.`,
            data: { 
              workshop_id: request.workshop_id,
              workshop_title: workshopTitle,
              request_id: id,
              status: status,
              admin_response: admin_response
            }
          }]);
      } catch (notificationError) {
        console.error('Error creating workshop request notification:', notificationError);
        // Don't throw error for notification failure
      }
    }
  } catch (error) {
    console.error('Error updating workshop request status:', error);
    throw error;
  }
};