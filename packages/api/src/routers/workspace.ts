import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { supabase, workspaceRoleSchema } from '@research-collab/db';

export const workspaceRouter = router({
  createWorkspace: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Workspace name is required'),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { name, description } = input;

      if (!user || !user.id) {
        throw new Error('User ID not found in session');
      }

      const { data, error } = await supabase
        .from('workspaces')
        .insert([
          {
            name,
            description,
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating workspace:', error);
        throw new Error('Failed to create workspace: ' + error.message);
      }

      if (!data) {
        throw new Error('Failed to create workspace, no data returned.');
      }
      
      // After creating the workspace, automatically add the owner as a member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([
          {
            workspace_id: data.id,
            user_id: user.id,
            role: 'owner', // The creator is the owner
          },
        ]);

      if (memberError) {
        console.error('Error adding owner to workspace_members:', memberError);
        // Potentially roll back workspace creation or log this for an admin to fix
        throw new Error('Workspace created, but failed to add owner as member: ' + memberError.message);
      }

      return data as any; // Cast to any for now, can be refined with output schema
    }),

  getWorkspaceById: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { workspaceId } = input;

      if (!user || !user.id) {
        throw new Error('User ID not found in session');
      }

      // First, check if the user is a member of the workspace
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle as we only care if a record exists or not

      if (memberError) {
        console.error('Error checking workspace membership:', memberError);
        throw new Error('Failed to verify workspace membership: ' + memberError.message);
      }

      if (!memberData) {
        // User is not a member of this workspace, or workspace doesn't exist
        // Throwing an error might be better than returning null to indicate an authorization issue or missing resource
        throw new Error('Workspace not found or access denied.'); 
      }

      // If user is a member, fetch the workspace details
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*') // Select all columns for now, can be refined
        .eq('id', workspaceId)
        .single();

      if (workspaceError) {
        console.error('Error fetching workspace by ID:', workspaceError);
        throw new Error('Failed to fetch workspace: ' + workspaceError.message);
      }

      if (!workspaceData) {
        // This case should ideally not be reached if member check passed and workspace exists
        // but good for robustness
        throw new Error('Workspace not found after membership check.');
      }

      return workspaceData as any; // Cast to any for now
    }),

  listUserWorkspaces: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx;

      if (!user || !user.id) {
        throw new Error('User ID not found in session');
      }

      // Fetch all workspace_members entries for the user, then join with workspaces table
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          role,
          joined_at,
          workspaces (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error listing user workspaces:', error);
        throw new Error('Failed to list workspaces: ' + error.message);
      }

      // The data will be an array of workspace_member objects, each containing the workspace details
      // We map it to return just the workspace details if needed, or the structure as is.
      // For now, returning the structure with member info and workspace details nested.
      return data || []; 
    }),

  updateWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        name: z.string().min(1, 'Workspace name cannot be empty').optional(),
        description: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { workspaceId, ...updateData } = input;

      if (!user || !user.id) {
        throw new Error('User ID not found in session');
      }

      // Check if the user is the owner of the workspace
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        console.error('Error checking workspace ownership for update:', memberError);
        throw new Error('Failed to verify workspace ownership or workspace not found.');
      }

      if (memberData.role !== 'owner') {
        throw new Error('Only the workspace owner can update the workspace.');
      }

      // Prevent attempting to update with no actual data
      if (Object.keys(updateData).length === 0) {
        throw new Error('No update data provided.');
      }

      const { data: updatedWorkspace, error: updateError } = await supabase
        .from('workspaces')
        .update(updateData)
        .eq('id', workspaceId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating workspace:', updateError);
        throw new Error('Failed to update workspace: ' + updateError.message);
      }
      
      if (!updatedWorkspace) {
        throw new Error('Failed to update workspace, no data returned.');
      }

      return updatedWorkspace as any;
    }),

  deleteWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { workspaceId } = input;

      if (!user || !user.id) {
        throw new Error('User ID not found in session');
      }

      // Check if the user is the owner of the workspace
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberData) {
        console.error('Error checking workspace ownership for delete:', memberError);
        throw new Error('Failed to verify workspace ownership or workspace not found.');
      }

      if (memberData.role !== 'owner') {
        throw new Error('Only the workspace owner can delete the workspace.');
      }

      // Proceed with deletion
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (deleteError) {
        console.error('Error deleting workspace:', deleteError);
        throw new Error('Failed to delete workspace: ' + deleteError.message);
      }

      return { success: true, message: 'Workspace deleted successfully.' };
    }),

  // Workspace Member Management
  inviteUserToWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        invitedUserId: z.string().uuid(),
        role: workspaceRoleSchema, // from @research-collab/db
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: inviter } = ctx;
      const { workspaceId, invitedUserId, role } = input;

      if (!inviter || !inviter.id) {
        throw new Error('Inviter not authenticated');
      }

      // 1. Check inviter's role in the workspace (must be owner or admin)
      const { data: inviterMemberData, error: inviterMemberError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', inviter.id)
        .eq('invitation_status', 'accepted') // Inviter must be an accepted member
        .single();

      if (inviterMemberError || !inviterMemberData) {
        throw new Error('Inviter not found in workspace or error checking permissions.');
      }
      if (!['owner', 'admin'].includes(inviterMemberData.role)) {
        throw new Error('Only workspace owners or admins can invite users.');
      }

      // 2. Check if the invited user is already an active member or has a pending invite
      const { data: existingMember, error: existingMemberError } = await supabase
        .from('workspace_members')
        .select('id, invitation_status')
        .eq('workspace_id', workspaceId)
        .eq('user_id', invitedUserId)
        .maybeSingle();

      if (existingMemberError) {
        throw new Error('Error checking existing membership for invited user.');
      }
      if (existingMember) {
        if (existingMember.invitation_status === 'accepted') {
          throw new Error('User is already an active member of this workspace.');
        }
        if (existingMember.invitation_status === 'pending') {
          throw new Error('User already has a pending invitation to this workspace.');
        }
        // If declined, we can allow a new invite by proceeding
      }
      
      // 3. Add record to workspace_members with status 'pending'
      const { data: newMember, error: newMemberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: invitedUserId,
          role: role,
          invitation_status: 'pending',
        })
        .select()
        .single();

      if (newMemberError || !newMember) {
        console.error('Error inviting user to workspace:', newMemberError);
        throw new Error('Failed to invite user to workspace.');
      }

      // 4. Create a user notification (assuming a table 'user_notifications' and appropriate schema)
      // This part depends on your existing notification setup. 
      // We'll attempt a direct insert for now.
      const { data: workspace } = await supabase.from('workspaces').select('name').eq('id', workspaceId).single();
      const workspaceName = workspace?.name || 'a workspace';
      
      const { error: notificationError } = await supabase
        .from('user_notifications') // Make sure this table exists and schema matches
        .insert({
          user_id: invitedUserId,
          type: 'workspace_invitation', // Ensure this type is in your userNotificationSchema enum
          content: `You have been invited by ${inviter.email || 'a user'} to join workspace: ${workspaceName}.`,
          link_to: `/workspaces/${workspaceId}/accept-invite`, // Example link
          sender_id: inviter.id,
        });

      if (notificationError) {
        console.warn('Failed to create notification for workspace invitation:', notificationError);
        // Don't fail the whole operation for a notification error, but log it.
      }

      return { success: true, message: 'Invitation sent successfully.', member: newMember };
    }),

  listWorkspaceMembers: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user: requester } = ctx;
      const { workspaceId } = input;

      // 1. Verify requester is an accepted member of the workspace
      const { count: requesterMemberCount, error: requesterMemberError } = await supabase
        .from('workspace_members')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId)
        .eq('user_id', requester.id)
        .eq('invitation_status', 'accepted');

      if (requesterMemberError || requesterMemberCount === 0) {
        throw new Error('Access denied or workspace not found.');
      }

      // 2. Fetch active members, joining with profiles for details
      const { data: members, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          role,
          joined_at,
          invitation_status,
          profile:profiles (id, first_name, last_name, avatar_url, email)
        `)
        .eq('workspace_id', workspaceId)
        .eq('invitation_status', 'accepted');
      
      if (membersError) {
        console.error('Error listing workspace members:', membersError);
        throw new Error('Failed to list workspace members.');
      }

      return members || [];
    }),

  listPendingInvitationsForUser: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx;
      if (!user || !user.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          joined_at, 
          workspace:workspaces (id, name, description)
        `)
        .eq('user_id', user.id)
        .eq('invitation_status', 'pending');
      
      if (error) {
        console.error('Error fetching pending invitations:', error);
        throw new Error('Failed to fetch pending invitations.');
      }
      return data || [];
    }),

  acceptWorkspaceInvitation: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { workspaceId } = input;

      if (!user || !user.id) throw new Error('User not authenticated');

      // Check if a pending invitation exists for this user and workspace
      const { data: existingInvite, error: checkError } = await supabase
        .from('workspace_members')
        .select('id, invitation_status')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .eq('invitation_status', 'pending')
        .single();

      if (checkError || !existingInvite) {
        throw new Error('No pending invitation found or error checking invitation.');
      }

      // Update invitation status to 'accepted' and set joined_at
      const { data: updatedMember, error: updateError } = await supabase
        .from('workspace_members')
        .update({
          invitation_status: 'accepted',
          joined_at: new Date().toISOString(), 
        })
        .eq('id', existingInvite.id)
        .select()
        .single();

      if (updateError || !updatedMember) {
        console.error('Error accepting invitation:', updateError);
        throw new Error('Failed to accept invitation.');
      }
      
      return { success: true, message: 'Invitation accepted.', member: updatedMember };
    }),

  declineWorkspaceInvitation: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { workspaceId } = input;

      if (!user || !user.id) throw new Error('User not authenticated');

      // Check if a pending invitation exists for this user and workspace
      const { data: existingInvite, error: checkError } = await supabase
        .from('workspace_members')
        .select('id, invitation_status')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .eq('invitation_status', 'pending')
        .single();

      if (checkError || !existingInvite) {
        throw new Error('No pending invitation found or error checking invitation.');
      }

      // Update invitation status to 'declined'
      const { error: updateError } = await supabase
        .from('workspace_members')
        .update({ invitation_status: 'declined' })
        .eq('id', existingInvite.id);

      if (updateError) {
        console.error('Error declining invitation:', updateError);
        throw new Error('Failed to decline invitation.');
      }

      return { success: true, message: 'Invitation declined.' };
    }),

  updateWorkspaceMemberRole: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        memberUserId: z.string().uuid(),
        newRole: workspaceRoleSchema, // Make sure workspaceRoleSchema is imported from @research-collab/db
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: requester } = ctx;
      const { workspaceId, memberUserId, newRole } = input;

      if (!requester || !requester.id) throw new Error('Requester not authenticated');

      // 1. Get requester's role and target member's current role
      const { data: memberRoles, error: rolesError } = await supabase
        .from('workspace_members')
        .select('user_id, role')
        .eq('workspace_id', workspaceId)
        .in('user_id', [requester.id, memberUserId])
        .eq('invitation_status', 'accepted');

      if (rolesError || !memberRoles || memberRoles.length === 0) {
        throw new Error('Error fetching member roles or members not found.');
      }

      const requesterMembership = memberRoles.find((m: { user_id: string; role: string }) => m.user_id === requester.id);
      const targetMembership = memberRoles.find((m: { user_id: string; role: string }) => m.user_id === memberUserId);

      if (!requesterMembership) throw new Error('Requester is not an active member of this workspace.');
      if (!targetMembership) throw new Error('Target user is not an active member of this workspace.');

      const requesterRole = requesterMembership.role; // No cast, use as string
      const targetRole = targetMembership.role;   // No cast, use as string

      // 2. Authorization checks
      if (!['owner', 'admin'].includes(requesterRole)) {
        throw new Error('Only workspace owners or admins can change member roles.');
      }
      if (targetRole === 'owner' && requesterRole !== 'owner') {
        throw new Error('Admins cannot change the role of an owner.');
      }
      if (targetRole === 'owner' && newRole !== 'owner' && requester.id === memberUserId) {
        throw new Error('Owners cannot demote themselves from the owner role directly. Transfer ownership first.');
      }
      if (requesterRole === 'admin' && targetRole === 'admin' && newRole === 'owner') {
        throw new Error('Admins cannot promote other admins to owner.');
      }
      if (requesterRole === 'admin' && targetRole === 'owner') {
        throw new Error('Admins cannot change an owner\'s role.');
      }
      if (newRole === targetRole) {
        throw new Error(`User is already assigned the role: ${newRole}`);
      }

      // 3. Update the role
      const { data: updatedMember, error: updateError } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('workspace_id', workspaceId)
        .eq('user_id', memberUserId)
        .select()
        .single();

      if (updateError || !updatedMember) {
        console.error('Error updating member role:', updateError);
        throw new Error('Failed to update member role.');
      }

      return { success: true, message: 'Member role updated.', member: updatedMember };
    }),

  removeUserFromWorkspace: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        memberUserIdToRemove: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: requester } = ctx;
      const { workspaceId, memberUserIdToRemove } = input;

      if (!requester || !requester.id) throw new Error('Requester not authenticated');

      // Get requester's role and target member's role
      const { data: memberRoles, error: rolesError } = await supabase
        .from('workspace_members')
        .select('user_id, role')
        .eq('workspace_id', workspaceId)
        .in('user_id', [requester.id, memberUserIdToRemove])
        .eq('invitation_status', 'accepted');
        
      if (rolesError || !memberRoles || memberRoles.length === 0) {
        // This could mean one or both users are not in the workspace, or a DB error occurred.
        // More specific error handling might be needed based on `memberRoles.length` if it's not a DB error.
        throw new Error('Error fetching member roles or one/both users not found as active members.');
      }

      const requesterMembership = memberRoles.find((m: { user_id: string; role: string }) => m.user_id === requester.id);
      const targetMembership = memberRoles.find((m: { user_id: string; role: string }) => m.user_id === memberUserIdToRemove);

      // If requester is not the one being removed, they must be an active member.
      if (requester.id !== memberUserIdToRemove && !requesterMembership) { 
          throw new Error('Requester is not an active member of this workspace or not found.');
      }
      if (!targetMembership) { // This should ideally be caught by the rolesError check if memberRoles is empty.
          throw new Error('Target user to remove is not an active member of this workspace or not found.');
      }

      const requesterRole = requesterMembership?.role; // Can be undefined if requester is removing self and not in memberRoles (e.g. if self-removal logic changes)
      const targetRole = targetMembership.role;

      // Authorization
      let canRemove = false;
      if (requester.id === memberUserIdToRemove) {
        // User is removing themselves (leaving)
        if (targetRole === 'owner') {
          const { count, error: ownerCountError } = await supabase
            .from('workspace_members')
            .select('id', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)
            .eq('role', 'owner')
            .eq('invitation_status', 'accepted');
          if (ownerCountError) {
            console.error("Error checking owner count:", ownerCountError);
            throw new Error('Error verifying workspace ownership structure.');
          }
          if (count !== null && count <= 1) { // Check count is not null before comparison
            throw new Error('Cannot leave as the sole owner. Transfer ownership or delete the workspace.');
          }
        }
        canRemove = true;
      } else if (requesterMembership && requesterRole && ['owner', 'admin'].includes(requesterRole)) {
        // Admin or Owner removing someone else
        if (targetRole === 'owner') {
          throw new Error('Owners cannot be removed. Transfer ownership first or delete the workspace.');
        }
        if (requesterRole === 'admin' && targetRole === 'admin') {
            throw new Error('Admins cannot remove other admins. Only owners can perform this action.');
        }
        canRemove = true;
      } else {
        throw new Error('You do not have permission to remove this user from the workspace.');
      }

      if (!canRemove) {
        // This path should ideally not be hit if logic above is correct.
        throw new Error('Removal permission check failed unexpectedly. This indicates a logic error.');
      }

      const { error: deleteError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', memberUserIdToRemove); // Ensure we only delete the target user

      if (deleteError) {
        console.error('Error removing user from workspace:', deleteError);
        throw new Error('Failed to remove user from workspace: ' + deleteError.message);
      }

      return { success: true, message: 'User removed from workspace successfully.' };
    }),

  // Workspace Document Management
  createWorkspaceDocument: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        title: z.string().min(1, 'Document title cannot be empty').max(255),
        documentType: z.enum([
            'Text Document',
            'Code Notebook',
            'Research Proposal',
            'Methodology',
            'Data Analysis',
            'Literature Review',
            'Generic Document',
        ]).default('Generic Document'),
        content: z.record(z.any()).optional().nullable(), // Assuming content is JSONB
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { workspaceId, title, documentType, content } = input;

      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      // RLS will handle if user can create in this workspace based on their role
      // The INSERT RLS policy also ensures created_by_user_id is auth.uid()
      const { data, error } = await supabase
        .from('workspace_documents')
        .insert({
          workspace_id: workspaceId,
          title,
          document_type: documentType,
          content,
          created_by_user_id: user.id, // Explicitly set here, RLS also checks
          last_edited_by_user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating workspace document:', error);
        throw new Error('Failed to create workspace document: ' + error.message);
      }
      if (!data) {
        throw new Error('Failed to create workspace document, no data returned.');
      }
      return data as any; 
    }),

  getWorkspaceDocumentById: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { documentId } = input;

      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      // RLS handles if the user can SELECT this document
      const { data, error } = await supabase
        .from('workspace_documents')
        .select('*, created_by:profiles!created_by_user_id(id, first_name, last_name, avatar_url), last_edited_by:profiles!last_edited_by_user_id(id, first_name, last_name, avatar_url)')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error fetching workspace document by ID:', error);
        throw new Error('Failed to fetch workspace document: ' + error.message);
      }
      if (!data) {
        // This implies either document doesn't exist or RLS prevented access
        throw new Error('Workspace document not found or access denied.'); 
      }
      return data as any;
    }),

  listWorkspaceDocuments: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { workspaceId } = input;

      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      // Before fetching documents, verify user is a member of the workspace for an extra layer of check, 
      // though RLS on workspace_documents should handle this primarily.
      const { count, error: memberCheckError } = await supabase
        .from('workspace_members')
        .select('*' , {count: 'exact', head: true})
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .eq('invitation_status', 'accepted');

      if (memberCheckError) {
        console.error('Error verifying workspace membership:', memberCheckError);
        throw new Error('Failed to verify workspace membership: ' + memberCheckError.message);
      }

      if (count === 0) {
        throw new Error('Access denied or workspace not found.');
      }
      
      // RLS handles filtering documents user can SELECT
      const { data, error } = await supabase
        .from('workspace_documents')
        .select('id, title, document_type, updated_at, created_by:profiles!created_by_user_id(first_name, last_name, avatar_url)')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error listing workspace documents:', error);
        throw new Error('Failed to list workspace documents: ' + error.message);
      }
      return data || [];
    }),

  updateWorkspaceDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        content: z.record(z.any()).optional().nullable(),
        documentType: z.enum([
            'Text Document',
            'Code Notebook',
            'Research Proposal',
            'Methodology',
            'Data Analysis',
            'Literature Review',
            'Generic Document',
        ]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { documentId, ...updatePayload } = input;

      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      if (Object.keys(updatePayload).length === 0) {
        throw new Error('No update data provided.');
      }

      const updateData: any = { ...updatePayload };
      // Always update last_edited_by_user_id on any change
      updateData.last_edited_by_user_id = user.id; 
      // updated_at is handled by the trigger

      // RLS handles if user can UPDATE this document
      const { data, error } = await supabase
        .from('workspace_documents')
        .update(updateData)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating workspace document:', error);
        throw new Error('Failed to update workspace document: ' + error.message);
      }
      if (!data) {
        throw new Error('Failed to update workspace document, no data returned or access denied.');
      }
      return data as any;
    }),

  deleteWorkspaceDocument: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { documentId } = input;

      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      // RLS handles if user can DELETE this document
      const { error } = await supabase
        .from('workspace_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Error deleting workspace document:', error);
        throw new Error('Failed to delete workspace document: ' + error.message);
      }
      return { success: true, message: 'Workspace document deleted successfully.' };
    }),

}); 