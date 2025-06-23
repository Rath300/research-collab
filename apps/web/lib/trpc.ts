import { createTRPCReact, httpBatchLink, loggerLink, type CreateTRPCReact } from '@trpc/react-query';
import { type TRPCClient } from '@trpc/client';
import { type AppRouter } from '@research-collab/api';
import superjson from 'superjson';

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

export const api: CreateTRPCReact<AppRouter, undefined, undefined> = createTRPCReact<AppRouter, undefined>();

/*
 This client is now created and used within the TRPCProvider component.
 We are keeping the file to export the `api` helper.
 Leaving this here for reference, but it is no longer used directly by the app.
*/
export const trpcClient: TRPCClient<AppRouter> = api.createClient({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) => {
        if (process.env.NODE_ENV === 'development') {
          return true;
        }
        // Log errors in production
        if (opts.direction === 'down' && opts.result instanceof Error) {
          return true;
        }
        return false;
      },
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          // Authorization: getAuthCookie(), // If you need to send auth headers
        };
      },
    }),
  ],
}); 