export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          availability: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null
          interests: string[] | null
          project_history: string[] | null
          is_mentor: boolean
          field_of_study: string | null
          email: string
          institution: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          availability?: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null
          interests?: string[] | null
          project_history?: string[] | null
          is_mentor?: boolean
          field_of_study?: string | null
          email: string
          institution?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          availability?: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null
          interests?: string[] | null
          project_history?: string[] | null
          is_mentor?: boolean
          field_of_study?: string | null
          email?: string
          institution?: string | null
        }
      }
      research_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          user_id: string
          tags: string[] | null
          visibility: 'public' | 'private' | 'connections'
          is_boosted: boolean
          boost_end_date: string | null
          engagement_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          user_id: string
          tags?: string[] | null
          visibility?: 'public' | 'private' | 'connections'
          is_boosted?: boolean
          boost_end_date?: string | null
          engagement_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          user_id?: string
          tags?: string[] | null
          visibility?: 'public' | 'private' | 'connections'
          is_boosted?: boolean
          boost_end_date?: string | null
          engagement_count?: number
        }
      }
      collaborator_matches: {
        Row: {
          id: string
          created_at: string
          user_id: string
          matched_user_id: string
          status: 'pending' | 'matched' | 'rejected'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          matched_user_id: string
          status?: 'pending' | 'matched' | 'rejected'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          matched_user_id?: string
          status?: 'pending' | 'matched' | 'rejected'
        }
      }
      guilds: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          creator_id: string
          logo_url: string | null
          activity_score: number
          member_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          creator_id: string
          logo_url?: string | null
          activity_score?: number
          member_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          creator_id?: string
          logo_url?: string | null
          activity_score?: number
          member_count?: number
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          content: string
          match_id: string | null
          is_read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          receiver_id: string
          content: string
          match_id?: string | null
          is_read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          match_id?: string | null
          is_read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 