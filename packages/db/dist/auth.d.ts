import type { Database } from './types/database.types';
type Profile = Database['public']['Tables']['profiles']['Row'];
export declare function getCurrentUser(): Promise<{
    profile: any;
    id: string;
    app_metadata: import("@supabase/supabase-js").UserAppMetadata;
    user_metadata: import("@supabase/supabase-js").UserMetadata;
    aud: string;
    confirmation_sent_at?: string;
    recovery_sent_at?: string;
    email_change_sent_at?: string;
    new_email?: string;
    new_phone?: string;
    invited_at?: string;
    action_link?: string;
    email?: string;
    phone?: string;
    created_at: string;
    confirmed_at?: string;
    email_confirmed_at?: string;
    phone_confirmed_at?: string;
    last_sign_in_at?: string;
    role?: string;
    updated_at?: string;
    identities?: import("@supabase/supabase-js").UserIdentity[];
    is_anonymous?: boolean;
    is_sso_user?: boolean;
    factors?: import("@supabase/supabase-js").Factor[];
    deleted_at?: string;
} | null>;
export declare function signIn(email: string, password: string): Promise<import("@supabase/supabase-js").AuthTokenResponsePassword>;
export declare function signUp(email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    [key: string]: any;
}): Promise<{
    data: null;
    error: import("@supabase/supabase-js").AuthError | null;
} | {
    data: null;
    error: import("@supabase/supabase-js").PostgrestError;
} | {
    data: {
        user: import("@supabase/supabase-js").AuthUser;
        profile: any;
    };
    error: null;
}>;
export declare function signOut(): Promise<{
    error: import("@supabase/supabase-js").AuthError | null;
}>;
export declare function updateProfile(profile: Partial<Profile>): Promise<{
    data: Profile | null;
    error: Error | null;
}>;
export {};
//# sourceMappingURL=auth.d.ts.map