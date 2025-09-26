'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes before considering it stale
            staleTime: 5 * 60 * 1000,
            // Keep data in cache for 10 minutes after last use
            gcTime: 10 * 60 * 1000,
            // Retry failed requests with exponential backoff
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus for critical data
            refetchOnWindowFocus: (query) => {
              // Only refetch health status and search results on focus
              return query.queryKey[0] === 'health' || query.queryKey[0] === 'search';
            },
            // Background refetch for stale data
            refetchOnMount: 'always',
            // Network mode for offline support
            networkMode: 'online',
          },
          mutations: {
            // Retry mutations once on network errors
            retry: (failureCount, error: any) => {
              if (error?.name === 'NetworkError' && failureCount < 1) {
                return true;
              }
              return false;
            },
            retryDelay: 1000,
            // Network mode for mutations
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}