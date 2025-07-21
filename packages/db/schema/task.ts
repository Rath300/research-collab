import { z } from 'zod';

export const taskStatusSchema = z.enum([
  'todo',
  'in_progress',
  'completed',
  'archived'
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const projectTaskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().nullable().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema.nullable().optional(),
  assignee_user_id: z.string().uuid().nullable().optional(),
  reporter_user_id: z.string().uuid(),
  due_date: z.coerce.date().nullable().optional(),
  order: z.number().int().nullable().optional(), // Keep as number for Zod, PG stores as integer
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type ProjectTask = z.infer<typeof projectTaskSchema>; 