// File: src/supabase-types.ts
// Supabase 数据库类型定义

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
      todos: {
        Row: {
          id: string
          user_id: string | null
          title: string
          notes: string | null
          is_done: boolean
          due_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          notes?: string | null
          is_done?: boolean
          due_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          notes?: string | null
          is_done?: boolean
          due_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      countdowns: {
        Row: {
          id: string
          user_id: string | null
          title: string
          target_date: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          target_date: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string
          target_date?: string
          color?: string | null
          created_at?: string
        }
      }
    }
  }
}
