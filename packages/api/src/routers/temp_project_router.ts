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
      projectSchema.extend({
        role: projectCollaboratorRoleSchema,
      })
    ))
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      type CollaborationWithNestedPostArray = {
        role: "owner" | "editor" | "viewer";
        research_posts: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          content: string;
          visibility: "public" | "private" | "connections" | null;
          tags: string[] | null;
          is_boosted: boolean;
          engagement_count: number;
        }[] | null;
      };

      const { data, error } = await ctx.supabase
        .from('project_collaborators')
        .select('role, research_posts(*)')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user projects.',
          cause: error,
        });
      }

      const collaborations = data as CollaborationWithNestedPostArray[];

      const projects = collaborations
        .map(collaboration => {
          const postDataRaw = Array.isArray(collaboration.research_posts)
            ? collaboration.research_posts[0]
            : collaboration.research_posts;

          if (!postDataRaw) {
            return null;
          }

          return {
            ...postDataRaw,
            role: collaboration.role,
            created_at: new Date(postDataRaw.created_at),
            updated_at: new Date(postDataRaw.updated_at),
            visibility: postDataRaw.visibility ?? undefined,
            tags: postDataRaw.tags ?? undefined,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      return projects;
    }),
}); 