import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

const CORE_API_KEY = process.env.CORE_API_KEY; // Note: No NEXT_PUBLIC_ prefix
const CORE_API_BASE_URL = process.env.CORE_API_BASE_URL;

const coreSearchInputSchema = z.object({
  query: z.string(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export const externalApiRouter = router({
  searchCore: publicProcedure
    .input(coreSearchInputSchema)
    .query(async ({ input }) => {
      if (!CORE_API_BASE_URL || !CORE_API_KEY) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'CORE API is not configured on the server.',
        });
      }

      const queryParams = new URLSearchParams({
        q: input.query,
        page: (input.page || 1).toString(),
        limit: (input.pageSize || 10).toString(),
        apiKey: CORE_API_KEY,
      });

      const url = `${CORE_API_BASE_URL}search/articles?${queryParams.toString()}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `CORE API request failed with status ${response.status}`,
          });
        }
        const data = await response.json();
        return data; // The transformation logic can remain on the client for now
      } catch (error) {
        console.error('tRPC searchCore error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch data from CORE API.',
          cause: error,
        });
      }
    }),
}); 