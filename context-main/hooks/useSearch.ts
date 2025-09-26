'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { SearchResult } from '../services/types';
import { QUERY_KEYS } from '../services/constants';
import { clientCache, cacheKeys, cacheTTL } from '../lib/cache';

interface UseSearchOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface UseSearchReturn {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  setQuery: (query: string) => void;
  refetch: () => void;
  isSuccess: boolean;
  isFetching: boolean;
  isError: boolean;
  failureCount: number;
  canRetry: boolean;
}

/**
 * useSearch hook with React Query for state management and caching
 * Implements requirements 1.2, 1.5, and 1.6
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const [query, setQuery] = useState('');
  
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
  } = options;

  const {
    data: results = [],
    isLoading,
    error,
    refetch,
    isSuccess,
    isFetching,
    isError,
    failureCount,
  } = useQuery({
    queryKey: [QUERY_KEYS.SEARCH, query],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      // Check client cache first
      const cacheKey = cacheKeys.search(query.trim(), 20);
      const cachedResults = clientCache.get<SearchResult[]>(cacheKey);
      
      if (cachedResults) {
        return cachedResults;
      }

      // Fetch from API and cache the result
      const results = await apiService.search(query.trim());
      clientCache.set(cacheKey, results, cacheTTL.search);
      
      return results;
    },
    enabled: enabled && query.trim().length > 0,
    staleTime,
    gcTime: cacheTime, // Updated from cacheTime to gcTime for React Query v5
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Convert error to string for easier handling
  const errorMessage = error 
    ? error instanceof Error 
      ? error.message 
      : 'An error occurred during search'
    : null;

  return {
    results,
    isLoading,
    error: errorMessage,
    query,
    setQuery,
    refetch,
    isSuccess,
    isFetching,
    isError,
    failureCount,
    canRetry: failureCount < 3 && !errorMessage?.includes('400') && !errorMessage?.includes('404'),
  };
}

/**
 * Hook for searching with debounced input
 * Automatically triggers search when query changes after debounce delay
 */
export function useDebouncedSearch(
  initialQuery: string = '',
  debounceMs: number = 300,
  options: UseSearchOptions = {}
) {
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [inputQuery, setInputQuery] = useState(initialQuery);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputQuery, debounceMs]);

  const searchResult = useSearch({
    ...options,
    enabled: options.enabled !== false && debouncedQuery.trim().length > 0,
  });

  return {
    ...searchResult,
    query: debouncedQuery,
    inputQuery,
    setQuery: setInputQuery,
    isDebouncing: inputQuery !== debouncedQuery,
  };
}

// Re-export for convenience
export default useSearch;