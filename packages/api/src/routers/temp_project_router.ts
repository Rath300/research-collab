import { z } from 'zod';
import {
  router,
  protectedProcedure,
} from '../trpc';
import { projectSchema, projectCollaboratorSchema, researchItemSchema, researchItemTypeSchema } from '@research-collab/db';
import { TRPCError } from '@trpc/server';
import { projectCollaboratorRoleSchema, projectCollaboratorStatusSchema, profileSchema } from '@research-collab/db';


export const tempProjectRouter = router({
  /**
   * Lists all projects where the current user is an active collaborator.
   * Returns project details along with the user's role in that project.
   */
  listMyProjects: protectedProcedure
    .output(z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        visibility: z.string().optional(),
        tags: z.array(z.string()).optional(),
        created_at: z.string(),
        updated_at: z.string(),
        role: z.union([
          z.literal('owner'),
          z.literal('editor'),
          z.literal('viewer'),
        ]),
      })
    ))
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      const { data, error } = await ctx.supabase
        .from('project_collaborators')
        .select('role, project(*)')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user projects.',
          cause: error,
        });
      }

      const collaborations = data as { role: "owner" | "editor" | "viewer"; project: z.infer<typeof projectSchema> }[];

      const projects = collaborations
        .map(collaboration => {
          const projectDataRaw = collaboration.project;

          if (!projectDataRaw) {
            return null;
          }

          return {
            id: projectDataRaw.id,
            name: projectDataRaw.name,
            description: projectDataRaw.description ?? undefined,
            visibility: projectDataRaw.visibility ?? undefined,
            tags: projectDataRaw.tags ?? undefined,
            created_at: projectDataRaw.created_at ? new Date(projectDataRaw.created_at) : undefined,
            updated_at: projectDataRaw.updated_at ? new Date(projectDataRaw.updated_at) : undefined,
            role: collaboration.role,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      return projects;
    }),
}); 