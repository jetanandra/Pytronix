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
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup the subscription
    return () => {
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
      const user = data?.user || (await supabase.auth.getUser()).data?.user;
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
      
      // Pass name and phone as user_metadata
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