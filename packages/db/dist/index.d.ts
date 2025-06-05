import { Database } from './types';
import { z } from 'zod';
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<Database, "public", any>;
export declare const profileSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodDate>>, Date | null | undefined, unknown>;
    first_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    last_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    avatar_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    institution: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    website: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    skills: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    interests: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    collaboration_pitch: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    field_of_study: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    availability: z.ZodNullable<z.ZodOptional<z.ZodEnum<["full-time", "part-time", "weekends", "not-available"]>>>;
    has_completed_tour: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    has_completed_tour: boolean;
    user_id?: string | undefined;
    email?: string | null | undefined;
    first_name?: string | null | undefined;
    last_name?: string | null | undefined;
    availability?: "full-time" | "part-time" | "weekends" | "not-available" | null | undefined;
    avatar_url?: string | null | undefined;
    bio?: string | null | undefined;
    collaboration_pitch?: string | null | undefined;
    field_of_study?: string | null | undefined;
    institution?: string | null | undefined;
    interests?: string[] | null | undefined;
    location?: string | null | undefined;
    skills?: string[] | null | undefined;
    updated_at?: Date | null | undefined;
    website?: string | null | undefined;
}, {
    id: string;
    user_id?: string | undefined;
    email?: string | null | undefined;
    first_name?: string | null | undefined;
    last_name?: string | null | undefined;
    availability?: "full-time" | "part-time" | "weekends" | "not-available" | null | undefined;
    avatar_url?: string | null | undefined;
    bio?: string | null | undefined;
    collaboration_pitch?: string | null | undefined;
    field_of_study?: string | null | undefined;
    has_completed_tour?: boolean | undefined;
    institution?: string | null | undefined;
    interests?: string[] | null | undefined;
    location?: string | null | undefined;
    skills?: string[] | null | undefined;
    updated_at?: unknown;
    website?: string | null | undefined;
}>;
export type Profile = z.infer<typeof profileSchema>;
export declare const researchPostSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    content: z.ZodString;
    user_id: z.ZodString;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "private", "connections"]>>;
    is_boosted: z.ZodDefault<z.ZodBoolean>;
    boost_end_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    engagement_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    title: string;
    visibility: "public" | "private" | "connections";
    content: string;
    is_boosted: boolean;
    engagement_count: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    tags?: string[] | undefined;
    boost_end_date?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    visibility?: "public" | "private" | "connections" | undefined;
    tags?: string[] | undefined;
    is_boosted?: boolean | undefined;
    boost_end_date?: string | null | undefined;
    engagement_count?: number | undefined;
}>;
export type ResearchPost = z.infer<typeof researchPostSchema>;
export declare const matchSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    user_id_1: z.ZodString;
    user_id_2: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "matched", "rejected"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id_1: string;
    user_id_2: string;
    status: "pending" | "matched" | "rejected";
    created_at?: string | undefined;
}, {
    id: string;
    user_id_1: string;
    user_id_2: string;
    created_at?: string | undefined;
    status?: "pending" | "matched" | "rejected" | undefined;
}>;
export type Match = z.infer<typeof matchSchema>;
export declare const guildSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    creator_id: z.ZodString;
    logo_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    activity_score: z.ZodDefault<z.ZodNumber>;
    member_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    creator_id: string;
    activity_score: number;
    member_count: number;
    created_at?: string | undefined;
    description?: string | undefined;
    logo_url?: string | null | undefined;
}, {
    id: string;
    name: string;
    creator_id: string;
    created_at?: string | undefined;
    description?: string | undefined;
    logo_url?: string | null | undefined;
    activity_score?: number | undefined;
    member_count?: number | undefined;
}>;
export type Guild = z.infer<typeof guildSchema>;
export declare const projectSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    content: z.ZodString;
    user_id: z.ZodString;
    tags: z.ZodNullable<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    visibility: z.ZodDefault<z.ZodEnum<["public", "private", "connections"]>>;
    is_boosted: z.ZodDefault<z.ZodBoolean>;
    engagement_count: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    title: string;
    visibility: "public" | "private" | "connections";
    content: string;
    is_boosted: boolean;
    engagement_count: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    tags?: string[] | null | undefined;
}, {
    id: string;
    user_id: string;
    title: string;
    content: string;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    visibility?: "public" | "private" | "connections" | undefined;
    tags?: string[] | null | undefined;
    is_boosted?: boolean | undefined;
    engagement_count?: number | undefined;
}>;
export type Project = z.infer<typeof projectSchema>;
export declare const mentorApplicationSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    user_id: z.ZodString;
    project_idea: z.ZodString;
    field: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["pending", "matched", "rejected"]>>;
    matched_mentor_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    status: "pending" | "matched" | "rejected";
    project_idea: string;
    field: string;
    created_at?: string | undefined;
    matched_mentor_id?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    project_idea: string;
    field: string;
    created_at?: string | undefined;
    status?: "pending" | "matched" | "rejected" | undefined;
    matched_mentor_id?: string | null | undefined;
}>;
export type MentorApplication = z.infer<typeof mentorApplicationSchema>;
export declare const proofSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    user_id: z.ZodString;
    project_id: z.ZodString;
    content_hash: z.ZodString;
    timestamp: z.ZodString;
    blockchain_tx: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    project_id: string;
    content_hash: string;
    timestamp: string;
    created_at?: string | undefined;
    blockchain_tx?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    project_id: string;
    content_hash: string;
    timestamp: string;
    created_at?: string | undefined;
    blockchain_tx?: string | null | undefined;
}>;
export type Proof = z.infer<typeof proofSchema>;
export declare const messageSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    sender_id: z.ZodString;
    receiver_id: z.ZodString;
    match_id: z.ZodString;
    content: z.ZodString;
    is_read: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    match_id: string;
    receiver_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at?: string | undefined;
}, {
    id: string;
    match_id: string;
    receiver_id: string;
    sender_id: string;
    content: string;
    created_at?: string | undefined;
    is_read?: boolean | undefined;
}>;
export type Message = z.infer<typeof messageSchema>;
export declare const aiReviewSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    user_id: z.ZodString;
    original_text: z.ZodString;
    review_content: z.ZodString;
    suggested_edits: z.ZodOptional<z.ZodString>;
    suggested_citations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    quality_score: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    original_text: string;
    review_content: string;
    created_at?: string | undefined;
    suggested_edits?: string | undefined;
    suggested_citations?: string[] | undefined;
    quality_score?: number | undefined;
}, {
    id: string;
    user_id: string;
    original_text: string;
    review_content: string;
    created_at?: string | undefined;
    suggested_edits?: string | undefined;
    suggested_citations?: string[] | undefined;
    quality_score?: number | undefined;
}>;
export type AIReview = z.infer<typeof aiReviewSchema>;
export declare const subscriptionSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
    user_id: z.ZodString;
    stripe_customer_id: z.ZodString;
    stripe_subscription_id: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["active", "canceled", "past_due", "trialing"]>>;
    plan_type: z.ZodDefault<z.ZodEnum<["free", "premium"]>>;
    current_period_end: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    status: "active" | "canceled" | "past_due" | "trialing";
    stripe_customer_id: string;
    stripe_subscription_id: string;
    plan_type: "free" | "premium";
    current_period_end: string;
    created_at?: string | undefined;
}, {
    id: string;
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    current_period_end: string;
    created_at?: string | undefined;
    status?: "active" | "canceled" | "past_due" | "trialing" | undefined;
    plan_type?: "free" | "premium" | undefined;
}>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export declare const researchPostMatchSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    research_post_id: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["interested", "matched", "dismissed", "saved"]>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    research_post_id: string;
    status: "matched" | "interested" | "dismissed" | "saved";
    created_at?: string | undefined;
    updated_at?: string | undefined;
}, {
    id: string;
    user_id: string;
    research_post_id: string;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    status?: "matched" | "interested" | "dismissed" | "saved" | undefined;
}>;
export type ResearchPostMatch = z.infer<typeof researchPostMatchSchema>;
export declare const userNotificationSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    type: z.ZodEnum<["new_match_suggestion", "new_direct_match", "new_message", "project_update", "mention", "general_alert", "feedback_request"]>;
    content: z.ZodString;
    is_read: z.ZodDefault<z.ZodBoolean>;
    link_to: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    sender_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    type: "new_match_suggestion" | "new_direct_match" | "new_message" | "project_update" | "mention" | "general_alert" | "feedback_request";
    content: string;
    is_read: boolean;
    sender_id?: string | null | undefined;
    created_at?: string | undefined;
    link_to?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    type: "new_match_suggestion" | "new_direct_match" | "new_message" | "project_update" | "mention" | "general_alert" | "feedback_request";
    content: string;
    sender_id?: string | null | undefined;
    created_at?: string | undefined;
    is_read?: boolean | undefined;
    link_to?: string | null | undefined;
}>;
export type UserNotification = z.infer<typeof userNotificationSchema>;
export declare const projectFileSchema: z.ZodObject<{
    id: z.ZodString;
    research_post_id: z.ZodString;
    uploader_id: z.ZodString;
    file_name: z.ZodString;
    file_path: z.ZodString;
    file_type: z.ZodString;
    file_size: z.ZodNumber;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    research_post_id: string;
    uploader_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    description?: string | null | undefined;
}, {
    id: string;
    research_post_id: string;
    uploader_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    description?: string | null | undefined;
}>;
export type ProjectFile = z.infer<typeof projectFileSchema>;
export declare const projectCollaboratorRoleSchema: z.ZodEnum<["owner", "editor", "viewer"]>;
export type ProjectCollaboratorRole = z.infer<typeof projectCollaboratorRoleSchema>;
export declare const projectCollaboratorStatusSchema: z.ZodEnum<["pending", "active", "declined", "revoked"]>;
export type ProjectCollaboratorStatus = z.infer<typeof projectCollaboratorStatusSchema>;
export declare const projectCollaboratorSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    user_id: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["owner", "editor", "viewer"]>>;
    status: z.ZodDefault<z.ZodEnum<["pending", "active", "declined", "revoked"]>>;
    invited_by: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodDate>>, Date | null | undefined, unknown>;
    updated_at: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodDate>>, Date | null | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    project_id: string;
    status: "pending" | "active" | "declined" | "revoked";
    role: "owner" | "editor" | "viewer";
    created_at?: Date | null | undefined;
    updated_at?: Date | null | undefined;
    invited_by?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    project_id: string;
    created_at?: unknown;
    updated_at?: unknown;
    status?: "pending" | "active" | "declined" | "revoked" | undefined;
    role?: "owner" | "editor" | "viewer" | undefined;
    invited_by?: string | null | undefined;
}>;
export type ProjectCollaborator = z.infer<typeof projectCollaboratorSchema>;
export declare const workspaceRoleSchema: z.ZodEnum<["owner", "admin", "editor", "commenter", "viewer"]>;
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export declare const workspaceTaskStatusSchema: z.ZodEnum<["todo", "in_progress", "review", "completed", "archived"]>;
export type WorkspaceTaskStatus = z.infer<typeof workspaceTaskStatusSchema>;
export declare const workspaceSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    owner_id: z.ZodString;
    created_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
    updated_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    owner_id: string;
    created_at: Date;
    updated_at: Date;
    name: string;
    description?: string | null | undefined;
}, {
    id: string;
    owner_id: string;
    name: string;
    created_at?: unknown;
    updated_at?: unknown;
    description?: string | null | undefined;
}>;
export type Workspace = z.infer<typeof workspaceSchema>;
export declare const workspaceMemberSchema: z.ZodObject<{
    workspace_id: z.ZodString;
    user_id: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["owner", "admin", "editor", "commenter", "viewer"]>>;
    invitation_status: z.ZodDefault<z.ZodEnum<["pending", "accepted", "declined"]>>;
    joined_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    workspace_id: string;
    role: "owner" | "admin" | "editor" | "commenter" | "viewer";
    invitation_status: "pending" | "declined" | "accepted";
    joined_at: Date;
}, {
    user_id: string;
    workspace_id: string;
    role?: "owner" | "admin" | "editor" | "commenter" | "viewer" | undefined;
    invitation_status?: "pending" | "declined" | "accepted" | undefined;
    joined_at?: unknown;
}>;
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;
export declare const workspaceDocumentTypeSchema: z.ZodEnum<["Text Document", "Code Notebook", "Research Proposal", "Methodology", "Data Analysis", "Literature Review", "Generic Document"]>;
export type WorkspaceDocumentType = z.infer<typeof workspaceDocumentTypeSchema>;
export declare const workspaceDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    workspace_id: z.ZodString;
    title: z.ZodString;
    document_type: z.ZodDefault<z.ZodEnum<["Text Document", "Code Notebook", "Research Proposal", "Methodology", "Data Analysis", "Literature Review", "Generic Document"]>>;
    content: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    created_by_user_id: z.ZodString;
    last_edited_by_user_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
    updated_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    workspace_id: string;
    created_by_user_id: string;
    created_at: Date;
    title: string;
    updated_at: Date;
    document_type: "Text Document" | "Code Notebook" | "Research Proposal" | "Methodology" | "Data Analysis" | "Literature Review" | "Generic Document";
    last_edited_by_user_id?: string | null | undefined;
    content?: Record<string, any> | null | undefined;
}, {
    id: string;
    workspace_id: string;
    created_by_user_id: string;
    title: string;
    last_edited_by_user_id?: string | null | undefined;
    created_at?: unknown;
    updated_at?: unknown;
    content?: Record<string, any> | null | undefined;
    document_type?: "Text Document" | "Code Notebook" | "Research Proposal" | "Methodology" | "Data Analysis" | "Literature Review" | "Generic Document" | undefined;
}>;
export type WorkspaceDocument = z.infer<typeof workspaceDocumentSchema>;
export declare const workspaceTaskSchema: z.ZodObject<{
    id: z.ZodString;
    workspace_id: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodEnum<["todo", "in_progress", "review", "completed", "archived"]>>;
    assigned_to_user_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    due_date: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodDate>>, Date | null | undefined, unknown>;
    created_by_user_id: z.ZodString;
    created_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
    updated_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    workspace_id: string;
    created_by_user_id: string;
    created_at: Date;
    title: string;
    updated_at: Date;
    status: "todo" | "in_progress" | "review" | "completed" | "archived";
    assigned_to_user_id?: string | null | undefined;
    description?: string | null | undefined;
    due_date?: Date | null | undefined;
}, {
    id: string;
    workspace_id: string;
    created_by_user_id: string;
    title: string;
    assigned_to_user_id?: string | null | undefined;
    created_at?: unknown;
    updated_at?: unknown;
    status?: "todo" | "in_progress" | "review" | "completed" | "archived" | undefined;
    description?: string | null | undefined;
    due_date?: unknown;
}>;
export type WorkspaceTask = z.infer<typeof workspaceTaskSchema>;
export declare const workspaceFileSchema: z.ZodObject<{
    id: z.ZodString;
    workspace_id: z.ZodString;
    file_name: z.ZodString;
    storage_object_path: z.ZodString;
    file_type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    file_size_bytes: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodBigInt>>, bigint | null | undefined, unknown>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    uploaded_by_user_id: z.ZodString;
    created_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    workspace_id: string;
    uploaded_by_user_id: string;
    created_at: Date;
    file_name: string;
    storage_object_path: string;
    description?: string | null | undefined;
    file_type?: string | null | undefined;
    file_size_bytes?: bigint | null | undefined;
}, {
    id: string;
    workspace_id: string;
    uploaded_by_user_id: string;
    file_name: string;
    storage_object_path: string;
    created_at?: unknown;
    description?: string | null | undefined;
    file_type?: string | null | undefined;
    file_size_bytes?: unknown;
}>;
export type WorkspaceFile = z.infer<typeof workspaceFileSchema>;
export declare const workspaceChatMessageSchema: z.ZodObject<{
    id: z.ZodString;
    workspace_id: z.ZodString;
    user_id: z.ZodString;
    content: z.ZodString;
    parent_message_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodEffects<z.ZodDefault<z.ZodDate>, Date, unknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    workspace_id: string;
    created_at: Date;
    content: string;
    parent_message_id?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    workspace_id: string;
    content: string;
    parent_message_id?: string | null | undefined;
    created_at?: unknown;
}>;
export type WorkspaceChatMessage = z.infer<typeof workspaceChatMessageSchema>;
export declare const researchItemTypeSchema: z.ZodEnum<["file", "link", "text_block"]>;
export type ResearchItemType = z.infer<typeof researchItemTypeSchema>;
export declare const researchItemSchema: z.ZodObject<{
    id: z.ZodString;
    project_id: z.ZodString;
    user_id: z.ZodString;
    type: z.ZodEnum<["file", "link", "text_block"]>;
    order: z.ZodDefault<z.ZodNumber>;
    title: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    file_path: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    file_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    file_type: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    file_size_bytes: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    created_at: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodDate>>, Date | null | undefined, unknown>;
    updated_at: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodDate>>, Date | null | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    project_id: string;
    type: "link" | "file" | "text_block";
    order: number;
    created_at?: Date | null | undefined;
    title?: string | null | undefined;
    updated_at?: Date | null | undefined;
    description?: string | null | undefined;
    file_name?: string | null | undefined;
    file_path?: string | null | undefined;
    file_type?: string | null | undefined;
    file_size_bytes?: number | null | undefined;
    url?: string | null | undefined;
}, {
    id: string;
    user_id: string;
    project_id: string;
    type: "link" | "file" | "text_block";
    created_at?: unknown;
    title?: string | null | undefined;
    updated_at?: unknown;
    description?: string | null | undefined;
    file_name?: string | null | undefined;
    file_path?: string | null | undefined;
    file_type?: string | null | undefined;
    file_size_bytes?: number | null | undefined;
    order?: number | undefined;
    url?: string | null | undefined;
}>;
export type ResearchItem = z.infer<typeof researchItemSchema>;
export type SupabaseResponse<T> = {
    data: T | null;
    error: Error | null;
};
export * from './types';
export declare const profileMatchSchema: z.ZodObject<{
    id: z.ZodString;
    matcher_user_id: z.ZodString;
    matchee_user_id: z.ZodString;
    status: z.ZodEnum<["matched", "rejected"]>;
    created_at: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    matchee_user_id: string;
    matcher_user_id: string;
    status: "matched" | "rejected";
    created_at?: Date | undefined;
}, {
    id: string;
    matchee_user_id: string;
    matcher_user_id: string;
    status: "matched" | "rejected";
    created_at?: Date | undefined;
}>;
export type ProfileMatch = z.infer<typeof profileMatchSchema>;
//# sourceMappingURL=index.d.ts.map