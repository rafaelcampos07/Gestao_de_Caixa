import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function handleSupabaseError(error: unknown) {
  if (error instanceof Error) {
    console.error('Supabase error:', error);
    
    // Check for specific error types
    if (error.message.includes('Failed to fetch')) {
      return 'Erro de conexão com o servidor. Por favor, verifique sua conexão com a internet.';
    }
    
    return error.message;
  }
  return 'Ocorreu um erro inesperado';
}