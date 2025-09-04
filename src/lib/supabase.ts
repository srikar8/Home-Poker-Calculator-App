import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          user_id: string
          date: string
          buy_in_amount: number
          host_fee: number
          default_rebuy_amount: number
          host_id: string
          co_host_id: string | null
          total_pot: number
          is_active: boolean
          game_started: boolean
          game_code: string | null
          code_expires_at: string | null
          max_players: number | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          date: string
          buy_in_amount: number
          host_fee: number
          default_rebuy_amount: number
          host_id: string
          co_host_id?: string | null
          total_pot: number
          is_active: boolean
          game_started?: boolean
          game_code?: string | null
          code_expires_at?: string | null
          max_players?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          buy_in_amount?: number
          host_fee?: number
          default_rebuy_amount?: number
          host_id?: string
          co_host_id?: string | null
          total_pot?: number
          is_active?: boolean
          game_started?: boolean
          game_code?: string | null
          code_expires_at?: string | null
          max_players?: number | null
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          game_id: string
          name: string
          avatar: string | null
          buy_in: number
          rebuys: number
          cash_out: number
        }
        Insert: {
          id: string
          game_id: string
          name: string
          avatar?: string | null
          buy_in: number
          rebuys: number
          cash_out: number
        }
        Update: {
          id?: string
          game_id?: string
          name?: string
          avatar?: string | null
          buy_in?: number
          rebuys?: number
          cash_out?: number
        }
      }
      rebuy_history: {
        Row: {
          id: string
          game_id: string
          player_id: string
          player_name: string
          amount: number
          timestamp: string
        }
        Insert: {
          id: string
          game_id: string
          player_id: string
          player_name: string
          amount: number
          timestamp: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          player_name?: string
          amount?: number
          timestamp?: string
        }
      }
      settlement_transactions: {
        Row: {
          id: string
          game_id: string
          from_player_id: string
          from_player_name: string
          to_player_id: string
          to_player_name: string
          amount: number
        }
        Insert: {
          id?: string
          game_id: string
          from_player_id: string
          from_player_name: string
          to_player_id: string
          to_player_name: string
          amount: number
        }
        Update: {
          id?: string
          game_id?: string
          from_player_id?: string
          from_player_name?: string
          to_player_id?: string
          to_player_name?: string
          amount?: number
        }
      }
    }
  }
}
