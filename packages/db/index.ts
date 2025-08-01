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
  full_name: z.string().max(255).optional().nullable(),
  first_name: z.string().max(255).optional().nullable(),
  last_name: z.string().max(255).optional().nullable(),
  title: z.string().max(255).optional().nullable(),
  email: z.preprocess((val) => val === '' ? null : val, z.string().email().optional().nullable()),
  avatar_url: z.preprocess((val) => val === '' ? null : val, z.string().url().optional().nullable()),
  institution: z.string().max(255).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  website: z.preprocess((val) => val === '' ? null : val, z.string().url().optional().nullable()),
  skills: z.array(z.string()).optional().nullable(),
  interests: z.array(z.string()).optional().nullable(),
  looking_for: z.array(z.string()).optional().nullable(),
  collaboration_pitch: z.string().max(1000, "Collaboration pitch must be 1000 characters or less.").optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  field_of_study: z.string().max(255).optional().nullable(),
  availability: z.enum(['full-time', 'part-time', 'weekends', 'not-available']).optional().nullable(),
  availability_hours: z.number().optional().nullable(),
  project_preference: z.enum(['remote', 'local', 'hybrid']).optional().nullable(),
  visibility: z.enum(['public', 'private', 'connections']).optional().nullable(),

  has_completed_tour: z.boolean().optional().default(false),
});

export type Profile = z.infer<typeof profileSchema>;

// Research Post Schema
// researchPostSchema: z.object({ ... }) // DEPRECATED: Use projectSchema instead

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

// Project Schema (aligned with actual projects table in database)
export const projectSchema = z.object({
  id: z.string().uuid(),
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
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  leader_id: z.string().uuid(),
  tags: z.array(z.string()).optional().nullable(),
  is_public: z.boolean().optional(),
  status: z.enum(['planning', 'active', 'completed', 'archived']).optional(),
  category: z.string().optional(),
  skills_needed: z.array(z.string()).optional(),
  collaboration_type: z.enum(['remote', 'local', 'hybrid']).optional(),
  duration: z.enum(['short_term', 'medium_term', 'long_term']).optional(),
  commitment_hours: z.number().min(1).max(40).optional(),
  location: z.string().optional(),
  deadline: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
  links: z.array(z.string()).optional(),
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
// Note: This 'messageSchema' seems to be for 1-on-1 direct messages related to a 'match_id'.
// It's different from ProjectChatMessage which is for project-specific chats.
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

// Export Project Chat Message Schema and Type
export { 
  projectChatMessageSchema, 
  type ProjectChatMessage, 
  projectMessageTypeSchema, 
  type ProjectMessageType 
} from './schema/chat_message';

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

// Project File Schema (for files attached to projects)
export const projectFileSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(), // Foreign key to projects table
  uploader_id: z.string().uuid(), // User who uploaded the file
  file_name: z.string().min(1).max(255),
  file_path: z.string(), // Path to the file in Supabase storage (e.g., 'project-files/project_id/file_name.pdf')
  file_type: z.string(), // MIME type (e.g., 'application/pdf', 'image/png')
  file_size: z.number().int().positive(), // File size in bytes
  description: z.string().max(500).optional().nullable(), // Optional description of the file
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

export type ProjectFile = z.infer<typeof projectFileSchema>;

// Project Task Schema
export const projectTaskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().max(1000).optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(), // User ID
  created_by: z.string().uuid(), // User who created the task
  status: z.enum(['todo', 'in_progress', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
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
  completed_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
});

export type ProjectTask = z.infer<typeof projectTaskSchema>;

// Project Notes Schema (for collaborative documentation/wiki)
export const projectNoteSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Note title is required').max(255),
  content: z.string().max(50000), // Rich text content
  created_by: z.string().uuid(), // User who created the note
  last_edited_by: z.string().uuid(), // User who last edited the note
  is_public: z.boolean().default(true), // Visible to all collaborators
  section: z.string().max(100).optional().nullable(), // For organizing notes (e.g., "methodology", "findings")
  tags: z.array(z.string()).optional().nullable(),
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

export type ProjectNote = z.infer<typeof projectNoteSchema>;

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

// Enum Schemas for Workspaces
export const workspaceRoleSchema = z.enum([
  'owner',
  'admin',
  'editor',
  'commenter',
  'viewer',
]);
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

export const workspaceTaskStatusSchema = z.enum([
  'todo',
  'in_progress',
  'review',
  'completed',
  'archived',
]);
export type WorkspaceTaskStatus = z.infer<typeof workspaceTaskStatusSchema>;

// Workspace Schema
export const workspaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Workspace name is required'),
  description: z.string().optional().nullable(),
  owner_id: z.string().uuid(),
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date; // Return undefined for invalid dates for default to kick in
    }
    return undefined;
  }, z.date().default(() => new Date())),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
});
export type Workspace = z.infer<typeof workspaceSchema>;

// Workspace Member Schema
export const workspaceMemberSchema = z.object({
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: workspaceRoleSchema.default('viewer'),
  invitation_status: z.enum(['pending', 'accepted', 'declined']).default('accepted'),
  joined_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
});
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;

// Workspace Document Schema
export const workspaceDocumentTypeSchema = z.enum([
  'Text Document',
  'Code Notebook',
  'Research Proposal',
  'Methodology',
  'Data Analysis',
  'Literature Review',
  'Generic Document',
]);
export type WorkspaceDocumentType = z.infer<typeof workspaceDocumentTypeSchema>;

export const workspaceDocumentSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  title: z.string().min(1, 'Document title is required').max(255),
  document_type: workspaceDocumentTypeSchema.default('Generic Document'),
  content: z.record(z.any()).optional().nullable(), // For JSONB, a general record is suitable
  created_by_user_id: z.string().uuid(),
  last_edited_by_user_id: z.string().uuid().optional().nullable(),
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
});
export type WorkspaceDocument = z.infer<typeof workspaceDocumentSchema>;

// Workspace Task Schema
export const workspaceTaskSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  status: workspaceTaskStatusSchema.default('todo'),
  assigned_to_user_id: z.string().uuid().optional().nullable(),
  due_date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }, z.date().optional().nullable()),
  created_by_user_id: z.string().uuid(),
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
  updated_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
});
export type WorkspaceTask = z.infer<typeof workspaceTaskSchema>;

// Workspace File Schema
export const workspaceFileSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  file_name: z.string().min(1, 'File name is required'),
  storage_object_path: z.string(),
  file_type: z.string().optional().nullable(),
  file_size_bytes: z.preprocess((arg) => {
    if (typeof arg === 'number') return BigInt(arg);
    if (typeof arg === 'string') return BigInt(arg);
    return null;
  }, z.bigint().optional().nullable()),
  description: z.string().optional().nullable(),
  uploaded_by_user_id: z.string().uuid(),
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
});
export type WorkspaceFile = z.infer<typeof workspaceFileSchema>;

// Workspace Chat Message Schema
export const workspaceChatMessageSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1, 'Message content cannot be empty'),
  parent_message_id: z.string().uuid().optional().nullable(),
  created_at: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().default(() => new Date())),
});
export type WorkspaceChatMessage = z.infer<typeof workspaceChatMessageSchema>;

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
// Schemas are already exported by virtue of being top-level consts with `export` keyword
// export { 
//   workspaceDocumentTypeSchema, 
//   workspaceDocumentSchema 
// };

// New schema for profile-to-profile matching
export const profileMatchSchema = z.object({
  id: z.string().uuid(),
  matcher_user_id: z.string().uuid({ message: "Matcher user ID must be a valid UUID." }),
  matchee_user_id: z.string().uuid({ message: "Matchee user ID must be a valid UUID." }),
  status: z.enum(['matched', 'rejected'], { message: "Status must be either 'matched' or 'rejected'." }),
  created_at: z.date().optional(), // Will be set by Supabase default
});
export type ProfileMatch = z.infer<typeof profileMatchSchema>;

export * from './schema/task'; 
export * from './types'; // For database.types.ts 