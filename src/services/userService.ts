import { supabase } from '../lib/supabaseClient';

const ADMIN_USERS_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;

export async function getAllUsers() {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(ADMIN_USERS_FN_URL, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function adminUserAction(userId: string, action: 'promote' | 'demote' | 'ban' | 'unban' | 'delete') {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(ADMIN_USERS_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ userId, action }),
  });
  if (!res.ok) throw new Error('Failed to perform action');
  return res.json();
} 