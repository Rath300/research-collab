import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { SlackChannelSchema, SlackMessageSchema, SlackUserSchema } from './types';

export const slackRouter = router({
  getChannels: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('slack.channels')
      .select('*');

    if (error) throw error;
    return SlackChannelSchema.array().parse(data);
  }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('slack.users')
      .select('*')
      .filter('is_bot', 'eq', false);

    if (error) throw error;
    return SlackUserSchema.array().parse(data);
  }),

  getMessages: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('slack.messages')
        .select('*')
        .eq('channel_id', input.channelId)
        .order('ts', { ascending: false })
        .limit(input.limit);

      if (error) throw error;
      
      // Get user data for each message
      const messageData = SlackMessageSchema.array().parse(data);
      
      // Get unique user IDs
      const userIds = [...new Set(messageData.map(msg => msg.user_id))];
      
      // Fetch user data if there are messages
      if (userIds.length > 0) {
        const { data: userData, error: userError } = await ctx.supabase
          .from('slack.users')
          .select('*')
          .in('id', userIds);
        
        if (userError) throw userError;
        
        const users = SlackUserSchema.array().parse(userData);
        const userMap = new Map(users.map(user => [user.id, user]));
        
        return messageData.map(msg => ({
          ...msg,
          user: userMap.get(msg.user_id),
        }));
      }
      
      return messageData;
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      text: z.string(),
      threadTs: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // For this implementation, we'll need to use Slack's Web API directly
      // This would require a separate setup with node-slack-sdk
      
      // This is a placeholder - you would need to implement the actual message sending
      // using Slack's API, as the FDW only provides read access

      throw new Error('Sending messages requires direct Slack API integration. FDW is read-only.');
    }),
});

export type SlackRouter = typeof slackRouter; 