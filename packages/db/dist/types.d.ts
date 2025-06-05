export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    created_at: string | null;
                    updated_at: string | null;
                    first_name: string;
                    last_name: string;
                    avatar_url: string | null;
                    bio: string | null;
                    location: string | null;
                    availability: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null;
                    interests: string[] | null;
                    project_history: string[] | null;
                    is_mentor: boolean;
                    field_of_study: string | null;
                    email: string;
                    institution: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                    first_name: string;
                    last_name: string;
                    avatar_url?: string | null;
                    bio?: string | null;
                    location?: string | null;
                    availability?: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null;
                    interests?: string[] | null;
                    project_history?: string[] | null;
                    is_mentor?: boolean;
                    field_of_study?: string | null;
                    email: string;
                    institution?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                    first_name?: string;
                    last_name?: string;
                    avatar_url?: string | null;
                    bio?: string | null;
                    location?: string | null;
                    availability?: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null;
                    interests?: string[] | null;
                    project_history?: string[] | null;
                    is_mentor?: boolean;
                    field_of_study?: string | null;
                    email?: string;
                    institution?: string | null;
                };
            };
            research_posts: {
                Row: {
                    id: string;
                    created_at: string | null;
                    updated_at: string | null;
                    title: string;
                    content: string;
                    user_id: string;
                    tags: string[] | null;
                    visibility: 'public' | 'private' | 'connections';
                    is_boosted: boolean;
                    boost_end_date: string | null;
                    engagement_count: number;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                    title: string;
                    content: string;
                    user_id: string;
                    tags?: string[] | null;
                    visibility?: 'public' | 'private' | 'connections';
                    is_boosted?: boolean;
                    boost_end_date?: string | null;
                    engagement_count?: number;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                    title?: string;
                    content?: string;
                    user_id?: string;
                    tags?: string[] | null;
                    visibility?: 'public' | 'private' | 'connections';
                    is_boosted?: boolean;
                    boost_end_date?: string | null;
                    engagement_count?: number;
                };
            };
            collaborator_matches: {
                Row: {
                    id: string;
                    created_at: string | null;
                    user_id: string;
                    matched_user_id: string;
                    status: 'pending' | 'matched' | 'rejected';
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    user_id: string;
                    matched_user_id: string;
                    status?: 'pending' | 'matched' | 'rejected';
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    user_id?: string;
                    matched_user_id?: string;
                    status?: 'pending' | 'matched' | 'rejected';
                };
            };
            guilds: {
                Row: {
                    id: string;
                    created_at: string | null;
                    name: string;
                    description: string | null;
                    creator_id: string;
                    logo_url: string | null;
                    activity_score: number;
                    member_count: number;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    name: string;
                    description?: string | null;
                    creator_id: string;
                    logo_url?: string | null;
                    activity_score?: number;
                    member_count?: number;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    name?: string;
                    description?: string | null;
                    creator_id?: string;
                    logo_url?: string | null;
                    activity_score?: number;
                    member_count?: number;
                };
            };
            projects: {
                Row: {
                    id: string;
                    created_at: string | null;
                    updated_at: string | null;
                    title: string;
                    description: string;
                    leader_id: string;
                    guild_id: string | null;
                    status: 'planning' | 'active' | 'completed' | 'archived';
                    tags: string[] | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                    title: string;
                    description: string;
                    leader_id: string;
                    guild_id?: string | null;
                    status?: 'planning' | 'active' | 'completed' | 'archived';
                    tags?: string[] | null;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                    title?: string;
                    description?: string;
                    leader_id?: string;
                    guild_id?: string | null;
                    status?: 'planning' | 'active' | 'completed' | 'archived';
                    tags?: string[] | null;
                };
            };
            mentor_applications: {
                Row: {
                    id: string;
                    created_at: string | null;
                    user_id: string;
                    project_idea: string;
                    field: string;
                    status: 'pending' | 'matched' | 'rejected';
                    matched_mentor_id: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    user_id: string;
                    project_idea: string;
                    field: string;
                    status?: 'pending' | 'matched' | 'rejected';
                    matched_mentor_id?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    user_id?: string;
                    project_idea?: string;
                    field?: string;
                    status?: 'pending' | 'matched' | 'rejected';
                    matched_mentor_id?: string | null;
                };
            };
            proofs: {
                Row: {
                    id: string;
                    created_at: string | null;
                    user_id: string;
                    project_id: string;
                    content_hash: string;
                    timestamp: string;
                    blockchain_tx: string | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    user_id: string;
                    project_id: string;
                    content_hash: string;
                    timestamp: string;
                    blockchain_tx?: string | null;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    user_id?: string;
                    project_id?: string;
                    content_hash?: string;
                    timestamp?: string;
                    blockchain_tx?: string | null;
                };
            };
            messages: {
                Row: {
                    id: string;
                    created_at: string | null;
                    sender_id: string;
                    receiver_id: string;
                    match_id: string;
                    content: string;
                    is_read: boolean;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    sender_id: string;
                    receiver_id: string;
                    match_id: string;
                    content: string;
                    is_read?: boolean;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    sender_id?: string;
                    receiver_id?: string;
                    match_id?: string;
                    content?: string;
                    is_read?: boolean;
                };
            };
            ai_reviews: {
                Row: {
                    id: string;
                    created_at: string | null;
                    user_id: string;
                    original_text: string;
                    review_content: string;
                    suggested_edits: string | null;
                    suggested_citations: string[] | null;
                    quality_score: number | null;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    user_id: string;
                    original_text: string;
                    review_content: string;
                    suggested_edits?: string | null;
                    suggested_citations?: string[] | null;
                    quality_score?: number | null;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    user_id?: string;
                    original_text?: string;
                    review_content?: string;
                    suggested_edits?: string | null;
                    suggested_citations?: string[] | null;
                    quality_score?: number | null;
                };
            };
            subscriptions: {
                Row: {
                    id: string;
                    created_at: string | null;
                    user_id: string;
                    stripe_customer_id: string;
                    stripe_subscription_id: string;
                    status: 'active' | 'canceled' | 'past_due' | 'trialing';
                    plan_type: 'free' | 'premium';
                    current_period_end: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string | null;
                    user_id: string;
                    stripe_customer_id: string;
                    stripe_subscription_id: string;
                    status?: 'active' | 'canceled' | 'past_due' | 'trialing';
                    plan_type?: 'free' | 'premium';
                    current_period_end: string;
                };
                Update: {
                    id?: string;
                    created_at?: string | null;
                    user_id?: string;
                    stripe_customer_id?: string;
                    stripe_subscription_id?: string;
                    status?: 'active' | 'canceled' | 'past_due' | 'trialing';
                    plan_type?: 'free' | 'premium';
                    current_period_end?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
//# sourceMappingURL=types.d.ts.map