import { z } from 'zod';

export const projectMessageTypeSchema = z.enum(['text' /*, 'file', 'system' */]); // Extendable
export type ProjectMessageType = z.infer<typeof projectMessageTypeSchema>;

export const projectChatMessageSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  user_id: z.string().uuid(), // Sender
  content: z.string().min(1, "Message content cannot be empty."),
  parent_message_id: z.string().uuid().nullable().optional(),
  message_type: projectMessageTypeSchema.default('text'),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(), // For message editing
});
export type ProjectChatMessage = z.infer<typeof projectChatMessageSchema>; 