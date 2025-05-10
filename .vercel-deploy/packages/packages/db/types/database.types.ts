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
          first_name: string
          last_name: string
          avatar_url: string | null
          bio: string | null
          title: string | null
          institution: string | null
          location: string | null
          email: string | null
          website: string | null
          availability: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null
          field_of_study: string | null
          interests: string[] | null
          education: Json | null
          joining_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          bio?: string | null
          title?: string | null
          institution?: string | null
          location?: string | null
          email?: string | null
          website?: string | null
          availability?: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null
          field_of_study?: string | null
          interests?: string[] | null
          education?: Json | null
          joining_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          bio?: string | null
          title?: string | null
          institution?: string | null
          location?: string | null
          email?: string | null
          website?: string | null
          availability?: 'full-time' | 'part-time' | 'weekends' | 'not-available' | null
          field_of_study?: string | null
          interests?: string[] | null
          education?: Json | null
          joining_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      research_posts: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          tags: string[] | null
          visibility: 'public' | 'private' | 'connections'
          is_boosted: boolean
          engagement_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          tags?: string[] | null
          visibility?: 'public' | 'private' | 'connections'
          is_boosted?: boolean
          engagement_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          tags?: string[] | null
          visibility?: 'public' | 'private' | 'connections'
          is_boosted?: boolean
          engagement_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user_id_1: string
          user_id_2: string
          status: 'pending' | 'matched' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id_1: string
          user_id_2: string
          status?: 'pending' | 'matched' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id_1?: string
          user_id_2?: string
          status?: 'pending' | 'matched' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'match' | 'system' | 'mention'
          title: string
          body: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'match' | 'system' | 'mention'
          title: string
          body: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'message' | 'match' | 'system' | 'mention'
          title?: string
          body?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
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