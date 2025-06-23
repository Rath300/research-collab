import { z } from 'zod';
import {
  router,
  protectedProcedure,
  // publicProcedure, // Add if public procedures are needed later
} from '../trpc';
import { projectSchema, projectCollaboratorSchema, researchItemSchema, researchItemTypeSchema } from '@research-collab/db'; // Assuming these are the correct schema exports
import { TRPCError } from '@trpc/server';
import { projectCollaboratorRoleSchema, projectCollaboratorStatusSchema, profileSchema } from '@research-collab/db';

// Define the input schema for creating a project, derived from projectSchema
// We omit fields that are auto-generated or context-derived (id, createdAt, updatedAt, userId)
const createProjectInputSchema = projectSchema.pick({
  title: true,
  content: true,
  tags: true,
  visibility: true,
  is_boosted: true, // Optional, with default
  engagement_count: true, // Optional, with default
}).partial({
  tags: true, // Make optional if not always provided during creation
  is_boosted: true,
  engagement_count: true,
});

// Input schema for updating a project: all fields from projectSchema are optional,
// but an 'id' is required to identify the project to update.
const updateProjectInputSchema = projectSchema.pick({
    title: true,
    content: true,
    tags: true,
    visibility: true,
    is_boosted: true,
    engagement_count: true,
}).partial().extend({ // Make all picked fields optional, then add required id
    id: z.string().uuid(),
});

const inviteCollaboratorInputSchema = z.object({
  projectId: z.string().uuid(),
  inviteeUserId: z.string().uuid(),
  role: projectCollaboratorRoleSchema,
});

// Corrected schema for respondToInvitationInput
const respondToInvitationInputSchema = z.object({
  projectId: z.string().uuid(),
  // Ensure status is one of the allowed values from the enum for this action
  status: z.custom<typeof projectCollaboratorStatusSchema._def.values[number]>((val) => {
    return projectCollaboratorStatusSchema._def.values.includes(val as any);
  }).refine(
    (status): status is Extract<typeof projectCollaboratorStatusSchema._def.values[number], 'active' | 'declined'> => 
      status === 'active' || status === 'declined',
    { message: "Status must be 'active' or 'declined'" }
  ),
});

const updateCollaboratorRoleInputSchema = z.object({
  projectId: z.string().uuid(),
  collaboratorUserId: z.string().uuid(), 
  newRole: projectCollaboratorRoleSchema, 
});

const removeCollaboratorInputSchema = z.object({
  projectId: z.string().uuid(),
  collaboratorUserId: z.string().uuid(), // The user to be removed
});

const listCollaboratorsInputSchema = z.object({
  projectId: z.string().uuid(),
});

// Corrected: Pick fields that are definitely in the Zod profileSchema
// and ensure `id` (profile's own PK) is included.
const collaboratorWithProfileSchema = projectCollaboratorSchema.extend({
  user: profileSchema.pick({ 
    id: true,          // Profile's own PK
    user_id: true,     // FK to auth.users table
    first_name: true,
    last_name: true,
    avatar_url: true,
    // email: true,    // Add if needed and present in Zod's profileSchema
  }).nullable(),
});

// --- Research Item Schemas ---

// Base schema for common fields, used in the discriminated union
const baseResearchItemInputSchema = z.object({
  projectId: z.string().uuid(),
  order: z.number().int().optional(), // Optional: server can handle assigning order if not provided
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

// Schema for 'link' type item
const linkItemInputSchema = baseResearchItemInputSchema.extend({
  type: z.literal(researchItemTypeSchema.Enum.link),
  url: z.string().url({ message: "Invalid URL for link item." }),
});

// Schema for 'text_block' type item
const textBlockItemInputSchema = baseResearchItemInputSchema.extend({
  type: z.literal(researchItemTypeSchema.Enum.text_block),
  // `description` from base will serve as the main content for text_block
  // title can be a heading
});

// Schema for 'file' type item
// File uploads are typically handled by client direct to storage.
// This API call would then record the metadata.
const fileItemInputSchema = baseResearchItemInputSchema.extend({
  type: z.literal(researchItemTypeSchema.Enum.file),
  filePath: z.string({ required_error: "File path is required." }), // Path in Supabase storage
  fileName: z.string({ required_error: "File name is required." }),
  fileType: z.string({ required_error: "File type (MIME) is required." }),
  fileSizeBytes: z.number().int().positive({ message: "File size must be a positive integer." }),
});

// Discriminated union for adding different types of research items
const addResearchItemInputSchema = z.discriminatedUnion("type", [
  linkItemInputSchema,
  textBlockItemInputSchema,
  fileItemInputSchema,
]);

const listItemsInputSchema = z.object({
  projectId: z.string().uuid(),
});

// --- Input schema for updating a research item ---
// Base for common updatable fields. All fields are optional for update.
const baseUpdateResearchItemInputSchema = z.object({
  id: z.string().uuid(), // ID of the item to update
  projectId: z.string().uuid(), // For permission checking and ensuring item belongs to project
  order: z.number().int().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const updateLinkItemInputSchema = baseUpdateResearchItemInputSchema.extend({
  type: z.literal(researchItemTypeSchema.Enum.link),
  url: z.string().url({ message: "Invalid URL for link item." }).optional(),
});

const updateTextBlockItemInputSchema = baseUpdateResearchItemInputSchema.extend({
  type: z.literal(researchItemTypeSchema.Enum.text_block),
  // `title` and `description` from base are primary updatable fields
});

// For file items, typically only metadata like title/description/order is updated via this API.
// File content (filePath, fileName, etc.) changes would involve re-uploading to storage
// and then potentially calling this to update the metadata, or a specific 'replaceFile' endpoint.
// For now, we allow metadata updates.
const updateFileItemInputSchema = baseUpdateResearchItemInputSchema.extend({
  type: z.literal(researchItemTypeSchema.Enum.file),
  // Potentially allow updating fileName if it doesn't affect filePath consistency
  // filePath, fileType, fileSizeBytes are generally not updated directly here.
});

// Discriminated union for updating different types of research items
const updateResearchItemInputSchema = z.discriminatedUnion("type", [
  updateLinkItemInputSchema,
  updateTextBlockItemInputSchema,
  updateFileItemInputSchema,
]);

const deleteItemInputSchema = z.object({
  itemId: z.string().uuid(),
  projectId: z.string().uuid(), // Required for permission check
});

export const projectRouter = router({
  /**
   * Creates a new project (research_post).
   * The creator is automatically added as an 'owner' in project_collaborators via a database trigger.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        tags: z.array(z.string()).optional(),
        visibility: z.enum(['public', 'private', 'connections']).default('public'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, session } = ctx;
      const userId = session.user.id;

      const { data, error } = await supabase
        .from('research_posts')
        .insert({
          user_id: userId,
          title: input.title,
          content: input.content,
          tags: input.tags,
          visibility: input.visibility,
        })
        .select()
        .single();
      
      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create research post.',
          cause: error,
        });
      }

      // Also add the creator as the 'owner' in project_collaborators
      const { error: collabError } = await supabase
        .from('project_collaborators')
        .insert({
            project_id: data.id,
            user_id: userId,
            role: 'owner',
            status: 'active',
        });

      if (collabError) {
        // If this fails, we should ideally roll back the post creation.
        // For now, we'll log the error and the post will exist without an owner.
        console.error('Failed to add owner to new project:', collabError);
        // Depending on desired transactional integrity, you might throw an error here.
      }

      return data;
    }),

  /**
   * Fetches a single project by its ID.
   * Ensures the requesting user is a collaborator on the project.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(projectSchema.extend({
      role: projectCollaboratorRoleSchema,
    }).nullable()) // Project might not exist or user might not have access
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // First, check if the user is a collaborator on this project and get their role
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('role') // Select the role
        .eq('project_id', input.id)
        .eq('user_id', userId)
        .eq('status', 'active') // Ensure the collaboration is active
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration:", collaboratorError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify project access.',
          cause: collaboratorError,
        });
      }

      if (!collaborator) {
        // If user is not an active collaborator, they don't have access
        // We could also check project visibility here if public projects should be viewable by anyone
        // For now, strict collaborator access is implemented.
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this project or it does not exist.'
        });
      }

      // If collaborator check passes, fetch the project details
      const { data: project, error: projectError } = await ctx.supabase
        .from('research_posts')
        .select('*') // Select all columns from projectSchema
        .eq('id', input.id)
        .single();

      if (projectError) {
        // This could happen if the project was deleted between collaborator check and this query
        // Or other DB errors
        console.error("Error fetching project by ID:", projectError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch project details.',
          cause: projectError,
        });
      }
      
      // Combine project data with the user's role for this project
      return { ...project, role: collaborator.role };
    }),

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

      // This is the shape Supabase actually returns for this specific join
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
        }[] | null; // Supabase can return an array for the join
      };

      const { data, error } = await ctx.supabase
        .from('project_collaborators')
        .select('role, research_posts(*)') // Keep the select simple
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
          // The joined 'research_posts' table can be an object or an array depending on Supabase inference.
          const postDataRaw = Array.isArray(collaboration.research_posts)
            ? collaboration.research_posts[0]
            : collaboration.research_posts;

          if (!postDataRaw) {
            return null;
          }

          return {
            ...postDataRaw,
            role: collaboration.role,
            // Handle null from DB to match Zod schema which likely expects undefined
            visibility: postDataRaw.visibility ?? undefined,
            tags: postDataRaw.tags ?? undefined,
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      return projects;
    }),

  /**
   * Updates a project's details.
   * Requires the user to be an 'owner' or 'editor' of the project.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
        tags: z.array(z.string()).optional(),
        visibility: z.enum(['public', 'private', 'connections']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, session } = ctx;
      const { id, ...updateData } = input;

      // First, verify the user is the owner of the post
      const { data: post, error: fetchError } = await supabase
        .from('research_posts')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found.' });
      }

      if (post.user_id !== session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own posts.' });
      }
      
      const { error: updateError } = await supabase
        .from('research_posts')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post.',
          cause: updateError,
        });
      }

      return { success: true };
    }),

  /**
   * Deletes a project.
   * Requires the user to be an 'owner' of the project.
   * Note: Supabase cascade delete on foreign keys should handle related
   * project_collaborators and research_items.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, session } = ctx;
      const { id } = input;

      // Verify the user is the owner before deleting
      const { data: post, error: fetchError } = await supabase
        .from('research_posts')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found.' });
      }

      if (post.user_id !== session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own posts.' });
      }

      const { error: deleteError } = await supabase
        .from('research_posts')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post.',
          cause: deleteError,
        });
      }

      return { success: true };
    }),

  // Future procedures for project management will go here:
  // getById: protectedProcedure...
  // listForUser: protectedProcedure...
  // update: protectedProcedure...
  // delete: protectedProcedure...

  // Future procedures for collaborator management:
  /**
   * Invites a user to collaborate on a project.
   * Requires the inviting user to be an 'owner' or 'editor' of the project.
   */
  inviteCollaborator: protectedProcedure
    .input(inviteCollaboratorInputSchema)
    .output(projectCollaboratorSchema) // Returns the newly created collaborator entry
    .mutation(async ({ ctx, input }) => {
      const inviterUserId = ctx.session.user.id;
      const { projectId, inviteeUserId, role } = input;

      // 1. Verify the inviter has permission (owner or editor)
      const { data: inviterCollaborator, error: inviterCheckError } = await ctx.supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', inviterUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (inviterCheckError) {
        console.error("Error checking inviter permission:", inviterCheckError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify your project permissions.',
          cause: inviterCheckError,
        });
      }

      if (!inviterCollaborator || (inviterCollaborator.role !== 'owner' && inviterCollaborator.role !== 'editor')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to invite collaborators to this project.',
        });
      }
      
      // 2. Check if the user is already a collaborator or has a pending invitation
      const { data: existingCollaborator, error: existingCheckError } = await ctx.supabase
        .from('project_collaborators')
        .select('id, status')
        .eq('project_id', projectId)
        .eq('user_id', inviteeUserId)
        .maybeSingle();

      if (existingCheckError) {
        console.error("Error checking existing collaborator:", existingCheckError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to check existing collaborator status.' });
      }

      if (existingCollaborator) {
        if (existingCollaborator.status === 'active') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User is already an active collaborator on this project.' });
        } else if (existingCollaborator.status === 'pending') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'User already has a pending invitation for this project.' });
        }
        // Potentially handle 'declined' or 'revoked' cases differently, e.g., re-invite by deleting old record
      }

      // 3. Create the new collaborator entry with 'pending' status
      const { data: newCollaboratorEntry, error: insertError } = await ctx.supabase
        .from('project_collaborators')
        .insert({
          project_id: projectId,
          user_id: inviteeUserId,
          role: role,
          status: 'pending', // Default status for an invitation
          invited_by: inviterUserId,
          // created_at and updated_at are handled by DB defaults/triggers
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating collaborator invitation:", insertError);
        // Could be a unique constraint violation if somehow missed by above check, or other DB error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send invitation.',
          cause: insertError,
        });
      }
      
      if (!newCollaboratorEntry) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create invitation, no data returned.'});
      }

      return newCollaboratorEntry;
    }),

  /**
   * Allows a user to respond (accept or decline) to a pending project invitation.
   */
  respondToInvitation: protectedProcedure
    .input(respondToInvitationInputSchema)
    .output(projectCollaboratorSchema) // Returns the updated collaborator entry
    .mutation(async ({ ctx, input }) => {
      const inviteeUserId = ctx.session.user.id;
      const { projectId, status: newStatus } = input;

      // 1. Find the pending invitation for this user and project
      const { data: pendingInvitation, error: findError } = await ctx.supabase
        .from('project_collaborators')
        .select('id, status') 
        .eq('project_id', projectId)
        .eq('user_id', inviteeUserId)
        .eq('status', 'pending') 
        .maybeSingle();

      if (findError) {
        console.error("Error finding pending invitation:", findError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to find your invitation.',
          cause: findError,
        });
      }

      if (!pendingInvitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No pending invitation found for this project, or it has already been actioned.',
        });
      }

      // 2. Update the status of the invitation
      const { data: updatedCollaboratorEntry, error: updateError } = await ctx.supabase
        .from('project_collaborators')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(), 
        })
        .eq('id', pendingInvitation.id) 
        .select()
        .single();

      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update invitation status.',
          cause: updateError,
        });
      }
      
      if (!updatedCollaboratorEntry) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update invitation, no data returned.' });
      }

      return updatedCollaboratorEntry;
    }),

  /**
   * Updates the role of an existing active collaborator on a project.
   * Requires the user performing the update to be an 'owner' of the project.
   * (Could be extended to allow 'editors' to manage roles below them, if needed).
   */
  updateCollaboratorRole: protectedProcedure
    .input(updateCollaboratorRoleInputSchema)
    .output(projectCollaboratorSchema) // Returns the updated collaborator entry
    .mutation(async ({ ctx, input }) => {
      const updaterUserId = ctx.session.user.id;
      const { projectId, collaboratorUserId, newRole } = input;

      // 1. Verify the updater has 'owner' permission for the project
      const { data: updaterCollaborator, error: updaterCheckError } = await ctx.supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', updaterUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (updaterCheckError) {
        console.error("Error checking updater permission:", updaterCheckError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify your project permissions.',
          cause: updaterCheckError,
        });
      }

      if (!updaterCollaborator || updaterCollaborator.role !== 'owner') {
        // For now, only owners can change roles. This could be expanded.
        // E.g., owners can change any role, editors can change viewer roles.
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project owners can change collaborator roles.',
        });
      }
      
      // 2. Ensure the target collaborator is an active member of the project
      const { data: targetCollaborator, error: targetCheckError } = await ctx.supabase
        .from('project_collaborators')
        .select('id, role') // get current role to prevent unnecessary updates or specific logic
        .eq('project_id', projectId)
        .eq('user_id', collaboratorUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (targetCheckError) {
        console.error("Error finding target collaborator:", targetCheckError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to find the collaborator to update.' });
      }

      if (!targetCollaborator) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'The specified user is not an active collaborator on this project.' });
      }
      
      // Optional: Prevent owner from changing their own role if they are the last owner,
      // or prevent changing role to 'owner' if there's already an owner and only one is allowed by logic.
      // For now, this logic is not implemented but can be added if business rules require it.
      // if (collaboratorUserId === updaterUserId && newRole !== 'owner') {
      //   // Check if they are the last owner, etc.
      // }

      // 3. Update the role
      const { data: updatedCollaboratorEntry, error: updateError } = await ctx.supabase
        .from('project_collaborators')
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetCollaborator.id) // Update using the specific collaborator record ID
        .select()
        .single();

      if (updateError) {
        console.error("Error updating collaborator role:", updateError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update collaborator role.',
          cause: updateError,
        });
      }
      
      if (!updatedCollaboratorEntry) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update role, no data returned.' });
      }

      return updatedCollaboratorEntry;
    }),

  /**
   * Removes a collaborator from a project.
   * Requires the user performing the removal to be an 'owner' of the project.
   * (Could be extended to allow 'editors' to remove 'viewers', etc.).
   * This action deletes the collaborator record.
   */
  removeCollaborator: protectedProcedure
    .input(removeCollaboratorInputSchema)
    .output(z.object({ success: z.boolean(), message: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const removerUserId = ctx.session.user.id;
      const { projectId, collaboratorUserId } = input;

      // 1. Verify the remover has 'owner' permission for the project
      const { data: removerCollaborator, error: removerCheckError } = await ctx.supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', removerUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (removerCheckError) {
        console.error("Error checking remover permission:", removerCheckError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify your project permissions.',
          cause: removerCheckError,
        });
      }

      if (!removerCollaborator || removerCollaborator.role !== 'owner') {
        // For now, only owners can remove. 
        // Could be: editors can remove viewers/editors with lower rank, but not owners.
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project owners can remove collaborators.',
        });
      }

      // 2. Prevent owner from removing themselves if they are the last owner (important!)
      //    Or if they are trying to remove another owner when there should always be at least one.
      if (collaboratorUserId === removerUserId && removerCollaborator.role === 'owner') {
        const { count, error: ownerCountError } = await ctx.supabase
            .from('project_collaborators')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .eq('role', 'owner')
            .eq('status', 'active');
        
        if (ownerCountError) {
            console.error("Error counting project owners:", ownerCountError);
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project ownership count.'});
        }
        if (count !== null && count <= 1) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot remove the last owner of the project. Transfer ownership first.'});
        }
      }
      
      // 3. Ensure the target collaborator exists to be removed (optional, delete is idempotent)
      //    However, it's good to confirm before saying "success".
      const { data: targetCollaborator, error: targetCheckError } = await ctx.supabase
        .from('project_collaborators')
        .select('id') 
        .eq('project_id', projectId)
        .eq('user_id', collaboratorUserId)
        // Not checking status here, can remove even if pending/declined/revoked to clean up
        .maybeSingle();

      if (targetCheckError) {
        console.error("Error finding target collaborator for removal:", targetCheckError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to find the collaborator for removal.' });
      }

      if (!targetCollaborator) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'The specified user is not a collaborator on this project (or already removed).' });
      }

      // 4. Delete the collaborator record
      const { error: deleteError } = await ctx.supabase
        .from('project_collaborators')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', collaboratorUserId); // Delete based on composite key effectively

      if (deleteError) {
        console.error("Error removing collaborator:", deleteError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove collaborator.',
          cause: deleteError,
        });
      }

      return { success: true, message: 'Collaborator removed successfully.' };
    }),

  // Future procedures for research item management:
  // addItem: protectedProcedure...
  // listItems: protectedProcedure...
  // ...etc.

  /**
   * Lists all active collaborators for a given project.
   * Requires the requesting user to be an active collaborator of the project.
   * Includes basic profile information for each collaborator.
   */
  listCollaborators: protectedProcedure
    .input(listCollaboratorsInputSchema)
    .output(z.array(collaboratorWithProfileSchema))
    .query(async ({ ctx, input }) => {
      const requesterUserId = ctx.session.user.id;
      const { projectId } = input;

      // 1. Verify requester access (same as before)
      const { data: requesterMembership, error: requesterCheckError } = await ctx.supabase
        .from('project_collaborators')
        .select('id', { head: true }) // Just check existence
        .eq('project_id', projectId)
        .eq('user_id', requesterUserId)
        .eq('status', 'active')
        .maybeSingle(); // Use maybeSingle to confirm it's one or none

      if (requesterCheckError) {
        console.error("Error verifying requester access for listing collaborators:", requesterCheckError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify your project access.'});
      }
      if (!requesterMembership) { // maybeSingle returns null if not found, so !requesterMembership is correct
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to view collaborators for this project.'});
      }

      // 2. Fetch collaborators and their profiles
      // Supabase TypeScript types might sometimes infer joined tables as arrays even for to-one.
      // We expect `profiles` to be an object here due to the nature of the join.
      type CollaboratorWithProfileFromSupabase = {
        id: string;
        project_id: string;
        user_id: string;
        role: 'owner' | 'editor' | 'viewer'; // Assuming from projectCollaboratorRoleSchema
        status: 'pending' | 'active' | 'declined' | 'revoked'; // Assuming from projectCollaboratorStatusSchema
        invited_by: string | null;
        created_at: string;
        updated_at: string;
        profiles: { // Expecting a single profile object or null
          id: string; // Profile's own PK
          user_id: string; // FK from profiles table
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
        } | null; // Profile can be null if no matching profile found for user_id
      };

      const { data: collaboratorsData, error: fetchError } = await ctx.supabase
        .from('project_collaborators')
        .select(`
          id,
          project_id,
          user_id,
          role,
          status,
          invited_by,
          created_at,
          updated_at,
          profiles ( 
            id,
            user_id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .eq('status', 'active')
        .returns<CollaboratorWithProfileFromSupabase[]>(); // Explicitly type the return

      if (fetchError) {
        console.error("Error fetching collaborators:", fetchError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch collaborators.',
          cause: fetchError,
        });
      }

      if (!collaboratorsData) {
        return [];
      }
      
      return collaboratorsData.map(collab => {
        const profileData = collab.profiles; // Now explicitly typed as an object or null
        
        let fullName: string | null = null;
        if (profileData && profileData.first_name && profileData.last_name) {
          fullName = `${profileData.first_name} ${profileData.last_name}`.trim();
        } else if (profileData && profileData.first_name) {
          fullName = profileData.first_name;
        }
        
        return {
          id: collab.id,
          project_id: collab.project_id,
          user_id: collab.user_id,
          role: collab.role,
          status: collab.status,
          invited_by: collab.invited_by,
          created_at: new Date(collab.created_at),
          updated_at: new Date(collab.updated_at),
          user: profileData ? {
              id: profileData.id, // Include profile's own id
              user_id: profileData.user_id,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              avatar_url: profileData.avatar_url,
          } : null,
        };
      });
      // Zod will validate the final structure against collaboratorWithProfileSchema
      // The explicit .returns<CollaboratorWithProfileFromSupabase[]>() and then mapping
      // should satisfy Zod's output parser if the mapping correctly builds the shape.
    }),

  // --- Research Item Management --- 

  /**
   * Adds a new research item (link, text_block, or file metadata) to a project.
   * Requires the user to be an 'owner' or 'editor' of the project.
   */
  addItem: protectedProcedure
    .input(addResearchItemInputSchema)
    .output(researchItemSchema) // Returns the newly created research item
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { projectId, type, ...itemData } = input;

      // 1. Verify user has 'owner' or 'editor' role for this project
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration for adding item:", collaboratorError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project access.'});
      }
      if (!collaborator || (collaborator.role !== 'owner' && collaborator.role !== 'editor')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to add items to this project.'});
      }

      // 2. Prepare data for insertion based on item type
      let dataToInsert: any = {
        project_id: projectId,
        user_id: userId, // User who added this item
        type: type,
        title: itemData.title,
        description: itemData.description,
        order: itemData.order, // Server can assign next order if undefined (logic not here yet)
      };

      switch (type) {
        case researchItemTypeSchema.Enum.link:
          dataToInsert.url = (itemData as z.infer<typeof linkItemInputSchema>).url;
          break;
        case researchItemTypeSchema.Enum.text_block:
          // Common fields are already handled
          break;
        case researchItemTypeSchema.Enum.file:
          const fileData = itemData as z.infer<typeof fileItemInputSchema>;
          dataToInsert.file_path = fileData.filePath;
          dataToInsert.file_name = fileData.fileName;
          dataToInsert.file_type = fileData.fileType;
          dataToInsert.file_size_bytes = fileData.fileSizeBytes;
          break;
        default:
          // Should not happen due to discriminated union validation
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid research item type.' });
      }
      
      // TODO: Handle `order` assignment. If `itemData.order` is undefined,
      // fetch the current max order for the project and increment.
      if (dataToInsert.order === undefined) {
        const { data: maxOrderData, error: maxOrderError } = await ctx.supabase
          .from('research_items')
          .select('order')
          .eq('project_id', projectId)
          .order('order', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (maxOrderError) {
            console.error("Error fetching max order for item:", maxOrderError);
            // Decide if this is critical enough to stop, or just default to 0
            // throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to determine item order.'});
        }
        dataToInsert.order = maxOrderData && typeof maxOrderData.order === 'number' ? maxOrderData.order + 1 : 0;
      }

      // 3. Insert the new research item
      const { data: newItem, error: insertError } = await ctx.supabase
        .from('research_items')
        .insert(dataToInsert)
        .select()
        .single();

      if (insertError) {
        console.error("Error adding research item:", insertError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to add research item.', cause: insertError });
      }
      if (!newItem) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to add research item, no data returned.' });
      }

      return newItem;
    }),

  /**
   * Lists all research items for a given project, ordered by their specified 'order'.
   * Requires the user to be an active collaborator of the project.
   */
  listItems: protectedProcedure
    .input(listItemsInputSchema)
    .output(z.array(researchItemSchema)) // Returns an array of research items
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { projectId } = input;

      // 1. Verify user is an active collaborator on this project
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('id', { head: true }) // Just check existence
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration for listing items:", collaboratorError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project access.'});
      }
      if (!collaborator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to view items for this project.'});
      }

      // 2. Fetch all research items for the project, ordered by 'order'
      const { data: items, error: fetchError } = await ctx.supabase
        .from('research_items')
        .select('*') // Select all fields defined in researchItemSchema
        .eq('project_id', projectId)
        .order('order', { ascending: true }); // Ensure items are ordered

      if (fetchError) {
        console.error("Error fetching research items:", fetchError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch research items.',
          cause: fetchError,
        });
      }

      // Supabase returns an array, or null if error/no data (handled by error check)
      // If no items, it will be an empty array, which is valid for the output type.
      // Ensure date strings are converted to Date objects if researchItemSchema expects Dates
      return (items || []).map(item => ({
        ...item,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
        // Ensure other fields like file_size_bytes (bigint/number) conform to Zod schema if needed
      }));
    }),

  /**
   * Updates an existing research item in a project.
   * Requires the user to be an 'owner' or 'editor' of the project.
   * Item type cannot be changed.
   */
  updateItem: protectedProcedure
    .input(updateResearchItemInputSchema)
    .output(researchItemSchema) // Returns the updated research item
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id: itemId, projectId, type, ...updateData } = input;

      // 1. Verify user has 'owner' or 'editor' role for this project
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration for updating item:", collaboratorError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project access.'});
      }
      if (!collaborator || (collaborator.role !== 'owner' && collaborator.role !== 'editor')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to update items in this project.'});
      }

      // 2. Fetch the existing item to verify it belongs to the project and its current type
      const { data: existingItem, error: fetchExistingError } = await ctx.supabase
        .from('research_items')
        .select('id, type, project_id')
        .eq('id', itemId)
        .single(); // Use .single() as item must exist

      if (fetchExistingError || !existingItem) {
        console.error("Error fetching existing item for update:", fetchExistingError);
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Research item not found.' });
      }
      if (existingItem.project_id !== projectId) {
        // This should ideally not happen if itemId is unique globally and user has project access checked.
        // But a good safeguard if itemId could somehow be guessed for another project.
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Item does not belong to the specified project.' });
      }
      if (existingItem.type !== type) {
        // Prevent changing the type of an item. Type change should be delete + new add.
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Cannot change item type. Expected ${existingItem.type}, got ${type}.` });
      }

      // 3. Prepare data for update. Only include fields that are actually provided in the input.
      let dataToUpdate: any = { updated_at: new Date().toISOString() };

      if (updateData.order !== undefined) dataToUpdate.order = updateData.order;
      // Handle nullable fields: if explicitly set to null, pass null. If undefined, don't update.
      if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
      if (updateData.description !== undefined) dataToUpdate.description = updateData.description;

      switch (type) {
        case researchItemTypeSchema.Enum.link:
          const linkUpdateData = updateData as Partial<z.infer<typeof updateLinkItemInputSchema>>;
          if (linkUpdateData.url !== undefined) dataToUpdate.url = linkUpdateData.url;
          break;
        case researchItemTypeSchema.Enum.text_block:
          // Common fields (title, description, order) are handled above.
          break;
        case researchItemTypeSchema.Enum.file:
          // Common fields (title, description, order) are handled above.
          // Other file-specific fields (file_path, etc.) are typically not updated this way.
          break;
        default:
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid research item type for update.' });
      }

      // 4. Update the research item
      const { data: updatedItem, error: updateError } = await ctx.supabase
        .from('research_items')
        .update(dataToUpdate)
        .eq('id', itemId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating research item:", updateError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update research item.', cause: updateError });
      }
      if (!updatedItem) {
        // Should not happen if previous checks passed and ID is correct
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update research item, no data returned.' });
      }

      return updatedItem;
    }),

  /**
   * Deletes a research item from a project.
   * Requires the user to be an 'owner' or 'editor' of the project.
   */
  deleteItem: protectedProcedure
    .input(deleteItemInputSchema)
    .output(z.object({ success: z.boolean(), message: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { itemId, projectId } = input;

      // 1. Verify user has 'owner' or 'editor' role for this project
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration for deleting item:", collaboratorError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project access.'});
      }
      if (!collaborator || (collaborator.role !== 'owner' && collaborator.role !== 'editor')) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to delete items from this project.'});
      }

      // 2. Verify the item exists and belongs to the project before deleting
      // This also implicitly checks if the item actually exists.
      const { data: existingItem, error: fetchError } = await ctx.supabase
        .from('research_items')
        .select('id') // Select minimal data
        .eq('id', itemId)
        .eq('project_id', projectId) // Crucial check
        .maybeSingle();

      if (fetchError) {
        console.error("Error verifying item before deletion:", fetchError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error verifying item before deletion.' });
      }
      if (!existingItem) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Research item not found in this project or already deleted.' });
      }

      // 3. Delete the research item
      // If it's a file item, this does NOT delete the actual file from Supabase storage.
      // That would require a separate call to ctx.supabase.storage.from('bucket-name').remove([filePath]).
      // This can be added here or handled by a separate specialized procedure if strict cleanup is needed.
      const { error: deleteError } = await ctx.supabase
        .from('research_items')
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error("Error deleting research item:", deleteError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete research item.', cause: deleteError });
      }

      return { success: true, message: 'Research item deleted successfully.' };
    }),
});

// Export type for router, can be used in frontend
export type ProjectRouter = typeof projectRouter; 