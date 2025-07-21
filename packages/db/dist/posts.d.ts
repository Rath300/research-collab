import type { Database } from './types/database.types';
type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type ResearchPostInsert = Database['public']['Tables']['research_posts']['Insert'];
type ResearchPostUpdate = Database['public']['Tables']['research_posts']['Update'];
export declare function getResearchPosts(limit?: number, offset?: number, userId?: string): Promise<import("@supabase/supabase-js").PostgrestSingleResponse<any[]>>;
export declare function getResearchPost(id: string): Promise<import("@supabase/supabase-js").PostgrestSingleResponse<any>>;
export declare function createResearchPost(post: ResearchPostInsert): Promise<import("@supabase/supabase-js").PostgrestSingleResponse<any>>;
export declare function updateResearchPost(id: string, post: ResearchPostUpdate): Promise<import("@supabase/supabase-js").PostgrestSingleResponse<any>>;
export declare function deleteResearchPost(id: string): Promise<import("@supabase/supabase-js").PostgrestSingleResponse<null>>;
export declare function incrementEngagement(id: string): Promise<{
    data: ResearchPost | null;
    error: Error | null;
}>;
export {};
//# sourceMappingURL=posts.d.ts.map