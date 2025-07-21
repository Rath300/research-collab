import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { projectChatMessageSchema, type ProjectChatMessage } from '@research-collab/db'; // Added ProjectChatMessage type
import { TRPCError } from '@trpc/server';

export const chatRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        content: z.string().min(1).max(2000),
        parentMessageId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { supabase, user } = ctx;
      const { projectId, content, parentMessageId } = input;
      const userId = user.id;

      const { data, error } = await supabase
        .from('project_chat_messages')
        .insert({
          project_id: projectId,
          user_id: userId,
          content: content,
          parent_message_id: parentMessageId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message. ' + error.message,
        });
      }
      if (!data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message, no data returned.',
        });
      }
      // Explicitly parse to ensure the data conforms to the schema before returning
      try {
        return projectChatMessageSchema.parse(data) as ProjectChatMessage;
      } catch (validationError) {
        console.error('Zod validation error for sent message:', validationError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Sent message data does not match expected schema.',
        });
      }
    }),

  listMessagesForProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().datetime({ precision: 3, offset: true }).optional(), // ISO string for cursor
      }),
    )
    .query(async ({ ctx, input }) => {
      const { supabase } = ctx;
      const { projectId, limit, cursor } = input;

      let query = supabase
        .from('project_chat_messages')
        .select(`
          *,
          sender: profiles (id, first_name, last_name, avatar_url)
        `) // Corrected select string, ensure profiles is the correct related table name
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error listing messages:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list messages. ' + error.message,
        });
      }
      
      const messagesWithSenderSchema = z.array(
        projectChatMessageSchema.extend({
          sender: z.object({
            id: z.string().uuid(),
            first_name: z.string().nullable().optional(), // Optional for profiles that may not have it
            last_name: z.string().nullable().optional(), // Optional
            avatar_url: z.string().url().nullable().optional(), // Optional
          }).nullable(), 
        })
      );

      const validatedData = messagesWithSenderSchema.safeParse(data);

      if (!validatedData.success) {
        console.error('Zod validation error for messages:', validatedData.error.format());
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse messages from database.',
          cause: validatedData.error,
        });
      }

      let nextCursor: string | undefined = undefined;
      if (validatedData.data.length === limit) {
        // Ensure created_at is a Date object before calling toISOString()
        const lastMessage = validatedData.data[validatedData.data.length - 1];
        if (lastMessage && lastMessage.created_at instanceof Date) {
          nextCursor = lastMessage.created_at.toISOString();
        } else if (lastMessage && typeof lastMessage.created_at === 'string') {
          // If it's already a string, try to parse and reformat, or use as is if valid ISO
          try {
            nextCursor = new Date(lastMessage.created_at).toISOString();
          } catch (e) {
            // Potentially log this issue: date string was not parsable
            // Depending on Supabase client version, it might already be an ISO string
            nextCursor = lastMessage.created_at; 
          }
        }
      }

      return {
        messages: validatedData.data,
        nextCursor,
      };
    }),
}); 