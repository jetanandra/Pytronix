import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (mounted) {
          if (initialSession) {
            setSession(initialSession);
            setUser(initialSession.user);
          } else {
            // If no session exists, ensure we're in a clean state
            setSession(null);
            setUser(null);
            await supabase.auth.signOut(); // Clear any potentially invalid tokens
          }
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        // Clear the invalid session state
        if (mounted) {
          setSession(null);
          setUser(null);
          await supabase.auth.signOut();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (mounted) {
          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            setSession(null);
            setUser(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
          setLoading(false);
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }
      
      // After successful login, sync user_metadata to profiles if missing or incomplete
      const user = data?.user;
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const meta = user.user_metadata || {};
        // If profile is missing or missing fields, upsert with user_metadata
        if (!profile || !profile.full_name || !profile.phone) {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: meta.full_name || profile?.full_name || '',
            phone: meta.phone || profile?.phone || '',
            email: user.email
          });
        }
      }
      
      toast.success('Signed in successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error signing in:', err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone
          }
        }
      });
      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }
      // Insert name and phone into profiles table if registration succeeded
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          phone: phone,
          email: email
        });
      }
      toast.success('Signup successful! Please check your email for confirmation.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error signing up:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }
      
      // Clear session and user state after successful sign out
      setSession(null);
      setUser(null);
      
      toast.success('Signed out successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error signing out:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};