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
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          company_id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: 'USER' | 'ADMIN'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'USER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'USER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          company: string | null
          title: string | null
          status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST' | 'INACTIVE'
          score: number
          notes: string | null
          source: string | null
          assigned_to_id: string | null
          created_by_id: string
          is_active: boolean
          last_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          title?: string | null
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST' | 'INACTIVE'
          score?: number
          notes?: string | null
          source?: string | null
          assigned_to_id?: string | null
          created_by_id: string
          is_active?: boolean
          last_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          title?: string | null
          status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST' | 'INACTIVE'
          score?: number
          notes?: string | null
          source?: string | null
          assigned_to_id?: string | null
          created_by_id?: string
          is_active?: boolean
          last_contact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          company_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      lead_tags: {
        Row: {
          lead_id: string
          tag_id: string
        }
        Insert: {
          lead_id: string
          tag_id: string
        }
        Update: {
          lead_id?: string
          tag_id?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          company_id: string
          lead_id: string | null
          sent_by_id: string
          subject: string
          content: string
          recipient_email: string
          sender_email: string
          status: 'SENT' | 'DELIVERED' | 'OPENED' | 'FAILED' | 'BOUNCED'
          tracking_id: string
          opened_at: string | null
          open_count: number
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          lead_id?: string | null
          sent_by_id: string
          subject: string
          content: string
          recipient_email: string
          sender_email: string
          status?: 'SENT' | 'DELIVERED' | 'OPENED' | 'FAILED' | 'BOUNCED'
          tracking_id: string
          opened_at?: string | null
          open_count?: number
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          lead_id?: string | null
          sent_by_id?: string
          subject?: string
          content?: string
          recipient_email?: string
          sender_email?: string
          status?: 'SENT' | 'DELIVERED' | 'OPENED' | 'FAILED' | 'BOUNCED'
          tracking_id?: string
          opened_at?: string | null
          open_count?: number
          sent_at?: string
          created_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          lead_id: string
          user_id: string
          title: string
          description: string | null
          due_date: string
          status: 'PENDING' | 'COMPLETED' | 'OVERDUE'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id: string
          title: string
          description?: string | null
          due_date: string
          status?: 'PENDING' | 'COMPLETED' | 'OVERDUE'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string
          status?: 'PENDING' | 'COMPLETED' | 'OVERDUE'
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          company_id: string
          lead_id: string
          uploaded_by_id: string
          filename: string
          original_filename: string
          mime_type: string
          file_size: number
          r2_key: string
          public_url: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          lead_id: string
          uploaded_by_id: string
          filename: string
          original_filename: string
          mime_type: string
          file_size: number
          r2_key: string
          public_url?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          lead_id?: string
          uploaded_by_id?: string
          filename?: string
          original_filename?: string
          mime_type?: string
          file_size?: number
          r2_key?: string
          public_url?: string | null
          is_public?: boolean
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
