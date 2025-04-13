import { z } from 'zod';

// Define schemas using Zod for validation
export const profileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  avatar_url: z.string().url().nullable().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').nullable().optional(),
  title: z.string().nullable().optional(),
  institution: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  email: z.string().email('Invalid email address').nullable().optional(),
  website: z.string().url('Invalid URL').nullable().optional(),
  availability: z.enum(['full-time', 'part-time', 'weekends', 'not-available']).nullable().optional(),
  field_of_study: z.string().nullable().optional(),
  interests: z.array(z.string()).nullable().optional(),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string()
    })
  ).nullable().optional(),
  joining_date: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Profile = z.infer<typeof profileSchema>;

export const researchPostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  user_id: z.string().uuid(),
  tags: z.array(z.string()).nullable().optional(),
  visibility: z.enum(['public', 'private', 'connections']),
  is_boosted: z.boolean(),
  engagement_count: z.number().int(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type ResearchPost = z.infer<typeof researchPostSchema>;

export const matchSchema = z.object({
  id: z.string().uuid(),
  user_id_1: z.string().uuid(),
  user_id_2: z.string().uuid(),
  status: z.enum(['pending', 'matched', 'rejected']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

export type Match = z.infer<typeof matchSchema>;

export const messageSchema = z.object({
  id: z.string().uuid(),
  match_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  content: z.string().min(1, 'Message cannot be empty'),
  is_read: z.boolean(),
  created_at: z.string().datetime()
});

export type Message = z.infer<typeof messageSchema>;

// Form input validation schemas for better user experience
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  agreeToTerms: z.boolean().refine((val: boolean) => val === true, 'You must agree to the terms and conditions')
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const postFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'connections']).default('public')
});

export type PostFormData = z.infer<typeof postFormSchema>;

export const profileUpdateSchema = profileSchema.partial().omit({ 
  id: true, 
  created_at: true, 
  updated_at: true, 
  joining_date: true 
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.enum(['message', 'match', 'system', 'mention']),
  title: z.string(),
  body: z.string(),
  link: z.string().nullable().optional(),
  is_read: z.boolean().default(false),
  created_at: z.string()
});

export type Notification = z.infer<typeof notificationSchema>; 