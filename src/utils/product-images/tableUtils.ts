
import { supabase } from '@/lib/supabase';

/**
 * Helper function to check if a table exists in the database
 */
export async function checkIfTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}
