export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    public: {
        Tables: {
            collaborator_matches: {
                Row: {
                    created_at: string | null;
                    id: string;
                    status: string;
                    target_user_id: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    status: string;
                    target_user_id: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    status?: string;
                    target_user_id?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "collaborator_matches_target_user_id_fkey";
                        columns: ["target_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "collaborator_matches_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            conversation_participants: {
                Row: {
                    conversation_id: string;
                    created_at: string | null;
                    id: string;
                    user_id: string;
                };
                Insert: {
                    conversation_id: string;
                    created_at?: string | null;
                    id?: string;
                    user_id: string;
                };
                Update: {
                    conversation_id?: string;
                    created_at?: string | null;
                    id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "conversation_participants_conversation_id_fkey";
                        columns: ["conversation_id"];
                        isOneToOne: false;
                        referencedRelation: "conversations";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "conversation_participants_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            conversations: {
                Row: {
                    created_at: string | null;
                    id: string;
                    updated_at: string | null;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    updated_at?: string | null;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    updated_at?: string | null;
                };
                Relationships: [];
            };
            matches: {
                Row: {
                    created_at: string;
                    id: string;
                    status: string;
                    updated_at: string;
                    user_id_1: string;
                    user_id_2: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    status?: string;
                    updated_at?: string;
                    user_id_1: string;
                    user_id_2: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    status?: string;
                    updated_at?: string;
                    user_id_1?: string;
                    user_id_2?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "matches_user_id_1_fkey";
                        columns: ["user_id_1"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "matches_user_id_2_fkey";
                        columns: ["user_id_2"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            messages: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    is_read: boolean | null;
                    match_id: string;
                    receiver_id: string;
                    sender_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    is_read?: boolean | null;
                    match_id: string;
                    receiver_id: string;
                    sender_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    is_read?: boolean | null;
                    match_id?: string;
                    receiver_id?: string;
                    sender_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "messages_match_id_fkey";
                        columns: ["match_id"];
                        isOneToOne: false;
                        referencedRelation: "matches";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "messages_receiver_id_fkey";
                        columns: ["receiver_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey";
                        columns: ["sender_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            notifications: {
                Row: {
                    created_at: string | null;
                    id: string;
                    message: string;
                    project_id: string;
                    read: boolean | null;
                    updated_at: string | null;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    message: string;
                    project_id: string;
                    read?: boolean | null;
                    updated_at?: string | null;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    message?: string;
                    project_id?: string;
                    read?: boolean | null;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "notifications_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    }
                ];
            };
            onboarding_status: {
                Row: {
                    collaborator_matched: boolean | null;
                    created_at: string;
                    id: string;
                    profile_completed: boolean | null;
                    project_created: boolean | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    collaborator_matched?: boolean | null;
                    created_at?: string;
                    id?: string;
                    profile_completed?: boolean | null;
                    project_created?: boolean | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    collaborator_matched?: boolean | null;
                    created_at?: string;
                    id?: string;
                    profile_completed?: boolean | null;
                    project_created?: boolean | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            post_comments: {
                Row: {
                    content: string;
                    created_at: string | null;
                    id: string;
                    post_id: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string | null;
                    id?: string;
                    post_id: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string | null;
                    id?: string;
                    post_id?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "post_comments_post_id_fkey";
                        columns: ["post_id"];
                        isOneToOne: false;
                        referencedRelation: "research_posts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "post_comments_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            post_likes: {
                Row: {
                    created_at: string | null;
                    id: string;
                    post_id: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    post_id: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    post_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "post_likes_post_id_fkey";
                        columns: ["post_id"];
                        isOneToOne: false;
                        referencedRelation: "research_posts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "post_likes_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profile_matches: {
                Row: {
                    created_at: string;
                    id: string;
                    matchee_user_id: string;
                    matcher_user_id: string;
                    status: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    matchee_user_id: string;
                    matcher_user_id: string;
                    status: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    matchee_user_id?: string;
                    matcher_user_id?: string;
                    status?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "profile_matches_matchee_user_id_fkey";
                        columns: ["matchee_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "profile_matches_matcher_user_id_fkey";
                        columns: ["matcher_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            profiles: {
                Row: {
                    availability: string | null;
                    availability_hours: number | null;
                    avatar_url: string | null;
                    bio: string | null;
                    collaboration_pitch: string | null;
                    created_at: string;
                    education: Json | null;
                    email: string | null;
                    field_of_study: string | null;
                    first_name: string;
                    full_name: string | null;
                    has_completed_tour: boolean;
                    id: string;
                    institution: string | null;
                    interests: string[] | null;
                    joining_date: string;
                    last_name: string;
                    location: string | null;
                    looking_for: string[] | null;
                    project_preference: string | null;
                    skills: string[] | null;
                    title: string | null;
                    updated_at: string;
                    user_id: string;
                    visibility: string | null;
                    website: string | null;
                };
                Insert: {
                    availability?: string | null;
                    availability_hours?: number | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    collaboration_pitch?: string | null;
                    created_at?: string;
                    education?: Json | null;
                    email?: string | null;
                    field_of_study?: string | null;
                    first_name: string;
                    full_name?: string | null;
                    has_completed_tour?: boolean;
                    id: string;
                    institution?: string | null;
                    interests?: string[] | null;
                    joining_date?: string;
                    last_name: string;
                    location?: string | null;
                    looking_for?: string[] | null;
                    project_preference?: string | null;
                    skills?: string[] | null;
                    title?: string | null;
                    updated_at?: string;
                    user_id: string;
                    visibility?: string | null;
                    website?: string | null;
                };
                Update: {
                    availability?: string | null;
                    availability_hours?: number | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    collaboration_pitch?: string | null;
                    created_at?: string;
                    education?: Json | null;
                    email?: string | null;
                    field_of_study?: string | null;
                    first_name?: string;
                    full_name?: string | null;
                    has_completed_tour?: boolean;
                    id?: string;
                    institution?: string | null;
                    interests?: string[] | null;
                    joining_date?: string;
                    last_name?: string;
                    location?: string | null;
                    looking_for?: string[] | null;
                    project_preference?: string | null;
                    skills?: string[] | null;
                    title?: string | null;
                    updated_at?: string;
                    user_id?: string;
                    visibility?: string | null;
                    website?: string | null;
                };
                Relationships: [];
            };
            project_activity_log: {
                Row: {
                    action_type: string;
                    created_at: string | null;
                    details: Json | null;
                    id: string;
                    project_id: string;
                    user_id: string | null;
                };
                Insert: {
                    action_type: string;
                    created_at?: string | null;
                    details?: Json | null;
                    id?: string;
                    project_id: string;
                    user_id?: string | null;
                };
                Update: {
                    action_type?: string;
                    created_at?: string | null;
                    details?: Json | null;
                    id?: string;
                    project_id?: string;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_activity_log_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "project_activity_log_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            project_chat_messages: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    message_type: string;
                    parent_message_id: string | null;
                    project_id: string;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    message_type?: string;
                    parent_message_id?: string | null;
                    project_id: string;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    message_type?: string;
                    parent_message_id?: string | null;
                    project_id?: string;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_chat_messages_parent_message_id_fkey";
                        columns: ["parent_message_id"];
                        isOneToOne: false;
                        referencedRelation: "project_chat_messages";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "project_chat_messages_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "research_posts";
                        referencedColumns: ["id"];
                    }
                ];
            };
            project_collaborators: {
                Row: {
                    created_at: string | null;
                    id: string;
                    invited_by: string | null;
                    project_id: string;
                    role: string;
                    status: Database["public"]["Enums"]["project_collaborator_status"];
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    invited_by?: string | null;
                    project_id: string;
                    role: string;
                    status?: Database["public"]["Enums"]["project_collaborator_status"];
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    invited_by?: string | null;
                    project_id?: string;
                    role?: string;
                    status?: Database["public"]["Enums"]["project_collaborator_status"];
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_collaborators_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    }
                ];
            };
            project_documents: {
                Row: {
                    content: string | null;
                    created_at: string | null;
                    document_type: string;
                    file_size_kb: number | null;
                    id: string;
                    last_edited_at: string | null;
                    last_edited_by_user_id: string | null;
                    project_id: string;
                    storage_path: string | null;
                    title: string;
                    updated_at: string | null;
                    uploader_user_id: string;
                };
                Insert: {
                    content?: string | null;
                    created_at?: string | null;
                    document_type: string;
                    file_size_kb?: number | null;
                    id?: string;
                    last_edited_at?: string | null;
                    last_edited_by_user_id?: string | null;
                    project_id: string;
                    storage_path?: string | null;
                    title: string;
                    updated_at?: string | null;
                    uploader_user_id: string;
                };
                Update: {
                    content?: string | null;
                    created_at?: string | null;
                    document_type?: string;
                    file_size_kb?: number | null;
                    id?: string;
                    last_edited_at?: string | null;
                    last_edited_by_user_id?: string | null;
                    project_id?: string;
                    storage_path?: string | null;
                    title?: string;
                    updated_at?: string | null;
                    uploader_user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_documents_last_edited_by_user_id_fkey";
                        columns: ["last_edited_by_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "project_documents_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "project_documents_uploader_user_id_fkey";
                        columns: ["uploader_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            project_files: {
                Row: {
                    created_at: string;
                    description: string | null;
                    file_name: string;
                    file_path: string;
                    file_size: number;
                    file_type: string;
                    id: string;
                    research_post_id: string;
                    updated_at: string;
                    uploader_id: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    file_name: string;
                    file_path: string;
                    file_size: number;
                    file_type: string;
                    id?: string;
                    research_post_id: string;
                    updated_at?: string;
                    uploader_id: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    file_name?: string;
                    file_path?: string;
                    file_size?: number;
                    file_type?: string;
                    id?: string;
                    research_post_id?: string;
                    updated_at?: string;
                    uploader_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_files_research_post_id_fkey";
                        columns: ["research_post_id"];
                        isOneToOne: false;
                        referencedRelation: "research_posts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "project_files_uploader_id_fkey";
                        columns: ["uploader_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            project_members: {
                Row: {
                    created_at: string | null;
                    id: string;
                    project_id: string;
                    role: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    project_id: string;
                    role: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    project_id?: string;
                    role?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_members_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "project_members_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            project_tasks: {
                Row: {
                    assignee_user_id: string | null;
                    created_at: string;
                    description: string | null;
                    due_date: string | null;
                    id: string;
                    order: number | null;
                    priority: Database["public"]["Enums"]["project_task_priority"] | null;
                    project_id: string;
                    reporter_user_id: string;
                    status: Database["public"]["Enums"]["project_task_status"];
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    assignee_user_id?: string | null;
                    created_at?: string;
                    description?: string | null;
                    due_date?: string | null;
                    id?: string;
                    order?: number | null;
                    priority?: Database["public"]["Enums"]["project_task_priority"] | null;
                    project_id: string;
                    reporter_user_id: string;
                    status?: Database["public"]["Enums"]["project_task_status"];
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    assignee_user_id?: string | null;
                    created_at?: string;
                    description?: string | null;
                    due_date?: string | null;
                    id?: string;
                    order?: number | null;
                    priority?: Database["public"]["Enums"]["project_task_priority"] | null;
                    project_id?: string;
                    reporter_user_id?: string;
                    status?: Database["public"]["Enums"]["project_task_status"];
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_tasks_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "research_posts";
                        referencedColumns: ["id"];
                    }
                ];
            };
            project_timeline_milestones: {
                Row: {
                    completed: boolean | null;
                    created_at: string | null;
                    description: string | null;
                    due_date: string | null;
                    id: string;
                    milestone_name: string;
                    order_index: number | null;
                    project_id: string;
                };
                Insert: {
                    completed?: boolean | null;
                    created_at?: string | null;
                    description?: string | null;
                    due_date?: string | null;
                    id?: string;
                    milestone_name: string;
                    order_index?: number | null;
                    project_id: string;
                };
                Update: {
                    completed?: boolean | null;
                    created_at?: string | null;
                    description?: string | null;
                    due_date?: string | null;
                    id?: string;
                    milestone_name?: string;
                    order_index?: number | null;
                    project_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "project_timeline_milestones_project_id_fkey";
                        columns: ["project_id"];
                        isOneToOne: false;
                        referencedRelation: "projects";
                        referencedColumns: ["id"];
                    }
                ];
            };
            projects: {
                Row: {
                    category: string | null;
                    collaboration_type: string | null;
                    commitment_hours: number | null;
                    created_at: string | null;
                    deadline: string | null;
                    description: string;
                    duration: string | null;
                    id: string;
                    is_public: boolean | null;
                    leader_id: string;
                    links: string[] | null;
                    location: string | null;
                    skills_needed: string[] | null;
                    status: string | null;
                    tags: string[] | null;
                    title: string;
                    updated_at: string | null;
                };
                Insert: {
                    category?: string | null;
                    collaboration_type?: string | null;
                    commitment_hours?: number | null;
                    created_at?: string | null;
                    deadline?: string | null;
                    description: string;
                    duration?: string | null;
                    id?: string;
                    is_public?: boolean | null;
                    leader_id: string;
                    links?: string[] | null;
                    location?: string | null;
                    skills_needed?: string[] | null;
                    status?: string | null;
                    tags?: string[] | null;
                    title: string;
                    updated_at?: string | null;
                };
                Update: {
                    category?: string | null;
                    collaboration_type?: string | null;
                    commitment_hours?: number | null;
                    created_at?: string | null;
                    deadline?: string | null;
                    description?: string;
                    duration?: string | null;
                    id?: string;
                    is_public?: boolean | null;
                    leader_id?: string;
                    links?: string[] | null;
                    location?: string | null;
                    skills_needed?: string[] | null;
                    status?: string | null;
                    tags?: string[] | null;
                    title?: string;
                    updated_at?: string | null;
                };
                Relationships: [];
            };
            research_post_matches: {
                Row: {
                    created_at: string;
                    id: string;
                    research_post_id: string;
                    status: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    research_post_id: string;
                    status?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    research_post_id?: string;
                    status?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "research_post_matches_research_post_id_fkey";
                        columns: ["research_post_id"];
                        isOneToOne: false;
                        referencedRelation: "research_posts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "research_post_matches_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            research_posts: {
                Row: {
                    content: string;
                    created_at: string;
                    engagement_count: number | null;
                    id: string;
                    is_boosted: boolean | null;
                    tags: string[] | null;
                    title: string;
                    updated_at: string;
                    user_id: string;
                    visibility: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    engagement_count?: number | null;
                    id?: string;
                    is_boosted?: boolean | null;
                    tags?: string[] | null;
                    title: string;
                    updated_at?: string;
                    user_id: string;
                    visibility?: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    engagement_count?: number | null;
                    id?: string;
                    is_boosted?: boolean | null;
                    tags?: string[] | null;
                    title?: string;
                    updated_at?: string;
                    user_id?: string;
                    visibility?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "research_posts_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            research_projects: {
                Row: {
                    categories: string[] | null;
                    created_at: string | null;
                    description: string | null;
                    end_date: string | null;
                    id: string;
                    owner_id: string | null;
                    start_date: string | null;
                    status: string | null;
                    tags: string[] | null;
                    title: string;
                    updated_at: string | null;
                    visibility: string | null;
                };
                Insert: {
                    categories?: string[] | null;
                    created_at?: string | null;
                    description?: string | null;
                    end_date?: string | null;
                    id?: string;
                    owner_id?: string | null;
                    start_date?: string | null;
                    status?: string | null;
                    tags?: string[] | null;
                    title: string;
                    updated_at?: string | null;
                    visibility?: string | null;
                };
                Update: {
                    categories?: string[] | null;
                    created_at?: string | null;
                    description?: string | null;
                    end_date?: string | null;
                    id?: string;
                    owner_id?: string | null;
                    start_date?: string | null;
                    status?: string | null;
                    tags?: string[] | null;
                    title?: string;
                    updated_at?: string | null;
                    visibility?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "research_projects_owner_id_fkey";
                        columns: ["owner_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            user_notifications: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    is_read: boolean;
                    link_to: string | null;
                    sender_id: string | null;
                    type: string;
                    user_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    is_read?: boolean;
                    link_to?: string | null;
                    sender_id?: string | null;
                    type: string;
                    user_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    is_read?: boolean;
                    link_to?: string | null;
                    sender_id?: string | null;
                    type?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_notifications_sender_id_fkey";
                        columns: ["sender_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "user_notifications_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
            workspace_chat_messages: {
                Row: {
                    content: string;
                    created_at: string;
                    id: string;
                    parent_message_id: string | null;
                    user_id: string;
                    workspace_id: string;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    id?: string;
                    parent_message_id?: string | null;
                    user_id: string;
                    workspace_id: string;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    id?: string;
                    parent_message_id?: string | null;
                    user_id?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "workspace_chat_messages_parent_message_id_fkey";
                        columns: ["parent_message_id"];
                        isOneToOne: false;
                        referencedRelation: "workspace_chat_messages";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_chat_messages_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_chat_messages_workspace_id_fkey";
                        columns: ["workspace_id"];
                        isOneToOne: false;
                        referencedRelation: "workspaces";
                        referencedColumns: ["id"];
                    }
                ];
            };
            workspace_documents: {
                Row: {
                    content: Json | null;
                    created_at: string;
                    created_by_user_id: string;
                    document_type: Database["public"]["Enums"]["workspace_document_type"];
                    id: string;
                    last_edited_by_user_id: string | null;
                    title: string;
                    updated_at: string;
                    workspace_id: string;
                };
                Insert: {
                    content?: Json | null;
                    created_at?: string;
                    created_by_user_id: string;
                    document_type?: Database["public"]["Enums"]["workspace_document_type"];
                    id?: string;
                    last_edited_by_user_id?: string | null;
                    title: string;
                    updated_at?: string;
                    workspace_id: string;
                };
                Update: {
                    content?: Json | null;
                    created_at?: string;
                    created_by_user_id?: string;
                    document_type?: Database["public"]["Enums"]["workspace_document_type"];
                    id?: string;
                    last_edited_by_user_id?: string | null;
                    title?: string;
                    updated_at?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "workspace_documents_created_by_user_id_fkey";
                        columns: ["created_by_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_documents_last_edited_by_user_id_fkey";
                        columns: ["last_edited_by_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_documents_workspace_id_fkey";
                        columns: ["workspace_id"];
                        isOneToOne: false;
                        referencedRelation: "workspaces";
                        referencedColumns: ["id"];
                    }
                ];
            };
            workspace_files: {
                Row: {
                    created_at: string;
                    description: string | null;
                    file_name: string;
                    file_size_bytes: number | null;
                    file_type: string | null;
                    id: string;
                    storage_object_path: string;
                    uploaded_by_user_id: string;
                    workspace_id: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    file_name: string;
                    file_size_bytes?: number | null;
                    file_type?: string | null;
                    id?: string;
                    storage_object_path: string;
                    uploaded_by_user_id: string;
                    workspace_id: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    file_name?: string;
                    file_size_bytes?: number | null;
                    file_type?: string | null;
                    id?: string;
                    storage_object_path?: string;
                    uploaded_by_user_id?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "workspace_files_uploaded_by_user_id_fkey";
                        columns: ["uploaded_by_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_files_workspace_id_fkey";
                        columns: ["workspace_id"];
                        isOneToOne: false;
                        referencedRelation: "workspaces";
                        referencedColumns: ["id"];
                    }
                ];
            };
            workspace_members: {
                Row: {
                    invitation_status: string;
                    joined_at: string;
                    role: Database["public"]["Enums"]["workspace_role"];
                    user_id: string;
                    workspace_id: string;
                };
                Insert: {
                    invitation_status?: string;
                    joined_at?: string;
                    role?: Database["public"]["Enums"]["workspace_role"];
                    user_id: string;
                    workspace_id: string;
                };
                Update: {
                    invitation_status?: string;
                    joined_at?: string;
                    role?: Database["public"]["Enums"]["workspace_role"];
                    user_id?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "workspace_members_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_members_workspace_id_fkey";
                        columns: ["workspace_id"];
                        isOneToOne: false;
                        referencedRelation: "workspaces";
                        referencedColumns: ["id"];
                    }
                ];
            };
            workspace_tasks: {
                Row: {
                    assigned_to_user_id: string | null;
                    created_at: string;
                    created_by_user_id: string;
                    description: string | null;
                    due_date: string | null;
                    id: string;
                    status: Database["public"]["Enums"]["workspace_task_status"];
                    title: string;
                    updated_at: string;
                    workspace_id: string;
                };
                Insert: {
                    assigned_to_user_id?: string | null;
                    created_at?: string;
                    created_by_user_id: string;
                    description?: string | null;
                    due_date?: string | null;
                    id?: string;
                    status?: Database["public"]["Enums"]["workspace_task_status"];
                    title: string;
                    updated_at?: string;
                    workspace_id: string;
                };
                Update: {
                    assigned_to_user_id?: string | null;
                    created_at?: string;
                    created_by_user_id?: string;
                    description?: string | null;
                    due_date?: string | null;
                    id?: string;
                    status?: Database["public"]["Enums"]["workspace_task_status"];
                    title?: string;
                    updated_at?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "workspace_tasks_assigned_to_user_id_fkey";
                        columns: ["assigned_to_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_tasks_created_by_user_id_fkey";
                        columns: ["created_by_user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "workspace_tasks_workspace_id_fkey";
                        columns: ["workspace_id"];
                        isOneToOne: false;
                        referencedRelation: "workspaces";
                        referencedColumns: ["id"];
                    }
                ];
            };
            workspaces: {
                Row: {
                    created_at: string;
                    description: string | null;
                    id: string;
                    name: string;
                    owner_id: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name: string;
                    owner_id: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name?: string;
                    owner_id?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "workspaces_owner_id_fkey";
                        columns: ["owner_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_user_owned_projects: {
                Args: {
                    user_id_param: string;
                };
                Returns: string[];
            };
            get_user_projects: {
                Args: {
                    user_id_param: string;
                };
                Returns: string[];
            };
            is_workspace_member_with_roles: {
                Args: {
                    p_workspace_id: string;
                    p_user_id: string;
                    p_required_roles: string[];
                };
                Returns: boolean;
            };
        };
        Enums: {
            project_collaborator_role: "owner" | "editor" | "viewer";
            project_collaborator_status: "pending" | "active" | "declined" | "revoked";
            project_task_priority: "low" | "medium" | "high" | "urgent";
            project_task_status: "todo" | "in_progress" | "completed" | "archived";
            workspace_document_type: "Text Document" | "Code Notebook" | "Research Proposal" | "Methodology" | "Data Analysis" | "Literature Review" | "Generic Document";
            workspace_role: "owner" | "admin" | "editor" | "commenter" | "viewer";
            workspace_task_status: "todo" | "in_progress" | "review" | "completed" | "archived";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
type DefaultSchema = Database[Extract<keyof Database, "public">];
export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
    schema: keyof Database;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof Database;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof Database;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
    schema: keyof Database;
}, EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
} ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
    schema: keyof Database;
}, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
} ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;
export declare const Constants: {
    readonly public: {
        readonly Enums: {
            readonly project_collaborator_role: readonly ["owner", "editor", "viewer"];
            readonly project_collaborator_status: readonly ["pending", "active", "declined", "revoked"];
            readonly project_task_priority: readonly ["low", "medium", "high", "urgent"];
            readonly project_task_status: readonly ["todo", "in_progress", "completed", "archived"];
            readonly workspace_document_type: readonly ["Text Document", "Code Notebook", "Research Proposal", "Methodology", "Data Analysis", "Literature Review", "Generic Document"];
            readonly workspace_role: readonly ["owner", "admin", "editor", "commenter", "viewer"];
            readonly workspace_task_status: readonly ["todo", "in_progress", "review", "completed", "archived"];
        };
    };
};
export {};
//# sourceMappingURL=database.types.d.ts.map