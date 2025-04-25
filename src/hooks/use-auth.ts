import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Mock user for development
const mockUser: User = {
  id: 'dev-user-123',
  app_metadata: {},
  user_metadata: { name: 'Development User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    // In development mode, use a mock user
    if (isDevelopment) {
      console.log('Using mock user for development');
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    // In production, get initial session from Supabase
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes in production
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      if (!isDevelopment) {
        subscription.unsubscribe();
      }
    };
  }, [isDevelopment]);

  const signOut = async () => {
    if (isDevelopment) {
      console.log('Mock sign out in development mode');
      setUser(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    signOut,
    isLoading,
  };
}
