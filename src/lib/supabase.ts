import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  toast.error('נדרשת הגדרת התחברות ל-Supabase');
  throw new Error('חסרים פרטי התחברות ל-Supabase. אנא הגדר את המשתנים VITE_SUPABASE_URL ו-VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);