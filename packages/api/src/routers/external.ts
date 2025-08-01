import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const externalRouter = router({
  searchCore: publicProcedure
    .input(z.object({
      query: z.string().min(1, 'Search query is required'),
      limit: z.number().min(1).max(50).optional().default(10),
    }))
    .output(z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      url: z.string().optional(),
      type: z.string().optional(),
      relevance: z.number().optional(),
    })))
    .query(async ({ input }) => {
      // For now, return mock data until external search APIs are integrated
      console.log(`[External Search] Query: ${input.query}, Limit: ${input.limit}`);
      
      // Mock search results based on the query
      const mockResults = [
        {
          id: '1',
          title: `Research: ${input.query}`,
          description: `Academic research related to ${input.query}`,
          url: `https://example.com/research/${input.query.toLowerCase()}`,
          type: 'research_paper',
          relevance: 0.95,
        },
        {
          id: '2', 
          title: `${input.query} Applications`,
          description: `Practical applications and use cases for ${input.query}`,
          url: `https://example.com/applications/${input.query.toLowerCase()}`,
          type: 'application',
          relevance: 0.87,
        },
      ];

      return mockResults.slice(0, input.limit);
    }),
});