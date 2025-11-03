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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          id: string
          user_id: string
          user_message: string
          bot_response: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_message: string
          bot_response: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_message?: string
          bot_response?: string
          created_at?: string
        }
      }
      market_listings: {
        Row: {
          category: Database["public"]["Enums"]["listing_category"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string
          price: number
          quantity_available: number | null
          seller_email: string | null
          seller_id: string
          seller_name: string | null
          seller_phone: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          price: number
          quantity_available?: number | null
          seller_email?: string | null
          seller_id: string
          seller_name?: string | null
          seller_phone?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          unit: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          price?: number
          quantity_available?: number | null
          seller_email?: string | null
          seller_id?: string
          seller_name?: string | null
          seller_phone?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_trends: {
        Row: {
          confidence_score: number | null
          created_at: string
          demand_level:
            | Database["public"]["Enums"]["demand_supply_level"]
            | null
          id: string
          location: string
          market_analysis: string | null
          price_trend: Database["public"]["Enums"]["price_trend"] | null
          produce_type: string
          quality_grade: Database["public"]["Enums"]["quality_grade"] | null
          quantity: number | null
          recommendations: string[] | null
          suggested_price_max: number | null
          suggested_price_min: number | null
          suggested_price_optimal: number | null
          supply_level:
            | Database["public"]["Enums"]["demand_supply_level"]
            | null
          user_id: string
          weather_impact: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          demand_level?:
            | Database["public"]["Enums"]["demand_supply_level"]
            | null
          id?: string
          location: string
          market_analysis?: string | null
          price_trend?: Database["public"]["Enums"]["price_trend"] | null
          produce_type: string
          quality_grade?: Database["public"]["Enums"]["quality_grade"] | null
          quantity?: number | null
          recommendations?: string[] | null
          suggested_price_max?: number | null
          suggested_price_min?: number | null
          suggested_price_optimal?: number | null
          supply_level?:
            | Database["public"]["Enums"]["demand_supply_level"]
            | null
          user_id: string
          weather_impact?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          demand_level?:
            | Database["public"]["Enums"]["demand_supply_level"]
            | null
          id?: string
          location?: string
          market_analysis?: string | null
          price_trend?: Database["public"]["Enums"]["price_trend"] | null
          produce_type?: string
          quality_grade?: Database["public"]["Enums"]["quality_grade"] | null
          quantity?: number | null
          recommendations?: string[] | null
          suggested_price_max?: number | null
          suggested_price_min?: number | null
          suggested_price_optimal?: number | null
          supply_level?:
            | Database["public"]["Enums"]["demand_supply_level"]
            | null
          user_id?: string
          weather_impact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_trends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          farm_name: string | null
          farm_size: string | null
          farm_type: Database["public"]["Enums"]["farm_type"] | null
          full_name: string | null
          id: string
          location: string | null
          phone_number: string | null
          primary_crops: string[] | null
          purchase_interests: string[] | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          farm_name?: string | null
          farm_size?: string | null
          farm_type?: Database["public"]["Enums"]["farm_type"] | null
          full_name?: string | null
          id: string
          location?: string | null
          phone_number?: string | null
          primary_crops?: string[] | null
          purchase_interests?: string[] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          business_name?: string | null
          created_at?: string
          farm_name?: string | null
          farm_size?: string | null
          farm_type?: Database["public"]["Enums"]["farm_type"] | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone_number?: string | null
          primary_crops?: string[] | null
          purchase_interests?: string[] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      quality_reports: {
        Row: {
          created_at: string
          defects_detected: string[] | null
          estimated_price_range: string | null
          id: string
          image_url: string | null
          market_readiness:
            | Database["public"]["Enums"]["market_readiness"]
            | null
          notes: string | null
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          quality_grade: Database["public"]["Enums"]["quality_grade"] | null
          quality_score: number | null
          recommendations: string | null
          shelf_life: string | null
          user_id: string
          visual_assessment: string[] | null
        }
        Insert: {
          created_at?: string
          defects_detected?: string[] | null
          estimated_price_range?: string | null
          id?: string
          image_url?: string | null
          market_readiness?:
            | Database["public"]["Enums"]["market_readiness"]
            | null
          notes?: string | null
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          quality_grade?: Database["public"]["Enums"]["quality_grade"] | null
          quality_score?: number | null
          recommendations?: string | null
          shelf_life?: string | null
          user_id: string
          visual_assessment?: string[] | null
        }
        Update: {
          created_at?: string
          defects_detected?: string[] | null
          estimated_price_range?: string | null
          id?: string
          image_url?: string | null
          market_readiness?:
            | Database["public"]["Enums"]["market_readiness"]
            | null
          notes?: string | null
          product_name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          quality_grade?: Database["public"]["Enums"]["quality_grade"] | null
          quality_score?: number | null
          recommendations?: string | null
          shelf_life?: string | null
          user_id?: string
          visual_assessment?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_analyses: {
        Row: {
          agricultural_impact: string | null
          created_at: string
          current_conditions: string | null
          current_temperature: number | null
          forecast_7day: Json | null
          historical_comparison: string | null
          humidity: number | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          optimal_activities: Json | null
          planting_recommendations: Json | null
          precipitation: number | null
          risk_alerts: string[] | null
          user_id: string
          uv_index: number | null
          wind_speed: number | null
        }
        Insert: {
          agricultural_impact?: string | null
          created_at?: string
          current_conditions?: string | null
          current_temperature?: number | null
          forecast_7day?: Json | null
          historical_comparison?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          optimal_activities?: Json | null
          planting_recommendations?: Json | null
          precipitation?: number | null
          risk_alerts?: string[] | null
          user_id: string
          uv_index?: number | null
          wind_speed?: number | null
        }
        Update: {
          agricultural_impact?: string | null
          created_at?: string
          current_conditions?: string | null
          current_temperature?: number | null
          forecast_7day?: Json | null
          historical_comparison?: string | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          optimal_activities?: Json | null
          planting_recommendations?: Json | null
          precipitation?: number | null
          risk_alerts?: string[] | null
          user_id?: string
          uv_index?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      demand_supply_level:
        | "very_low"
        | "low"
        | "moderate"
        | "high"
        | "very_high"
      farm_type: "crops" | "livestock" | "mixed" | "poultry" | "dairy"
      listing_category:
        | "crops"
        | "livestock"
        | "dairy"
        | "poultry"
        | "seeds"
        | "equipment"
        | "other"
      listing_status: "active" | "sold" | "inactive"
      market_readiness: "ready" | "needs_improvement" | "not_ready"
      price_trend: "falling" | "stable" | "rising"
      product_type: "crop" | "livestock" | "dairy" | "processed"
      quality_grade: "premium" | "grade_a" | "grade_b" | "grade_c" | "reject"
      user_type: "farmer" | "buyer"
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
      demand_supply_level: ["very_low", "low", "moderate", "high", "very_high"],
      farm_type: ["crops", "livestock", "mixed", "poultry", "dairy"],
      listing_category: [
        "crops",
        "livestock",
        "dairy",
        "poultry",
        "seeds",
        "equipment",
        "other",
      ],
      listing_status: ["active", "sold", "inactive"],
      market_readiness: ["ready", "needs_improvement", "not_ready"],
      price_trend: ["falling", "stable", "rising"],
      product_type: ["crop", "livestock", "dairy", "processed"],
      quality_grade: ["premium", "grade_a", "grade_b", "grade_c", "reject"],
      user_type: ["farmer", "buyer"],
    },
  },
} as const
