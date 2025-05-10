import { z } from 'zod';

// Slack Channel Schema
export const SlackChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_private: z.boolean(),
  created: z.string().transform(val => new Date(Number(val) * 1000)),
  creator: z.string(),
});

export type SlackChannel = z.infer<typeof SlackChannelSchema>;

// Slack User Schema
export const SlackUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  real_name: z.string().nullable(),
  display_name: z.string().nullable(),
  email: z.string().nullable(),
  is_admin: z.boolean(),
  is_bot: z.boolean(),
  status_text: z.string().nullable(),
  status_emoji: z.string().nullable(),
  image_192: z.string().nullable(),
});

export type SlackUser = z.infer<typeof SlackUserSchema>;

// Slack Message Schema
export const SlackMessageSchema = z.object({
  ts: z.string(),
  user_id: z.string(),
  channel_id: z.string(),
  text: z.string(),
  thread_ts: z.string().nullable(),
  reply_count: z.number().nullable(),
});

export type SlackMessage = z.infer<typeof SlackMessageSchema>;

// Slack Message with User data
export const SlackMessageWithUserSchema = SlackMessageSchema.extend({
  user: SlackUserSchema.optional(),
});

export type SlackMessageWithUser = z.infer<typeof SlackMessageWithUserSchema>; 