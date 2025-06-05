"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileMatchSchema = exports.researchItemSchema = exports.researchItemTypeSchema = exports.workspaceChatMessageSchema = exports.workspaceFileSchema = exports.workspaceTaskSchema = exports.workspaceDocumentSchema = exports.workspaceDocumentTypeSchema = exports.workspaceMemberSchema = exports.workspaceSchema = exports.workspaceTaskStatusSchema = exports.workspaceRoleSchema = exports.projectCollaboratorSchema = exports.projectCollaboratorStatusSchema = exports.projectCollaboratorRoleSchema = exports.projectFileSchema = exports.userNotificationSchema = exports.researchPostMatchSchema = exports.subscriptionSchema = exports.aiReviewSchema = exports.messageSchema = exports.proofSchema = exports.mentorApplicationSchema = exports.projectSchema = exports.guildSchema = exports.matchSchema = exports.researchPostSchema = exports.profileSchema = exports.supabase = void 0;
// Supabase client setup with typed data access
var supabase_js_1 = require("@supabase/supabase-js");
var zod_1 = require("zod");
// Environment variables that should be set in each app's .env files
var getSupabaseUrl = function () {
    var url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!url)
        throw new Error('Missing Supabase URL');
    return url;
};
var getSupabaseKey = function () {
    var key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!key)
        throw new Error('Missing Supabase key');
    return key;
};
// Create a single supabase client for interacting with your database
exports.supabase = (0, supabase_js_1.createClient)(getSupabaseUrl(), getSupabaseKey());
// Schema definitions using Zod for validation
// These will match the types in the PostgreSQL tables
// User Profile Schema
exports.profileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid().optional(),
    updated_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            // Check if the date is valid before returning
            return isNaN(date.getTime()) ? null : date;
        }
        return null; // Return null if the input is not a string or Date, or if parsing fails
    }, zod_1.z.date().optional().nullable()),
    first_name: zod_1.z.string().min(1, 'First name is required').max(255).optional().nullable(),
    last_name: zod_1.z.string().min(1, 'Last name is required').max(255).optional().nullable(),
    email: zod_1.z.string().email().optional().nullable(),
    avatar_url: zod_1.z.string().url().optional().nullable(),
    institution: zod_1.z.string().max(255).optional().nullable(),
    bio: zod_1.z.string().max(2000).optional().nullable(),
    website: zod_1.z.string().url().optional().nullable(),
    skills: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    interests: zod_1.z.array(zod_1.z.string()).optional().nullable(),
    collaboration_pitch: zod_1.z.string().max(1000, "Collaboration pitch must be 1000 characters or less.").optional().nullable(),
    location: zod_1.z.string().max(255).optional().nullable(),
    field_of_study: zod_1.z.string().max(255).optional().nullable(),
    availability: zod_1.z.enum(['full-time', 'part-time', 'weekends', 'not-available']).optional().nullable(),
    has_completed_tour: zod_1.z.boolean().optional().default(false),
});
// Research Post Schema
exports.researchPostSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
    title: zod_1.z.string().min(5).max(100),
    content: zod_1.z.string().min(20),
    user_id: zod_1.z.string().uuid(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    visibility: zod_1.z.enum(['public', 'private', 'connections']).default('public'),
    is_boosted: zod_1.z.boolean().default(false),
    boost_end_date: zod_1.z.string().datetime().optional().nullable(),
    engagement_count: zod_1.z.number().int().default(0),
});
// Collaborator Match Schema
exports.matchSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    user_id_1: zod_1.z.string().uuid(),
    user_id_2: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['pending', 'matched', 'rejected']).default('pending'),
});
// Guild Schema
exports.guildSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    name: zod_1.z.string().min(3).max(50),
    description: zod_1.z.string().max(500).optional(),
    creator_id: zod_1.z.string().uuid(),
    logo_url: zod_1.z.string().url().optional().nullable(),
    activity_score: zod_1.z.number().int().default(0),
    member_count: zod_1.z.number().int().default(1),
});
// Project Schema (now aligned with research_posts table)
exports.projectSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
    title: zod_1.z.string().min(5).max(100),
    content: zod_1.z.string().min(20), // Renamed from description
    user_id: zod_1.z.string().uuid(), // Renamed from leader_id
    tags: zod_1.z.array(zod_1.z.string()).optional().nullable(), // Ensure nullable matches DB type (string[] | null)
    visibility: zod_1.z.enum(['public', 'private', 'connections']).default('public'), // Added from research_posts
    is_boosted: zod_1.z.boolean().default(false), // Added from research_posts
    engagement_count: zod_1.z.number().int().default(0), // Added from research_posts
    // Removed: guild_id, status (not in research_posts table)
});
// Mentor Application Schema
exports.mentorApplicationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    user_id: zod_1.z.string().uuid(),
    project_idea: zod_1.z.string().min(20),
    field: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'matched', 'rejected']).default('pending'),
    matched_mentor_id: zod_1.z.string().uuid().optional().nullable(),
});
// Proof of Submission Schema
exports.proofSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    user_id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(),
    content_hash: zod_1.z.string(),
    timestamp: zod_1.z.string().datetime(),
    blockchain_tx: zod_1.z.string().optional().nullable(),
});
// Chat Message Schema
exports.messageSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    sender_id: zod_1.z.string().uuid(),
    receiver_id: zod_1.z.string().uuid(),
    match_id: zod_1.z.string().uuid(),
    content: zod_1.z.string(),
    is_read: zod_1.z.boolean().default(false),
});
// AI Review Schema
exports.aiReviewSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    user_id: zod_1.z.string().uuid(),
    original_text: zod_1.z.string(),
    review_content: zod_1.z.string(),
    suggested_edits: zod_1.z.string().optional(),
    suggested_citations: zod_1.z.array(zod_1.z.string()).optional(),
    quality_score: zod_1.z.number().min(0).max(100).optional(),
});
// Subscription Schema
exports.subscriptionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime().optional(),
    user_id: zod_1.z.string().uuid(),
    stripe_customer_id: zod_1.z.string(),
    stripe_subscription_id: zod_1.z.string(),
    status: zod_1.z.enum(['active', 'canceled', 'past_due', 'trialing']).default('trialing'),
    plan_type: zod_1.z.enum(['free', 'premium']).default('free'),
    current_period_end: zod_1.z.string().datetime(),
});
// Research Post Match Schema (for users matching with research posts)
exports.researchPostMatchSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(), // User who is matching/saving
    research_post_id: zod_1.z.string().uuid(), // The research post being matched/saved
    status: zod_1.z.enum(['interested', 'matched', 'dismissed', 'saved']).default('interested'), // Extended status
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
// User Notification Schema
exports.userNotificationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(), // The user who will receive the notification
    type: zod_1.z.enum(['new_match_suggestion', 'new_direct_match', 'new_message', 'project_update', 'mention', 'general_alert', 'feedback_request']),
    content: zod_1.z.string().max(500), // Notification text
    is_read: zod_1.z.boolean().default(false),
    link_to: zod_1.z.string().optional().nullable(), // Optional link to relevant content (e.g., /research/post-id, /chats/match-id)
    sender_id: zod_1.z.string().uuid().optional().nullable(), // User who triggered the notification, if applicable
    created_at: zod_1.z.string().datetime().optional(),
});
// Project File Schema (for files attached to research posts)
exports.projectFileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    research_post_id: zod_1.z.string().uuid(), // Foreign key to research_posts table
    uploader_id: zod_1.z.string().uuid(), // User who uploaded the file
    file_name: zod_1.z.string().min(1).max(255),
    file_path: zod_1.z.string(), // Path to the file in Supabase storage (e.g., 'project-files/research_post_id/file_name.pdf')
    file_type: zod_1.z.string(), // MIME type (e.g., 'application/pdf', 'image/png')
    file_size: zod_1.z.number().int().positive(), // File size in bytes
    description: zod_1.z.string().max(500).optional().nullable(), // Optional description of the file
    created_at: zod_1.z.string().datetime().optional(),
    updated_at: zod_1.z.string().datetime().optional(),
});
// Project Collaborator Schema
exports.projectCollaboratorRoleSchema = zod_1.z.enum(['owner', 'editor', 'viewer']);
exports.projectCollaboratorStatusSchema = zod_1.z.enum(['pending', 'active', 'declined', 'revoked']);
exports.projectCollaboratorSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(), // Foreign key to projects (or research_posts if that's the definitive project table)
    user_id: zod_1.z.string().uuid(), // Foreign key to users (profiles.id or auth.users.id)
    role: exports.projectCollaboratorRoleSchema.default('viewer'),
    status: exports.projectCollaboratorStatusSchema.default('pending'), // Status of the invitation/collaboration
    invited_by: zod_1.z.string().uuid().optional().nullable(), // User ID of who sent the invitation
    created_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }, zod_1.z.date().optional().nullable()),
    updated_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }, zod_1.z.date().optional().nullable()),
});
// Enum Schemas for Workspaces
exports.workspaceRoleSchema = zod_1.z.enum([
    'owner',
    'admin',
    'editor',
    'commenter',
    'viewer',
]);
exports.workspaceTaskStatusSchema = zod_1.z.enum([
    'todo',
    'in_progress',
    'review',
    'completed',
    'archived',
]);
// Workspace Schema
exports.workspaceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Workspace name is required'),
    description: zod_1.z.string().optional().nullable(),
    owner_id: zod_1.z.string().uuid(),
    created_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date; // Return undefined for invalid dates for default to kick in
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
    updated_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
});
// Workspace Member Schema
exports.workspaceMemberSchema = zod_1.z.object({
    workspace_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    role: exports.workspaceRoleSchema.default('viewer'),
    invitation_status: zod_1.z.enum(['pending', 'accepted', 'declined']).default('accepted'),
    joined_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
});
// Workspace Document Schema
exports.workspaceDocumentTypeSchema = zod_1.z.enum([
    'Text Document',
    'Code Notebook',
    'Research Proposal',
    'Methodology',
    'Data Analysis',
    'Literature Review',
    'Generic Document',
]);
exports.workspaceDocumentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    workspace_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, 'Document title is required').max(255),
    document_type: exports.workspaceDocumentTypeSchema.default('Generic Document'),
    content: zod_1.z.record(zod_1.z.any()).optional().nullable(), // For JSONB, a general record is suitable
    created_by_user_id: zod_1.z.string().uuid(),
    last_edited_by_user_id: zod_1.z.string().uuid().optional().nullable(),
    created_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
    updated_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
});
// Workspace Task Schema
exports.workspaceTaskSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    workspace_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, 'Task title is required'),
    description: zod_1.z.string().optional().nullable(),
    status: exports.workspaceTaskStatusSchema.default('todo'),
    assigned_to_user_id: zod_1.z.string().uuid().optional().nullable(),
    due_date: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }, zod_1.z.date().optional().nullable()),
    created_by_user_id: zod_1.z.string().uuid(),
    created_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
    updated_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
});
// Workspace File Schema
exports.workspaceFileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    workspace_id: zod_1.z.string().uuid(),
    file_name: zod_1.z.string().min(1, 'File name is required'),
    storage_object_path: zod_1.z.string(),
    file_type: zod_1.z.string().optional().nullable(),
    file_size_bytes: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'number')
            return BigInt(arg);
        if (typeof arg === 'string')
            return BigInt(arg);
        return null;
    }, zod_1.z.bigint().optional().nullable()),
    description: zod_1.z.string().optional().nullable(),
    uploaded_by_user_id: zod_1.z.string().uuid(),
    created_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
});
// Workspace Chat Message Schema
exports.workspaceChatMessageSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    workspace_id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    content: zod_1.z.string().min(1, 'Message content cannot be empty'),
    parent_message_id: zod_1.z.string().uuid().optional().nullable(),
    created_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? undefined : date;
        }
        return undefined;
    }, zod_1.z.date().default(function () { return new Date(); })),
});
// Research Item Schema
exports.researchItemTypeSchema = zod_1.z.enum(['file', 'link', 'text_block']);
exports.researchItemSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    project_id: zod_1.z.string().uuid(), // Foreign key to research_posts.id
    user_id: zod_1.z.string().uuid(), // Foreign key to auth.users.id (creator/last editor of this item)
    type: exports.researchItemTypeSchema,
    order: zod_1.z.number().int().default(0), // For ordering items within a project view
    // Common field for title/description or text content
    title: zod_1.z.string().max(255).optional().nullable(), // Title for links/files, or a short heading for text_block
    description: zod_1.z.string().optional().nullable(), // Main content for text_block, or description for links/files
    // Fields for 'link'
    url: zod_1.z.string().url().optional().nullable(), // URL for 'link' type
    // Fields for 'file'
    file_path: zod_1.z.string().optional().nullable(), // Path in Supabase storage (e.g., 'project_items/{project_id}/{item_id}/{file_name}')
    file_name: zod_1.z.string().max(255).optional().nullable(), // Original file name
    file_type: zod_1.z.string().max(100).optional().nullable(), // MIME type
    file_size_bytes: zod_1.z.number().int().positive().optional().nullable(), // File size in bytes
    created_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }, zod_1.z.date().optional().nullable()),
    updated_at: zod_1.z.preprocess(function (arg) {
        if (typeof arg === 'string' || arg instanceof Date) {
            var date = new Date(arg);
            return isNaN(date.getTime()) ? null : date;
        }
        return null;
    }, zod_1.z.date().optional().nullable()),
});
// Export all components for use in other packages
__exportStar(require("./types"), exports);
// Schemas are already exported by virtue of being top-level consts with `export` keyword
// export { 
//   workspaceDocumentTypeSchema, 
//   workspaceDocumentSchema 
// };
// New schema for profile-to-profile matching
exports.profileMatchSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    matcher_user_id: zod_1.z.string().uuid({ message: "Matcher user ID must be a valid UUID." }),
    matchee_user_id: zod_1.z.string().uuid({ message: "Matchee user ID must be a valid UUID." }),
    status: zod_1.z.enum(['matched', 'rejected'], { message: "Status must be either 'matched' or 'rejected'." }),
    created_at: zod_1.z.date().optional(), // Will be set by Supabase default
});
