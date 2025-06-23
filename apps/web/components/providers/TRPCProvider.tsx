'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import React, { useState } from 'react';
import superjson from 'superjson';

import { api } from '@/lib/trpc';
import { useAuthStore } from '@/lib/store';

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative path
    return '';
  }
  if (process.env.VERCEL_URL) {
    // SSR should use Vercel URL
    return `https://${process.env.VERCEL_URL}`;
  }
  // Development SSR should use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuthStore();
  
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests up to 2 times
        retry: 2,
        // Don't retry on client errors (4xx)
        retryOnMount: true,
        // Background refetch when window regains focus
        refetchOnWindowFocus: false,
        // Background refetch when component remounts
        refetchOnMount: true,
        // Don't refetch when reconnecting to network
        refetchOnReconnect: 'always',
        // Error boundary will handle errors
        throwOnError: false,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Throw errors for error boundaries
        throwOnError: true,
      },
    },
  }));
  
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // Enable batching for better performance
          maxURLLength: 2083,
          // Batch requests within 10ms
          maxBatchSize: 10,
          headers() {
            if (!session?.access_token) return {};
            return {
              Authorization: `Bearer ${session.access_token}`,
            };
          },
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
} 