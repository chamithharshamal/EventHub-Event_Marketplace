// Database Types - Auto-generated from Supabase schema
// Run: npx supabase gen types typescript --local > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          logo_url: string | null
          stripe_account_id: string | null
          subscription_plan: 'free' | 'pro' | 'enterprise'
          settings: Json
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          logo_url?: string | null
          stripe_account_id?: string | null
          subscription_plan?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          logo_url?: string | null
          stripe_account_id?: string | null
          subscription_plan?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string | null
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'admin' | 'organizer' | 'staff' | 'attendee'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id?: string | null
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'organizer' | 'staff' | 'attendee'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'admin' | 'organizer' | 'staff' | 'attendee'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          tenant_id: string
          organizer_id: string
          title: string
          slug: string
          description: string | null
          category: string | null
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          venue_name: string | null
          address: string | null
          city: string | null
          country: string | null
          is_online: boolean
          stream_url: string | null
          start_date: string
          end_date: string
          timezone: string
          banner_url: string | null
          gallery: Json
          max_capacity: number | null
          is_private: boolean
          refund_policy: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          organizer_id: string
          title: string
          slug: string
          description?: string | null
          category?: string | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          venue_name?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          is_online?: boolean
          stream_url?: string | null
          start_date: string
          end_date: string
          timezone?: string
          banner_url?: string | null
          gallery?: Json
          max_capacity?: number | null
          is_private?: boolean
          refund_policy?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          organizer_id?: string
          title?: string
          slug?: string
          description?: string | null
          category?: string | null
          status?: 'draft' | 'published' | 'cancelled' | 'completed'
          venue_name?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          is_online?: boolean
          stream_url?: string | null
          start_date?: string
          end_date?: string
          timezone?: string
          banner_url?: string | null
          gallery?: Json
          max_capacity?: number | null
          is_private?: boolean
          refund_policy?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          description: string | null
          price: number
          currency: string
          quantity_total: number
          quantity_sold: number
          max_per_order: number
          sales_start: string | null
          sales_end: string | null
          is_transferable: boolean
          perks: Json
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          description?: string | null
          price?: number
          currency?: string
          quantity_total: number
          quantity_sold?: number
          max_per_order?: number
          sales_start?: string | null
          sales_end?: string | null
          is_transferable?: boolean
          perks?: Json
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          quantity_total?: number
          quantity_sold?: number
          max_per_order?: number
          sales_start?: string | null
          sales_end?: string | null
          is_transferable?: boolean
          perks?: Json
          sort_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          event_id: string
          subtotal: number
          service_fee: number
          total: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          event_id: string
          subtotal: number
          service_fee?: number
          total: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          event_id?: string
          subtotal?: number
          service_fee?: number
          total?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      tickets: {
        Row: {
          id: string
          tenant_id: string
          event_id: string
          ticket_type_id: string
          order_id: string
          user_id: string
          status: 'valid' | 'used' | 'cancelled' | 'transferred'
          qr_code_data: string
          qr_signature: string
          attendee_name: string | null
          attendee_email: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          original_owner_id: string | null
          transferred_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          event_id: string
          ticket_type_id: string
          order_id: string
          user_id: string
          status?: 'valid' | 'used' | 'cancelled' | 'transferred'
          qr_code_data: string
          qr_signature: string
          attendee_name?: string | null
          attendee_email?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          original_owner_id?: string | null
          transferred_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          event_id?: string
          ticket_type_id?: string
          order_id?: string
          user_id?: string
          status?: 'valid' | 'used' | 'cancelled' | 'transferred'
          qr_code_data?: string
          qr_signature?: string
          attendee_name?: string | null
          attendee_email?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          original_owner_id?: string | null
          transferred_at?: string | null
          created_at?: string
        }
      }
      check_ins: {
        Row: {
          id: string
          ticket_id: string
          event_id: string
          staff_id: string | null
          status: string
          scanned_at: string
          device_info: Json | null
        }
        Insert: {
          id?: string
          ticket_id: string
          event_id: string
          staff_id?: string | null
          status: string
          scanned_at?: string
          device_info?: Json | null
        }
        Update: {
          id?: string
          ticket_id?: string
          event_id?: string
          staff_id?: string | null
          status?: string
          scanned_at?: string
          device_info?: Json | null
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

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Tenant = Tables<'tenants'>
export type Profile = Tables<'profiles'>
export type Event = Tables<'events'>
export type TicketType = Tables<'ticket_types'>
export type Order = Tables<'orders'>
export type Ticket = Tables<'tickets'>
export type CheckIn = Tables<'check_ins'>
