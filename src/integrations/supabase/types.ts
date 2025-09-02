export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      application_reviews: {
        Row: {
          audience_engagement_score: number | null
          content_quality_score: number | null
          created_at: string | null
          id: string
          platform_fit_score: number | null
          professional_presentation_score: number | null
          review_notes: string | null
          review_score: number | null
          review_status: Database["public"]["Enums"]["application_status"]
          reviewed_at: string | null
          reviewer_user_id: string | null
          waitlist_id: string | null
        }
        Insert: {
          audience_engagement_score?: number | null
          content_quality_score?: number | null
          created_at?: string | null
          id?: string
          platform_fit_score?: number | null
          professional_presentation_score?: number | null
          review_notes?: string | null
          review_score?: number | null
          review_status: Database["public"]["Enums"]["application_status"]
          reviewed_at?: string | null
          reviewer_user_id?: string | null
          waitlist_id?: string | null
        }
        Update: {
          audience_engagement_score?: number | null
          content_quality_score?: number | null
          created_at?: string | null
          id?: string
          platform_fit_score?: number | null
          professional_presentation_score?: number | null
          review_notes?: string | null
          review_score?: number | null
          review_status?: Database["public"]["Enums"]["application_status"]
          reviewed_at?: string | null
          reviewer_user_id?: string | null
          waitlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_reviews_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: false
            referencedRelation: "creator_waitlist"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          match_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          match_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          match_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_consent: {
        Row: {
          age_consent: boolean
          consent_completed_at: string | null
          created_at: string
          final_agreement: boolean
          id: string
          ip_address: string | null
          kyc_consent: boolean
          privacy_consent: boolean
          terms_version: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          age_consent?: boolean
          consent_completed_at?: string | null
          created_at?: string
          final_agreement?: boolean
          id?: string
          ip_address?: string | null
          kyc_consent?: boolean
          privacy_consent?: boolean
          terms_version?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          age_consent?: boolean
          consent_completed_at?: string | null
          created_at?: string
          final_agreement?: boolean
          id?: string
          ip_address?: string | null
          kyc_consent?: boolean
          privacy_consent?: boolean
          terms_version?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creator_waitlist: {
        Row: {
          admin_notes: string | null
          application_score: number | null
          application_status:
            | Database["public"]["Enums"]["application_status"]
            | null
          approved_at: string | null
          content_description: string | null
          content_strategy: string | null
          created_at: string | null
          creator_category: Database["public"]["Enums"]["creator_category"]
          current_followers: number | null
          email: string
          expected_monthly_revenue: number | null
          full_name: string
          id: string
          instagram_handle: string | null
          location_city: string | null
          location_state: string | null
          other_social: string | null
          phone_number: string | null
          portfolio_urls: string[] | null
          priority_level: number | null
          profile_photo_url: string | null
          reviewed_at: string | null
          submitted_at: string | null
          tiktok_handle: string | null
          twitter_handle: string | null
          updated_at: string | null
          why_join: string | null
        }
        Insert: {
          admin_notes?: string | null
          application_score?: number | null
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          approved_at?: string | null
          content_description?: string | null
          content_strategy?: string | null
          created_at?: string | null
          creator_category: Database["public"]["Enums"]["creator_category"]
          current_followers?: number | null
          email: string
          expected_monthly_revenue?: number | null
          full_name: string
          id?: string
          instagram_handle?: string | null
          location_city?: string | null
          location_state?: string | null
          other_social?: string | null
          phone_number?: string | null
          portfolio_urls?: string[] | null
          priority_level?: number | null
          profile_photo_url?: string | null
          reviewed_at?: string | null
          submitted_at?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          why_join?: string | null
        }
        Update: {
          admin_notes?: string | null
          application_score?: number | null
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          approved_at?: string | null
          content_description?: string | null
          content_strategy?: string | null
          created_at?: string | null
          creator_category?: Database["public"]["Enums"]["creator_category"]
          current_followers?: number | null
          email?: string
          expected_monthly_revenue?: number | null
          full_name?: string
          id?: string
          instagram_handle?: string | null
          location_city?: string | null
          location_state?: string | null
          other_social?: string | null
          phone_number?: string | null
          portfolio_urls?: string[] | null
          priority_level?: number | null
          profile_photo_url?: string | null
          reviewed_at?: string | null
          submitted_at?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string | null
          why_join?: string | null
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          boosts_used: number
          created_at: string
          date: string
          id: string
          message_credits_used: number
          rewinds_used: number
          super_likes_used: number
          swipes_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          boosts_used?: number
          created_at?: string
          date?: string
          id?: string
          message_credits_used?: number
          rewinds_used?: number
          super_likes_used?: number
          swipes_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          boosts_used?: number
          created_at?: string
          date?: string
          id?: string
          message_credits_used?: number
          rewinds_used?: number
          super_likes_used?: number
          swipes_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
          is_ppv: boolean | null
          is_public: boolean | null
          media_type: string | null
          media_url: string
          ppv_price: number | null
          ppv_unlock_duration: number | null
          updated_at: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_ppv?: boolean | null
          is_public?: boolean | null
          media_type?: string | null
          media_url: string
          ppv_price?: number | null
          ppv_unlock_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          is_ppv?: boolean | null
          is_public?: boolean | null
          media_type?: string | null
          media_url?: string
          ppv_price?: number | null
          ppv_unlock_duration?: number | null
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
      likes: {
        Row: {
          created_at: string
          id: string
          is_super_like: boolean
          recipient_id: string
          sender_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_super_like?: boolean
          recipient_id: string
          sender_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_super_like?: boolean
          recipient_id?: string
          sender_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      media_messages: {
        Row: {
          caption: string | null
          created_at: string
          credits_cost: number
          disappears_at: string | null
          id: string
          is_disappearing: boolean
          media_type: string
          media_url: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          credits_cost?: number
          disappears_at?: string | null
          id?: string
          is_disappearing?: boolean
          media_type: string
          media_url: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          credits_cost?: number
          disappears_at?: string | null
          id?: string
          is_disappearing?: boolean
          media_type?: string
          media_url?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      message_credits: {
        Row: {
          created_at: string
          credits_balance: number
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_balance?: number
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_balance?: number
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
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
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "exclusive_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "exclusive_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_purchases: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          post_id: string
          price_paid: number
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          post_id: string
          price_paid: number
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          post_id?: string
          price_paid?: number
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_purchases_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "exclusive_posts"
            referencedColumns: ["id"]
          },
        ]
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
          pin_last_updated_at: string | null
          referral_earnings: number | null
          referred_by: string | null
          search_radius_km: number
          services_offered: string | null
          subscription_fee: number | null
          successful_referrals: number | null
          total_referrals: number | null
          updated_at: string | null
          user_id: string
          user_type: string
          verification_status: string | null
          withdrawal_pin_hash: string | null
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
          pin_last_updated_at?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          search_radius_km?: number
          services_offered?: string | null
          subscription_fee?: number | null
          successful_referrals?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id: string
          user_type: string
          verification_status?: string | null
          withdrawal_pin_hash?: string | null
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
          pin_last_updated_at?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          search_radius_km?: number
          services_offered?: string | null
          subscription_fee?: number | null
          successful_referrals?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_id?: string
          user_type?: string
          verification_status?: string | null
          withdrawal_pin_hash?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          referee_id: string | null
          referee_reward_amount: number | null
          referral_code: string
          referrer_id: string
          reward_amount: number | null
          rewarded_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referee_id?: string | null
          referee_reward_amount?: number | null
          referral_code: string
          referrer_id: string
          reward_amount?: number | null
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referee_id?: string | null
          referee_reward_amount?: number | null
          referral_code?: string
          referrer_id?: string
          reward_amount?: number | null
          rewarded_at?: string | null
          status?: string
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
      super_likes: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
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
      user_activity: {
        Row: {
          created_at: string
          current_streak_days: number
          id: string
          last_active_date: string
          longest_streak_days: number
          total_discovery_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak_days?: number
          id?: string
          last_active_date?: string
          longest_streak_days?: number
          total_discovery_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak_days?: number
          id?: string
          last_active_date?: string
          longest_streak_days?: number
          total_discovery_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string
          id: string
          is_online: boolean
          last_seen: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_online?: boolean
          last_seen?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          keys_paid: number
          premium_features: Json | null
          starts_at: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          keys_paid?: number
          premium_features?: Json | null
          starts_at?: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          keys_paid?: number
          premium_features?: Json | null
          starts_at?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_submissions: {
        Row: {
          created_at: string | null
          government_id_url: string | null
          id: string
          sample_content_urls: string[] | null
          selfie_url: string | null
          social_verification_posts: string[] | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          video_introduction_url: string | null
          waitlist_id: string | null
        }
        Insert: {
          created_at?: string | null
          government_id_url?: string | null
          id?: string
          sample_content_urls?: string[] | null
          selfie_url?: string | null
          social_verification_posts?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          video_introduction_url?: string | null
          waitlist_id?: string | null
        }
        Update: {
          created_at?: string | null
          government_id_url?: string | null
          id?: string
          sample_content_urls?: string[] | null
          selfie_url?: string | null
          social_verification_posts?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          video_introduction_url?: string | null
          waitlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_submissions_waitlist_id_fkey"
            columns: ["waitlist_id"]
            isOneToOne: false
            referencedRelation: "creator_waitlist"
            referencedColumns: ["id"]
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
      assign_admin_role: {
        Args: { _email: string }
        Returns: boolean
      }
      check_daily_limit: {
        Args: { action_type: string; limit_amount: number; user_uuid: string }
        Returns: boolean
      }
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
      ensure_conversation_with_welcome_message: {
        Args: { match_id_param: string }
        Returns: string
      }
      ensure_referral_code: {
        Args: { user_name: string; user_uuid: string }
        Returns: string
      }
      generate_referral_code: {
        Args: { user_name: string }
        Returns: string
      }
      get_daily_stats: {
        Args: { user_uuid: string }
        Returns: {
          current_streak: number
          longest_streak: number
          today_matches: number
          today_super_likes: number
          today_swipes: number
          total_discovery_days: number
        }[]
      }
      get_incoming_likes: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          is_super_like: boolean
          like_id: string
          sender_age: number
          sender_avatar_url: string
          sender_bio: string
          sender_id: string
          sender_interests: string[]
          sender_location_city: string
          sender_location_state: string
          sender_name: string
          sender_user_type: string
          sender_verification_status: string
        }[]
      }
      get_premium_limits: {
        Args: { user_uuid: string }
        Returns: {
          can_see_likes: boolean
          daily_boosts: number
          daily_rewinds: number
          daily_super_likes: number
          daily_swipes: number
          has_premium_badge: boolean
        }[]
      }
      get_user_matches: {
        Args: { user_uuid: string }
        Returns: {
          conversation_id: string
          last_message_at: string
          last_message_content: string
          match_created_at: string
          match_id: string
          other_age: number
          other_avatar_url: string
          other_bio: string
          other_gender: string
          other_interests: string[]
          other_last_active: string
          other_location_city: string
          other_location_state: string
          other_name: string
          other_user_id: string
          other_user_type: string
          other_verification_status: string
          unread_count: number
        }[]
      }
      get_user_premium_features: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          assigned_at: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_status: {
        Args: { user_uuid: string }
        Returns: {
          is_online: boolean
          last_seen: string
          status_text: string
        }[]
      }
      get_user_tier: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_waitlist_status: {
        Args: { applicant_email: string }
        Returns: {
          admin_notes: string
          application_score: number
          application_status: Database["public"]["Enums"]["application_status"]
          reviewed_at: string
          submitted_at: string
        }[]
      }
      has_post_access: {
        Args: { post_uuid: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_daily_usage: {
        Args: {
          action_type: string
          increment_amount?: number
          user_uuid: string
        }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { conversation_id_param: string; user_id_param: string }
        Returns: undefined
      }
      purchase_ppv_content: {
        Args: { post_uuid: string }
        Returns: Json
      }
      respond_to_like: {
        Args: { like_id_param: string; response_status: string }
        Returns: boolean
      }
      set_withdrawal_pin: {
        Args: { pin: string }
        Returns: undefined
      }
      update_user_presence: {
        Args: { online_status?: boolean; user_uuid: string }
        Returns: undefined
      }
      update_user_streak: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      upgrade_to_creator: {
        Args: { user_uuid: string }
        Returns: Json
      }
      verify_withdrawal_pin: {
        Args: { pin: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      application_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "waitlisted"
      creator_category:
        | "lifestyle"
        | "fitness"
        | "beauty"
        | "fashion"
        | "food"
        | "travel"
        | "tech"
        | "gaming"
        | "music"
        | "art"
        | "education"
        | "business"
        | "comedy"
        | "other"
      verification_status: "pending" | "submitted" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      application_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "waitlisted",
      ],
      creator_category: [
        "lifestyle",
        "fitness",
        "beauty",
        "fashion",
        "food",
        "travel",
        "tech",
        "gaming",
        "music",
        "art",
        "education",
        "business",
        "comedy",
        "other",
      ],
      verification_status: ["pending", "submitted", "verified", "rejected"],
    },
  },
} as const
