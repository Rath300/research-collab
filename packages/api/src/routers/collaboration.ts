import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { matchSchema, researchPostSchema, profileSchema } from '@research-collab/db';
import { TRPCError } from '@trpc/server';

export const collaborationRouter = router({
  listRequests: protectedProcedure
    .output(z.array(matchSchema.extend({
      requester_profile: profileSchema.pick({ id: true, first_name: true, last_name: true, avatar_url: true }).nullable(),
      research_post: researchPostSchema.pick({ id: true, title: true }).nullable(),
    })))
    .query(async ({ ctx }) => {
      const { supabase, session } = ctx;
      const { data, error } = await supabase
        .from('collaborator_matches')
        .select(`
          *,
          requester_profile:profiles!collaborator_matches_user_id_fkey(id, first_name, last_name, avatar_url),
          research_post:research_posts!collaborator_matches_research_post_id_fkey(id, title)
        `)
        .eq('target_user_id', session.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch collaboration requests.', cause: error });
      }

      return data;
    }),

  respondToRequest: protectedProcedure
    .input(z.object({
      requestId: z.string().uuid(),
      newStatus: z.enum(['matched', 'rejected']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, session } = ctx;
      const { requestId, newStatus } = input;

      const { error } = await supabase
        .from('collaborator_matches')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('target_user_id', session.user.id); // Security check: ensure user is the target

      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to respond to request.', cause: error });
      }

      return { success: true };
    }),
}); 