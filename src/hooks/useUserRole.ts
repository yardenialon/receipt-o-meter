import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  console.log('🚀 useUserRole hook is RUNNING - user:', user?.email);

  useEffect(() => {
    const fetchUserRole = async () => {
      console.log('🔍 Fetching user role for user:', user?.id);
      if (!user) {
        console.log('❌ No user found');
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Querying user_roles table for user_id:', user.id);
        
        // ראשית, נבדוק את הזהות של המשתמש
        const { data: authData } = await supabase.auth.getUser();
        console.log('👤 Current auth user:', authData.user?.email);
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('📋 Query result:', { data, error, userId: user.id });

        if (error && error.code !== 'PGRST116') {
          console.error('❌ שגיאה בקבלת תפקיד משתמש:', error);
        }

        const userRole = data?.role || 'user';
        console.log('👤 User role set to:', userRole, 'isAdmin will be:', userRole === 'admin');
        setRole(userRole);
      } catch (error) {
        console.error('❌ שגיאה בקבלת תפקיד משתמש:', error);
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  console.log('🎯 useUserRole hook state:', { role, isLoading, isAdmin: role === 'admin' });
  return { role, isLoading, isAdmin: role === 'admin' };
}