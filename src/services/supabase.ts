import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Test connectivity with Supabase database
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; tableCount?: number }> {
  if (!supabase) {
    return { ok: false, message: 'Supabase credentials not configured in .env' };
  }

  try {
    const { error } = await supabase
      .from('validation_rules')
      .select('id')
      .limit(1);

    if (error) {
      // 404 or table not found means auth worked, but schema isn't created yet
      if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
        return { 
          ok: false, 
          message: 'Connected to Supabase, but schema tables are not created yet. Please execute database/schema.sql.' 
        };
      }
      return { ok: false, message: error.message };
    }

    return { ok: true, message: 'Connected to live Supabase central database' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Connection error' };
  }
}
