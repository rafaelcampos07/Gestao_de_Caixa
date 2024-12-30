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
      produtos: {
        Row: {
          id: string
          nome: string
          preco: number
          descricao: string | null
          codigo: string | null
          estoque: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          nome: string
          preco: number
          descricao?: string | null
          codigo?: string | null
          estoque?: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          nome?: string
          preco?: number
          descricao?: string | null
          codigo?: string | null
          estoque?: number
          created_at?: string
          user_id?: string
        }
      }
      // Add other tables as needed
    }
  }
}