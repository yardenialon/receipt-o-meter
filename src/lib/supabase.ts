import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:', { 
    url: supabaseUrl ? 'exists' : 'missing', 
    key: supabaseAnonKey ? 'exists' : 'missing' 
  });
  toast.error('חסרים פרטי התחברות ל-Supabase');
  throw new Error('חסרים פרטי התחברות ל-Supabase. אנא ודא שהזנת את המפתחות הנכונים.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});