import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

interface UseApiOptions<T> {
  initialData?: T;
  errorMessage?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
}

/**
 * A custom hook for handling API calls with loading, error states, and toast notifications
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    initialData,
    errorMessage = 'An error occurred. Please try again.',
    onSuccess,
    onError,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      toast.error(errorMessage);
      console.error('API Error:', error);
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, errorMessage, onSuccess, onError, ...dependencies]);

  useEffect(() => {
    // If dependencies change, re-execute the API call
    execute();
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
}

/**
 * A specialized hook for fetching data from Supabase
 */
export function useSupabaseFetch<T>(
  tableName: string,
  query: any,
  options: UseApiOptions<T[]> = {}
) {
  return useApi<T[]>(
    async () => {
      let supabaseQuery = supabase
        .from(tableName)
        .select(query.select || '*');
      
      // Apply filters if provided
      if (query.filter) {
        Object.entries(query.filter).forEach(([column, value]) => {
          if (value !== undefined && value !== null) {
            supabaseQuery = supabaseQuery.eq(column, value);
          }
        });
      }
      
      // Apply ordering if provided
      if (query.order) {
        supabaseQuery = supabaseQuery.order(query.order.column, { 
          ascending: query.order.ascending 
        });
      }
      
      // Apply pagination if provided
      if (query.range) {
        supabaseQuery = supabaseQuery.range(query.range.from, query.range.to);
      }
      
      const { data, error } = await supabaseQuery;
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as T[];
    },
    {
      initialData: [],
      errorMessage: `Failed to fetch data from ${tableName}`,
      ...options,
      dependencies: [tableName, JSON.stringify(query), ...(options.dependencies || [])]
    }
  );
}