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
      tontine_members: {
        Row: {
          id: number
          created_at: string
          tontine_group_id: string
          user_id: string
          status: string
          role: string
          payout_position: number | null
          payout_received: boolean
          reliability_score: number
          invited_by: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          tontine_group_id: string
          user_id: string
          status?: string
          role?: string
          payout_position?: number | null
          payout_received?: boolean
          reliability_score?: number
          invited_by?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          tontine_group_id?: string
          user_id?: string
          status?: string
          role?: string
          payout_position?: number | null
          payout_received?: boolean
          reliability_score?: number
          invited_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tontine_members_tontine_group_id_fkey"
            columns: ["tontine_group_id"]
            referencedRelation: "tontine_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontine_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tontine_members_invited_by_fkey"
            columns: ["invited_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      contributions: {
        Row: {
          id: string
          group_id: string
          user_id: string
          amount: number
          status: 'pending' | 'paid' | 'missed' | 'late'
          payment_date: string
          created_at: string
          updated_at: string | null
          payment_method: string | null
          transaction_id: string | null
          round_number: number | null
          late_fee_amount: number | null
          notes: string | null
          receipt_url: string | null
          verified_by: string | null
          verification_date: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          amount: number
          status: 'pending' | 'paid' | 'missed' | 'late'
          payment_date: string
          created_at?: string
          updated_at?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          round_number?: number | null
          late_fee_amount?: number | null
          notes?: string | null
          receipt_url?: string | null
          verified_by?: string | null
          verification_date?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          amount?: number
          status?: 'pending' | 'paid' | 'missed' | 'late'
          payment_date?: string
          created_at?: string
          updated_at?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          round_number?: number | null
          late_fee_amount?: number | null
          notes?: string | null
          receipt_url?: string | null
          verified_by?: string | null
          verification_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "tontine_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          status: 'active' | 'pending' | 'inactive' | 'removed'
          joined_at: string
          payout_position: number | null
          payout_received: boolean | null
          total_contributions: number | null
          last_contribution_date: string | null
          invitation_email: string | null
          invitation_status: 'sent' | 'accepted' | 'declined' | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          status: 'active' | 'pending' | 'inactive' | 'removed'
          joined_at?: string
          payout_position?: number | null
          payout_received?: boolean | null
          total_contributions?: number | null
          last_contribution_date?: string | null
          invitation_email?: string | null
          invitation_status?: 'sent' | 'accepted' | 'declined' | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          status?: 'active' | 'pending' | 'inactive' | 'removed'
          joined_at?: string
          payout_position?: number | null
          payout_received?: boolean | null
          total_contributions?: number | null
          last_contribution_date?: string | null
          invitation_email?: string | null
          invitation_status?: 'sent' | 'accepted' | 'declined' | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "tontine_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'payment_due' | 'payment_received' | 'payout_scheduled' | 'payout_sent' | 'group_invitation' | 'system'
          read: boolean
          created_at: string
          related_entity: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'payment_due' | 'payment_received' | 'payout_scheduled' | 'payout_sent' | 'group_invitation' | 'system'
          read?: boolean
          created_at?: string
          related_entity?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'payment_due' | 'payment_received' | 'payout_scheduled' | 'payout_sent' | 'group_invitation' | 'system'
          read?: boolean
          created_at?: string
          related_entity?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: 'bank_account' | 'mobile_money' | 'card' | 'other'
          details: Json
          is_default: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'bank_account' | 'mobile_money' | 'card' | 'other'
          details: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'bank_account' | 'mobile_money' | 'card' | 'other'
          details?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      payouts: {
        Row: {
          id: string
          group_id: string
          user_id: string
          amount: number
          payout_date: string
          status: 'scheduled' | 'paid' | 'pending' | 'cancelled'
          created_at: string
          updated_at: string | null
          payment_method: string | null
          transaction_id: string | null
          round_number: number
          bid_amount: number | null
          notes: string | null
          receipt_url: string | null
          processed_by: string | null
          processing_date: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          amount: number
          payout_date: string
          status: 'scheduled' | 'paid' | 'pending' | 'cancelled'
          created_at?: string
          updated_at?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          round_number: number
          bid_amount?: number | null
          notes?: string | null
          receipt_url?: string | null
          processed_by?: string | null
          processing_date?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          amount?: number
          payout_date?: string
          status?: 'scheduled' | 'paid' | 'pending' | 'cancelled'
          created_at?: string
          updated_at?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          round_number?: number
          bid_amount?: number | null
          notes?: string | null
          receipt_url?: string | null
          processed_by?: string | null
          processing_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_group_id_fkey"
            columns: ["group_id"]
            referencedRelation: "tontine_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          phone_number: string | null
          preferred_language: string | null
          notification_preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          phone_number?: string | null
          preferred_language?: string | null
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          phone_number?: string | null
          preferred_language?: string | null
          notification_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tontine_groups: {
        Row: {
          id: string
          name: string
          description: string | null
          contribution_amount: number
          currency: string
          frequency: 'weekly' | 'biweekly' | 'monthly'
          start_date: string
          end_date: string | null
          payout_method: 'rotation' | 'random' | 'bidding'
          created_by: string
          created_at: string
          updated_at: string | null
          status: 'active' | 'completed' | 'cancelled' | 'pending'
          max_members: number | null
          current_round: number | null
          total_rounds: number | null
          rules: Json | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          contribution_amount: number
          currency: string
          frequency: 'weekly' | 'biweekly' | 'monthly'
          start_date: string
          end_date?: string | null
          payout_method: 'rotation' | 'random' | 'bidding'
          created_by: string
          created_at?: string
          updated_at?: string | null
          status?: 'active' | 'completed' | 'cancelled' | 'pending'
          max_members?: number | null
          current_round?: number | null
          total_rounds?: number | null
          rules?: Json | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          contribution_amount?: number
          currency?: string
          frequency?: 'weekly' | 'biweekly' | 'monthly'
          start_date?: string
          end_date?: string | null
          payout_method?: 'rotation' | 'random' | 'bidding'
          created_by?: string
          created_at?: string
          updated_at?: string | null
          status?: 'active' | 'completed' | 'cancelled' | 'pending'
          max_members?: number | null
          current_round?: number | null
          total_rounds?: number | null
          rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tontine_groups_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          type: 'contribution' | 'payout' | 'fee' | 'refund'
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method: string | null
          description: string | null
          created_at: string
          updated_at: string | null
          related_entity: Json | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency: string
          type: 'contribution' | 'payout' | 'fee' | 'refund'
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
          related_entity?: Json | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          type?: 'contribution' | 'payout' | 'fee' | 'refund'
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string | null
          related_entity?: Json | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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