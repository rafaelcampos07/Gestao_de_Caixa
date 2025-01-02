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
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    },
  },
});

export async function handleSupabaseError(error: unknown) {
  if (error instanceof Error) {
    console.error('Supabase error:', error);
    
    // Handle auth errors
    if ('__isAuthError' in error) {
      if (error.message.includes('refresh_token_not_found')) {
        await supabase.auth.signOut();
        return 'Your session has expired. Please sign in again.';
      }
      return 'Authentication error. Please try signing in again.';
    }
    
    // Handle network errors
    if (error.message.includes('Failed to fetch')) {
      return 'Connection error. Please check your internet connection.';
    }
    
    return error.message;
  }
  return 'An unexpected error occurred';
}