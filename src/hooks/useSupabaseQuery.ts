import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useSupabaseQuery() {
  const [loading, setLoading] = useState(false);

  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    options: { 
      retryCount?: number;
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
    } = {}
  ) => {
    const { retryCount = 0, onSuccess, onError } = options;

    try {
      setLoading(true);
      const { data, error } = await queryFn();

      if (error) {
        // Network error - retry if we haven't exceeded max retries
        if (error.message?.includes('Failed to fetch') && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return executeQuery(queryFn, { ...options, retryCount: retryCount + 1 });
        }
        throw error;
      }

      onSuccess?.(data as T);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      toast.error(errorMessage);
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { executeQuery, loading };
}