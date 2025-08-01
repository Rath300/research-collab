import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { profileSchema } from '@research-collab/db';
import { TRPCError } from '@trpc/server';

// Input schema allows only fields a user can edit. Dates are handled by the server.
// Using a new Zod object is more explicit and avoids inference issues with .pick()
const updateProfileInputSchema = z.object({
    full_name: z.string().optional().nullable(),
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    institution: z.string().optional().nullable(),
    interests: z.array(z.string()).optional().nullable(),
    skills: z.array(z.string()).optional().nullable(),
    looking_for: z.array(z.string()).optional().nullable(),
    collaboration_pitch: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    field_of_study: z.string().optional().nullable(),
    availability: z.enum(['full-time', 'part-time', 'weekends', 'not-available']).optional().nullable(),
    availability_hours: z.number().optional().nullable(),
    project_preference: z.string().optional().nullable(),
    visibility: z.enum(['public', 'private', 'connections']).optional().nullable(),
    website: z.string().optional().nullable(),

    avatar_url: z.string().optional().nullable(),
});

export const profileRouter = router({
  update: protectedProcedure
    .input(updateProfileInputSchema)
    .output(profileSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Prepare data for update, excluding id and user_id which shouldn't be changed
      const profileDataToSave = {
        ...input,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values to avoid database issues
      const cleanedData = Object.fromEntries(
        Object.entries(profileDataToSave).filter(([_, value]) => value !== undefined)
      );

      // First check if profile exists, if not create it
      const { data: existingProfile } = await ctx.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      let updatedProfile;
      let error;

      if (!existingProfile) {
        // Profile doesn't exist, create it
        const createData = {
          id: userId,
          user_id: userId, // Add user_id to satisfy NOT NULL constraint
          first_name: input.first_name || 'Anonymous',
          last_name: input.last_name || 'User', 
          email: ctx.user.email || 'no-email',
          ...cleanedData
        };

        const result = await ctx.supabase
          .from('profiles')
          .insert(createData)
          .select('*')
          .single();
          
        updatedProfile = result.data;
        error = result.error;
      } else {
        // Profile exists, update it
        const result = await ctx.supabase
          .from('profiles')
          .update(cleanedData)
          .eq('id', userId)
          .select('*')
          .single();
          
        updatedProfile = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('Supabase error in profile.update:', error, 'Payload:', profileDataToSave);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile.',
          cause: error,
        });
      }
      
      const validation = profileSchema.safeParse(updatedProfile);

      if (!validation.success) {
        console.error('Profile validation failed:', validation.error, 'Data:', updatedProfile);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Updated profile data from database is invalid.',
          cause: validation.error,
        });
      }
      
      return validation.data;
    }),
}); 