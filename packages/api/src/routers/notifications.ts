import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const notificationsRouter = router({
  /**
   * Lists all notifications for the current user.
   */
  list: protectedProcedure
    .output(z.array(z.object({
      id: z.string().uuid(),
      user_id: z.string().uuid(),
      type: z.string(),
      content: z.string(),
      sender_id: z.string().uuid().nullable(),
      link_to: z.string().nullable(),
      is_read: z.boolean(),
      created_at: z.string(),
    })))
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      const { data: notifications, error } = await ctx.supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to most recent 50 notifications

      if (error) {
        console.error('Error fetching notifications:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notifications.',
          cause: error,
        });
      }

      return notifications || [];
    }),

  /**
   * Marks a notification as read.
   */
  markAsRead: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const { error } = await ctx.supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', input.id)
        .eq('user_id', userId); // Security: ensure user can only mark their own notifications as read

      if (error) {
        console.error('Error marking notification as read:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark notification as read.',
          cause: error,
        });
      }

      return { success: true };
    }),

  /**
   * Marks all notifications as read for the current user.
   */
  markAllAsRead: protectedProcedure
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id;

      const { error } = await ctx.supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark all notifications as read.',
          cause: error,
        });
      }

      return { success: true };
    }),

  /**
   * Gets the count of unread notifications for the current user.
   */
  getUnreadCount: protectedProcedure
    .output(z.object({ count: z.number() }))
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      const { count, error } = await ctx.supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread notification count:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get unread notification count.',
          cause: error,
        });
      }

      return { count: count || 0 };
    }),
}); 