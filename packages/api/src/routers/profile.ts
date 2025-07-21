import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { profileSchema } from '@research-collab/db';
import { TRPCError } from '@trpc/server';

// Input schema allows only fields a user can edit. Dates are handled by the server.
// Using a new Zod object is more explicit and avoids inference issues with .pick()
const updateProfileInputSchema = z.object({
    full_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    title: z.string().optional(),
    bio: z.string().optional(),
    institution: z.string().optional(),
    interests: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    looking_for: z.array(z.string()).optional(),
    collaboration_pitch: z.string().optional(),
    location: z.string().optional(),
    field_of_study: z.string().optional(),
    availability: z.enum(['full-time', 'part-time', 'contract', 'weekends', 'not-available']).optional(),
    availability_hours: z.number().optional(),
    project_preference: z.string().optional(),
    visibility: z.enum(['public', 'private', 'connections']).optional(),
    website: z.string().optional(),
    education: z.any().optional(), // Zod's `any` is suitable here since it's JSON
    avatar_url: z.string().optional(),
});

export const profileRouter = router({
  update: protectedProcedure
    .input(updateProfileInputSchema)
    .output(profileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const profileDataToSave = {
        ...input,
        id: userId,
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProfile, error } = await ctx.supabase
        .from('profiles')
        .upsert(profileDataToSave)
        .select('*')
        .single();
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile.',
          cause: error,
        });
      }
      
      const validation = profileSchema.safeParse(updatedProfile);

      if (!validation.success) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Updated profile data from database is invalid.',
          cause: validation.error,
        });
      }
      
      return validation.data;
    }),
}); 