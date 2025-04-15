// Supabase client setup with typed data access
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';
import { z } from 'zod';

// Environment variables that should be set in each app's .env files
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing Supabase URL');
  return url;
};

const getSupabaseKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing Supabase key');
  return key;
};

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(getSupabaseUrl(), getSupabaseKey());

// Schema definitions using Zod for validation
// These will match the types in the PostgreSQL tables

// User Profile Schema
export const profileSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  availability: z.enum(['full-time', 'part-time', 'weekends', 'not-available']).optional(),
  interests: z.array(z.string()).optional(),
  project_history: z.array(z.string()).optional(),
  is_mentor: z.boolean().default(false),
  field_of_study: z.string().optional(),
  email: z.string().email(),
  institution: z.string().optional()
});

export type Profile = z.infer<typeof profileSchema>;

// Research Post Schema
export const researchPostSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  title: z.string().min(5).max(100),
  content: z.string().min(20),
  user_id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'private', 'connections']).default('public'),
  is_boosted: z.boolean().default(false),
  boost_end_date: z.string().datetime().optional().nullable(),
  engagement_count: z.number().int().default(0),
});

export type ResearchPost = z.infer<typeof researchPostSchema>;

// Collaborator Match Schema
export const matchSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  user_id: z.string().uuid(),
  matched_user_id: z.string().uuid(),
  status: z.enum(['pending', 'matched', 'rejected']).default('pending'),
});

export type Match = z.infer<typeof matchSchema>;

// Guild Schema
export const guildSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  creator_id: z.string().uuid(),
  logo_url: z.string().url().optional().nullable(),
  activity_score: z.number().int().default(0),
  member_count: z.number().int().default(1),
});

export type Guild = z.infer<typeof guildSchema>;

// Project Schema
export const projectSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  leader_id: z.string().uuid(),
  guild_id: z.string().uuid().optional().nullable(),
  status: z.enum(['planning', 'active', 'completed', 'archived']).default('planning'),
  tags: z.array(z.string()).optional(),
});

export type Project = z.infer<typeof projectSchema>;

// Mentor Application Schema
export const mentorApplicationSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  user_id: z.string().uuid(),
  project_idea: z.string().min(20),
  field: z.string(),
  status: z.enum(['pending', 'matched', 'rejected']).default('pending'),
  matched_mentor_id: z.string().uuid().optional().nullable(),
});

export type MentorApplication = z.infer<typeof mentorApplicationSchema>;

// Proof of Submission Schema
export const proofSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
  content_hash: z.string(),
  timestamp: z.string().datetime(),
  blockchain_tx: z.string().optional().nullable(),
});

export type Proof = z.infer<typeof proofSchema>;

// Chat Message Schema
export const messageSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  sender_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  match_id: z.string().uuid(),
  content: z.string(),
  is_read: z.boolean().default(false),
});

export type Message = z.infer<typeof messageSchema>;

// AI Review Schema
export const aiReviewSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  user_id: z.string().uuid(),
  original_text: z.string(),
  review_content: z.string(),
  suggested_edits: z.string().optional(),
  suggested_citations: z.array(z.string()).optional(),
  quality_score: z.number().min(0).max(100).optional(),
});

export type AIReview = z.infer<typeof aiReviewSchema>;

// Subscription Schema
export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  user_id: z.string().uuid(),
  stripe_customer_id: z.string(),
  stripe_subscription_id: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'trialing']).default('trialing'),
  plan_type: z.enum(['free', 'premium']).default('free'),
  current_period_end: z.string().datetime(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// Helper types for API responses
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Export all components for use in other packages
export * from './types'; 