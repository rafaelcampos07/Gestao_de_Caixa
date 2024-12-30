import { useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useSupabase() {
  const [loading, setLoading] = useState(false);

  async function query<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> {
    setLoading(true);
    try {
      const { data, error } = await operation();
      if (error) {
        const errorMessage = await handleSupabaseError(error);
        toast.error(errorMessage);
        return null;
      }
      return data;
    } catch (error) {
      const errorMessage = await handleSupabaseError(error);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    query,
    loading,
  };
}