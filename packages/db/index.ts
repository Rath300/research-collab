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
  user_id: z.string().uuid().optional(),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      // Check if the date is valid before returning
      return isNaN(date.getTime()) ? null : date; 
    }
    return null; // Return null if the input is not a string or Date, or if parsing fails
  }, z.date().optional().nullable()),
  first_name: z.string().min(1, 'First name is required').max(255).optional().nullable(),
  last_name: z.string().min(1, 'Last name is required').max(255).optional().nullable(),
  email: z.string().email().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  institution: z.string().max(255).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  website: z.string().url().optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  interests: z.array(z.string()).optional().nullable(),
  collaboration_pitch: z.string().max(1000, "Collaboration pitch must be 1000 characters or less.").optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  field_of_study: z.string().max(255).optional().nullable(),
  availability: z.enum(['full-time', 'part-time', 'weekends', 'not-available']).optional().nullable(),
  has_completed_tour: z.boolean().optional().default(false),
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
  user_id_1: z.string().uuid(),
  user_id_2: z.string().uuid(),
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

// Project Schema (now aligned with research_posts table)
export const projectSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  title: z.string().min(5).max(100),
  content: z.string().min(20), // Renamed from description
  user_id: z.string().uuid(),    // Renamed from leader_id
  tags: z.array(z.string()).optional().nullable(), // Ensure nullable matches DB type (string[] | null)
  visibility: z.enum(['public', 'private', 'connections']).default('public'), // Added from research_posts
  is_boosted: z.boolean().default(false), // Added from research_posts
  engagement_count: z.number().int().default(0), // Added from research_posts
  // Removed: guild_id, status (not in research_posts table)
});

export type Project = z.infer<typeof projectSchema>; // This type now represents a research_post

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

// Research Post Match Schema (for users matching with research posts)
export const researchPostMatchSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(), // User who is matching/saving
  research_post_id: z.string().uuid(), // The research post being matched/saved
  status: z.enum(['interested', 'matched', 'dismissed', 'saved']).default('interested'), // Extended status
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type ResearchPostMatch = z.infer<typeof researchPostMatchSchema>;

// User Notification Schema
export const userNotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(), // The user who will receive the notification
  type: z.enum(['new_match_suggestion', 'new_direct_match', 'new_message', 'project_update', 'mention', 'general_alert', 'feedback_request']),
  content: z.string().max(500), // Notification text
  is_read: z.boolean().default(false),
  link_to: z.string().optional().nullable(), // Optional link to relevant content (e.g., /research/post-id, /chats/match-id)
  sender_id: z.string().uuid().optional().nullable(), // User who triggered the notification, if applicable
  created_at: z.string().datetime().optional(),
});

export type UserNotification = z.infer<typeof userNotificationSchema>;

// Project File Schema (for files attached to research posts)
export const projectFileSchema = z.object({
  id: z.string().uuid(),
  research_post_id: z.string().uuid(), // Foreign key to research_posts table
  uploader_id: z.string().uuid(), // User who uploaded the file
  file_name: z.string().min(1).max(255),
  file_path: z.string(), // Path to the file in Supabase storage (e.g., 'project-files/research_post_id/file_name.pdf')
  file_type: z.string(), // MIME type (e.g., 'application/pdf', 'image/png')
  file_size: z.number().int().positive(), // File size in bytes
  description: z.string().max(500).optional().nullable(), // Optional description of the file
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type ProjectFile = z.infer<typeof projectFileSchema>;

// Project Collaborator Schema
export const projectCollaboratorRoleSchema = z.enum(['owner', 'editor', 'viewer']);
export type ProjectCollaboratorRole = z.infer<typeof projectCollaboratorRoleSchema>;

export const projectCollaboratorStatusSchema = z.enum(['pending', 'active', 'declined', 'revoked']);
export type ProjectCollaboratorStatus = z.infer<typeof projectCollaboratorStatusSchema>;

export const projectCollaboratorSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(), // Foreign key to projects (or research_posts if that's the definitive project table)
  user_id: z.string().uuid(),    // Foreign key to users (profiles.id or auth.users.id)
  role: projectCollaboratorRoleSchema.default('viewer'),
  status: projectCollaboratorStatusSchema.default('pending'), // Status of the invitation/collaboration
  invited_by: z.string().uuid().optional().nullable(), // User ID of who sent the invitation
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date; 
    }
    return null;
  }, z.date().optional().nullable()),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
});

export type ProjectCollaborator = z.infer<typeof projectCollaboratorSchema>;

// Research Item Schema
export const researchItemTypeSchema = z.enum(['file', 'link', 'text_block']);
export type ResearchItemType = z.infer<typeof researchItemTypeSchema>;

export const researchItemSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(), // Foreign key to research_posts.id
  user_id: z.string().uuid(),    // Foreign key to auth.users.id (creator/last editor of this item)
  type: researchItemTypeSchema,
  order: z.number().int().default(0), // For ordering items within a project view

  // Common field for title/description or text content
  title: z.string().max(255).optional().nullable(), // Title for links/files, or a short heading for text_block
  description: z.string().optional().nullable(), // Main content for text_block, or description for links/files

  // Fields for 'link'
  url: z.string().url().optional().nullable(), // URL for 'link' type

  // Fields for 'file'
  file_path: z.string().optional().nullable(),      // Path in Supabase storage (e.g., 'project_items/{project_id}/{item_id}/{file_name}')
  file_name: z.string().max(255).optional().nullable(),      // Original file name
  file_type: z.string().max(100).optional().nullable(),      // MIME type
  file_size_bytes: z.number().int().positive().optional().nullable(), // File size in bytes
  
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date; 
    }
    return null;
  }, z.date().optional().nullable()),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
});

export type ResearchItem = z.infer<typeof researchItemSchema>;

// Helper types for API responses
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Export all components for use in other packages
export * from './types';

// New schema for profile-to-profile matching
export const profileMatchSchema = z.object({
  id: z.string().uuid(),
  matcher_user_id: z.string().uuid({ message: "Matcher user ID must be a valid UUID." }),
  matchee_user_id: z.string().uuid({ message: "Matchee user ID must be a valid UUID." }),
  status: z.enum(['matched', 'rejected'], { message: "Status must be either 'matched' or 'rejected'." }),
  created_at: z.date().optional(), // Will be set by Supabase default
});
export type ProfileMatch = z.infer<typeof profileMatchSchema>; 
    }
    return null;
  }, z.date().optional().nullable()),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
});

export type ProjectCollaborator = z.infer<typeof projectCollaboratorSchema>;

// Research Item Schema
export const researchItemTypeSchema = z.enum(['file', 'link', 'text_block']);
export type ResearchItemType = z.infer<typeof researchItemTypeSchema>;

export const researchItemSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(), // Foreign key to research_posts.id
  user_id: z.string().uuid(),    // Foreign key to auth.users.id (creator/last editor of this item)
  type: researchItemTypeSchema,
  order: z.number().int().default(0), // For ordering items within a project view

  // Common field for title/description or text content
  title: z.string().max(255).optional().nullable(), // Title for links/files, or a short heading for text_block
  description: z.string().optional().nullable(), // Main content for text_block, or description for links/files

  // Fields for 'link'
  url: z.string().url().optional().nullable(), // URL for 'link' type

  // Fields for 'file'
  file_path: z.string().optional().nullable(),      // Path in Supabase storage (e.g., 'project_items/{project_id}/{item_id}/{file_name}')
  file_name: z.string().max(255).optional().nullable(),      // Original file name
  file_type: z.string().max(100).optional().nullable(),      // MIME type
  file_size_bytes: z.number().int().positive().optional().nullable(), // File size in bytes
  
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date; 
    }
    return null;
  }, z.date().optional().nullable()),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
});

export type ResearchItem = z.infer<typeof researchItemSchema>;

// Helper types for API responses
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Export all components for use in other packages
export * from './types';

// New schema for profile-to-profile matching
export const profileMatchSchema = z.object({
  id: z.string().uuid(),
  matcher_user_id: z.string().uuid({ message: "Matcher user ID must be a valid UUID." }),
  matchee_user_id: z.string().uuid({ message: "Matchee user ID must be a valid UUID." }),
  status: z.enum(['matched', 'rejected'], { message: "Status must be either 'matched' or 'rejected'." }),
  created_at: z.date().optional(), // Will be set by Supabase default
});
export type ProfileMatch = z.infer<typeof profileMatchSchema>; 