import { supabase } from '../lib/supabaseClient';

const ADMIN_USERS_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;

export async function getAllUsers() {
  try {
    // First, check if session is valid, and refresh if needed
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error');
    }
    
    if (!session) {
      console.error('No active session found');
      throw new Error('No active session');
    }
    
    // Optionally, try to refresh the session if it might be expired
    if (session) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
      }
      // Use the refreshed session if available
      const accessToken = refreshData.session?.access_token || session.access_token;
      
      const res = await fetch(ADMIN_USERS_FN_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to fetch users:', errorText);
        throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
      }
      
      return res.json();
    } else {
      throw new Error('No active session');
    }
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

export async function adminUserAction(userId: string, action: 'promote' | 'demote' | 'ban' | 'unban' | 'delete') {
  try {
    // First, check if session is valid, and refresh if needed
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Authentication error');
    }
    
    if (!session) {
      console.error('No active session found');
      throw new Error('No active session');
    }
    
    // Optionally, try to refresh the session if it might be expired
    if (session) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
      }
      // Use the refreshed session if available
      const accessToken = refreshData.session?.access_token || session.access_token;
      
      const res = await fetch(ADMIN_USERS_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId, action }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to perform ${action} action:`, errorText);
        throw new Error(`Failed to perform action: ${res.status} ${res.statusText}`);
      }
      
      return res.json();
    } else {
      throw new Error('No active session');
    }
  } catch (error) {
    console.error(`Error in adminUserAction (${action}):`, error);
    throw error;
  }
}