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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          country: string | null
          preferred_language: string
          wallet_address: string | null
          public_key: string | null
          private_key: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          country?: string | null
          preferred_language?: string
          wallet_address?: string | null
          public_key?: string | null
          private_key?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          country?: string | null
          preferred_language?: string
          wallet_address?: string | null
          public_key?: string | null
          private_key?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recipients: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string | null
          email: string | null
          country: string
          delivery_method: string
          bank_account: string | null
          wallet_address: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone?: string | null
          email?: string | null
          country: string
          delivery_method: string
          bank_account?: string | null
          wallet_address?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          country?: string
          delivery_method?: string
          bank_account?: string | null
          wallet_address?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transfers: {
        Row: {
          id: string
          user_id: string
          recipient_id: string
          amount_usd: number
          amount_local: number
          exchange_rate: number
          fee_usd: number
          total_usd: number
          from_currency: string
          to_currency: string
          delivery_method: string
          status: string
          stellar_transaction_id: string | null
          stellar_memo: string | null
          tracking_number: string
          estimated_delivery: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient_id: string
          amount_usd: number
          amount_local: number
          exchange_rate: number
          fee_usd: number
          total_usd: number
          from_currency?: string
          to_currency: string
          delivery_method: string
          status?: string
          stellar_transaction_id?: string | null
          stellar_memo?: string | null
          tracking_number?: string
          estimated_delivery?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipient_id?: string
          amount_usd?: number
          amount_local?: number
          exchange_rate?: number
          fee_usd?: number
          total_usd?: number
          from_currency?: string
          to_currency?: string
          delivery_method?: string
          status?: string
          stellar_transaction_id?: string | null
          stellar_memo?: string | null
          tracking_number?: string
          estimated_delivery?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exchange_rates: {
        Row: {
          id: string
          from_currency: string
          to_currency: string
          rate: number
          change_24h: number
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          from_currency: string
          to_currency: string
          rate: number
          change_24h?: number
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          from_currency?: string
          to_currency?: string
          rate?: number
          change_24h?: number
          last_updated?: string
          created_at?: string
        }
      }
      countries: {
        Row: {
          id: string
          code: string
          name: string
          currency: string
          flag_emoji: string
          is_supported: boolean
          delivery_methods: Json
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          currency: string
          flag_emoji: string
          is_supported?: boolean
          delivery_methods?: Json
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          currency?: string
          flag_emoji?: string
          is_supported?: boolean
          delivery_methods?: Json
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          transfer_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          transfer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          transfer_id?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}