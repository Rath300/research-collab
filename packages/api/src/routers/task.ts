import { z } from 'zod';
import {
  router,
  protectedProcedure,
} from '../trpc';
import { projectTaskSchema, taskStatusSchema, taskPrioritySchema } from '@research-collab/db';
import { TRPCError } from '@trpc/server';

// Input schema for creating a task
const createTaskInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().nullish(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.nullish(),
  assignee_user_id: z.string().uuid().nullish(),
  due_date: z.coerce.date().nullish(),
  order: z.number().int().nullish(), // Optional, server can assign if not provided
});

const listTasksForProjectInputSchema = z.object({
  projectId: z.string().uuid(),
});

const getTaskByIdInputSchema = z.object({
  taskId: z.string().uuid(),
  projectId: z.string().uuid(), // Important for RLS check context and ensuring task belongs to this project
});

const updateTaskInputSchema = z.object({
  taskId: z.string().uuid(),
  projectId: z.string().uuid(), // For permission checking context
  title: z.string().min(1).optional(),
  description: z.string().nullish(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.nullish(),
  assignee_user_id: z.string().uuid().nullish(),
  due_date: z.coerce.date().nullish(),
  order: z.number().int().nullish(),
}).partial({ // Make all updateable fields optional, but taskId and projectId are required path/context params basically
  title: true,
  description: true,
  status: true,
  priority: true,
  assignee_user_id: true,
  due_date: true,
  order: true,
});

const deleteTaskInputSchema = z.object({
  taskId: z.string().uuid(),
  projectId: z.string().uuid(), // For permission checking context
});

export const taskRouter = router({
  /**
   * Creates a new task for a project.
   * Requires the user to be an active collaborator on the project.
   */
  createTask: protectedProcedure
    .input(createTaskInputSchema)
    .output(projectTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const reporterUserId = ctx.user.id;
      const { projectId, ...taskData } = input;

      // 1. Verify user is an active collaborator on this project (belt and braces for RLS)
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('id', { head: true })
        .eq('project_id', projectId)
        .eq('user_id', reporterUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration for creating task:", collaboratorError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project access.' });
      }
      if (!collaborator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to create tasks in this project.' });
      }

      // 2. Prepare data for insertion
      let dataToInsert: any = {
        project_id: projectId,
        reporter_user_id: reporterUserId,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status ?? 'todo', // Default status if not provided
        priority: taskData.priority,
        assignee_user_id: taskData.assignee_user_id,
        due_date: taskData.due_date,
        order: taskData.order,
      };

      // 3. Handle `order` assignment if not provided
      if (dataToInsert.order === null || dataToInsert.order === undefined) {
        const { data: maxOrderData, error: maxOrderError } = await ctx.supabase
          .from('project_tasks')
          .select('order')
          .eq('project_id', projectId)
          .order('order', { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle();

        if (maxOrderError) {
          console.warn("Error fetching max order for task, defaulting order to 0:", maxOrderError);
          dataToInsert.order = 0;
        } else {
          dataToInsert.order = maxOrderData && typeof maxOrderData.order === 'number' ? maxOrderData.order + 1 : 0;
        }
      }

      // 4. Insert the new task
      const { data: newTask, error: insertError } = await ctx.supabase
        .from('project_tasks')
        .insert(dataToInsert)
        .select()
        .single();

      if (insertError) {
        console.error("Error creating task:", insertError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task.', cause: insertError });
      }
      if (!newTask) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create task, no data returned.' });
      }
      
      // Ensure dates are Date objects for Zod parsing, if not already.
      // Supabase client with superjson should handle this, but explicit conversion is safer.
      return {
          ...newTask,
          due_date: newTask.due_date ? new Date(newTask.due_date) : null,
          created_at: new Date(newTask.created_at),
          updated_at: new Date(newTask.updated_at),
      };
    }),

  /**
   * Lists all tasks for a given project.
   * Requires the user to be an active collaborator on the project.
   * Tasks are ordered by their 'order' field (nulls last), then by creation date.
   */
  listTasksForProject: protectedProcedure
    .input(listTasksForProjectInputSchema)
    .output(z.array(projectTaskSchema))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { projectId } = input;

      // 1. Verify user is an active collaborator (complementing RLS)
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('id', { head: true })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration for listing tasks:", collaboratorError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project access.' });
      }
      if (!collaborator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view tasks for this project.' });
      }

      // 2. Fetch tasks for the project
      const { data: tasks, error: fetchError } = await ctx.supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('order', { ascending: true, nullsFirst: false }) // nullsFirst: false implies NULLS LAST for ascending
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error("Error fetching tasks for project:", fetchError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch tasks.', cause: fetchError });
      }

      return (tasks || []).map(task => ({
        ...task,
        due_date: task.due_date ? new Date(task.due_date) : null,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      }));
    }),

  /**
   * Fetches a single task by its ID.
   * Requires the user to be an active collaborator on the project the task belongs to.
   */
  getTaskById: protectedProcedure
    .input(getTaskByIdInputSchema)
    .output(projectTaskSchema.nullable()) // Task might not exist or user might not have access
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { taskId, projectId } = input;

      // 1. Verify user is an active collaborator on the project (complementing RLS)
      const { data: collaborator, error: collaboratorError } = await ctx.supabase
        .from('project_collaborators')
        .select('id', { head: true })
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (collaboratorError) {
        console.error("Error checking project collaboration for getting task:", collaboratorError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to verify project access.' });
      }
      if (!collaborator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to view this task.' });
      }

      // 2. Fetch the task
      const { data: task, error: fetchError } = await ctx.supabase
        .from('project_tasks')
        .select('*')
        .eq('id', taskId)
        .eq('project_id', projectId) // Ensure task belongs to the claimed project
        .single(); // Use .single() as we expect one task or an error (which RLS should prevent if no access)
    
      if (fetchError) {
        if (fetchError.code === 'PGRST116') { // PostgREST error for "Fetched result not found"
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found.' });
        }
        console.error("Error fetching task by ID:", fetchError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch task.', cause: fetchError });
      }
      
      if (!task) { // Should be caught by .single() and PGRST116, but as a fallback
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found.' });
      }

      return {
        ...task,
        due_date: task.due_date ? new Date(task.due_date) : null,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
      };
    }),

  /**
   * Updates an existing task.
   * Permissions are primarily handled by RLS:
   * - Project owners/editors can update tasks in their project.
   * - The assignee of a task can update it.
   * This procedure adds an explicit check for belonging to the project.
   */
  updateTask: protectedProcedure
    .input(updateTaskInputSchema)
    .output(projectTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { taskId, projectId, ...updateData } = input;

      // 1. Fetch the existing task to verify it belongs to the project and get current assignee (if any)
      // RLS will prevent fetching if user doesn't have SELECT access based on project collaboration.
      const { data: existingTask, error: fetchError } = await ctx.supabase
        .from('project_tasks')
        .select('id, project_id, assignee_user_id, reporter_user_id') // Select necessary fields
        .eq('id', taskId)
        .single(); // Task must exist

      if (fetchError || !existingTask) {
        if (fetchError?.code === 'PGRST116' || !existingTask) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found.' });
        }
        console.error("Error fetching task for update:", fetchError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to retrieve task for update.' });
      }

      if (existingTask.project_id !== projectId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Task does not belong to the specified project.' });
      }
      
      // At this point, RLS has allowed SELECT. Now RLS for UPDATE will be checked by Supabase.
      // The RLS policies allow owners/editors of the project OR the assignee_user_id to update.
      // No need for explicit role/assignee check here if RLS is comprehensive, but ensure RLS is indeed hit for UPDATE.

      // 2. Prepare data for update. Only include fields that are actually provided in the input.
      const dataToUpdate: { [key: string]: any } = { updated_at: new Date().toISOString() };
      let hasUpdates = false;

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) { // Check for undefined, null is a valid value to set
          dataToUpdate[key] = value;
          hasUpdates = true;
        }
      });

      if (!hasUpdates) {
        // If no actual fields to update were provided (besides taskId/projectId), 
        // we can return the existing task data (after ensuring dates are objects).
        // Or throw a BAD_REQUEST, depending on desired behavior.
        // For now, let's assume an update call implies at least one field change, or it's an error.
         throw new TRPCError({ code: 'BAD_REQUEST', message: 'No fields provided for update.'});
      }

      // 3. Perform the update
      // RLS policies on `project_tasks` for UPDATE will handle permission enforcement.
      const { data: updatedTask, error: updateError } = await ctx.supabase
        .from('project_tasks')
        .update(dataToUpdate)
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        // RLS might deny the update, which can result in a specific PostgREST error
        // or a generic one if the policy just filters out the row.
        // If PostgREST returns 0 rows updated due to RLS (and .single() then fails), it might be PGRST116 again or similar.
        if (updateError.code === 'PGRST116') { // Not found or RLS prevented update on any row
             throw new TRPCError({ code: 'FORBIDDEN', message: 'Update failed. You may not have permission or the task was not found.' });
        }
        console.error("Error updating task:", updateError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update task.', cause: updateError });
      }
      if (!updatedTask) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update task, no data returned (this should not happen if RLS allows and ID is correct).' });
      }

      return {
        ...updatedTask,
        due_date: updatedTask.due_date ? new Date(updatedTask.due_date) : null,
        created_at: new Date(updatedTask.created_at),
        updated_at: new Date(updatedTask.updated_at),
      };
    }),

  /**
   * Deletes a task.
   * Permissions are primarily handled by RLS:
   * - Project owners/editors can delete tasks in their project.
   * This procedure adds an explicit check for belonging to the project before attempting delete.
   */
  deleteTask: protectedProcedure
    .input(deleteTaskInputSchema)
    .output(z.object({ success: z.boolean(), message: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id; // For logging or future checks, not strictly needed for RLS if RLS is auth.uid() based
      const { taskId, projectId } = input;

      // 1. Verify the task exists and belongs to the project before attempting delete.
      // RLS SELECT policy allows any active collaborator to see tasks, so this check is permissible.
      const { data: existingTask, error: fetchError } = await ctx.supabase
        .from('project_tasks')
        .select('id') // Minimal select
        .eq('id', taskId)
        .eq('project_id', projectId)
        .maybeSingle(); // Use maybeSingle as it might already be deleted or not exist

      if (fetchError) {
        // Don't throw NOT_FOUND here, let the delete operation handle it or succeed if already deleted.
        // Only throw for unexpected DB errors.
        console.error("Error verifying task before deletion:", fetchError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error verifying task before deletion.' });
      }

      if (!existingTask) {
        // Task doesn't exist or doesn't belong to this project. 
        // Depending on desired idempotency, could return success or throw NOT_FOUND.
        // For now, let RLS on DELETE handle actual permission, and if it passes but item is gone, it's fine.
        // However, if we want to be strict about the projectId context given: 
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found in the specified project.' });
      }

      // 2. Perform the delete operation.
      // RLS policies on `project_tasks` for DELETE will enforce if the current user (owner/editor) can delete.
      const { error: deleteError } = await ctx.supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);
        // No .eq('project_id', projectId) here again, as existingTask check confirmed it.
        // And RLS policy for delete will use auth.uid() and project_id relation.

      if (deleteError) {
        // This could be an RLS denial if the RLS policy for DELETE didn't pass for the user.
        // Or other DB errors.
        // A clean RLS denial might not even surface as an error but just 0 rows affected.
        console.error("Error deleting task:", deleteError);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete task. You may not have permission or an unexpected error occurred.', cause: deleteError });
      }
      
      // If deleteError is null, the command executed. 
      // It doesn't tell us if a row was actually deleted (e.g. if it was already gone, or RLS filtered it out from the user's view for delete).
      // But for typical scenarios, if no error, it means the action was permitted and attempted.
      return { success: true, message: 'Task deleted successfully (or was already not found for your access level).' };
    }),
});

export type TaskRouter = typeof taskRouter; 