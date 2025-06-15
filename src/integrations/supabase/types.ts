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
      earnings: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      exclusive_posts: {
        Row: {
          caption: string | null
          created_at: string | null
          creator_id: string | null
          id: string
          is_public: boolean | null
          media_type: string | null
          media_url: string
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_public?: boolean | null
          media_type?: string | null
          media_url: string
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_public?: boolean | null
          media_type?: string | null
          media_url?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exclusive_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          age_range_max: number
          age_range_min: number
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          gender: string
          gender_preference: string
          id: string
          interests: string[] | null
          is_age_verified: boolean | null
          location_city: string
          location_state: string
          name: string
          search_radius_km: number
          services_offered: string | null
          subscription_fee: number | null
          updated_at: string | null
          user_id: string
          user_type: string
          verification_status: string | null
        }
        Insert: {
          age: number
          age_range_max?: number
          age_range_min?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          gender: string
          gender_preference: string
          id?: string
          interests?: string[] | null
          is_age_verified?: boolean | null
          location_city: string
          location_state: string
          name: string
          search_radius_km?: number
          services_offered?: string | null
          subscription_fee?: number | null
          updated_at?: string | null
          user_id: string
          user_type: string
          verification_status?: string | null
        }
        Update: {
          age?: number
          age_range_max?: number
          age_range_min?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          gender?: string
          gender_preference?: string
          id?: string
          interests?: string[] | null
          is_age_verified?: boolean | null
          location_city?: string
          location_state?: string
          name?: string
          search_radius_km?: number
          services_offered?: string | null
          subscription_fee?: number | null
          updated_at?: string | null
          user_id?: string
          user_type?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          creator_id: string
          duration_days: number
          id: string
          is_active: boolean | null
          name: string
          price_keys: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          duration_days: number
          id?: string
          is_active?: boolean | null
          name: string
          price_keys: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price_keys?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          creator_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          subscriber_id: string | null
          subscription_plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          subscriber_id?: string | null
          subscription_plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          subscriber_id?: string | null
          subscription_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          message: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          message?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wallets: {
        Row: {
          created_at: string | null
          id: string
          keys_balance: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          keys_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          keys_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_name: string
          account_number: string
          admin_notes: string | null
          amount: number
          bank_name: string
          created_at: string | null
          id: string
          notes: string | null
          processed_at: string | null
          requested_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          admin_notes?: string | null
          amount: number
          bank_name: string
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          admin_notes?: string | null
          amount?: number
          bank_name?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_or_update_recipient_wallet: {
        Args: { recipient_user_id: string; tip_amount: number }
        Returns: undefined
      }
      create_tip_notification: {
        Args: {
          recipient_user_id: string
          sender_name: string
          tip_amount: number
          tip_message?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
