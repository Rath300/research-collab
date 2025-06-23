import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

import { appRouter } from '@research-collab/api';
import { createContext } from '@research-collab/api/context';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts: any) => createContext(opts),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
              error.stack
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST }; 