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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      booking_assignments: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by: string
          booking_id: string
          business_id: string
          driver_user_id: string
          id: string
          machine_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by: string
          booking_id: string
          business_id: string
          driver_user_id: string
          id?: string
          machine_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string
          booking_id?: string
          business_id?: string
          driver_user_id?: string
          id?: string
          machine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_assigner_business_fk"
            columns: ["assigned_by", "business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "assignments_booking_business_fk"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "assignments_driver_business_fk"
            columns: ["driver_user_id", "business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "assignments_machine_business_fk"
            columns: ["machine_id", "business_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "booking_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_driver_user_id_fkey"
            columns: ["driver_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_assignments_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          branch_id: string | null
          business_id: string
          created_at: string
          customer_mobile: string
          customer_name: string
          customer_user_id: string | null
          diesel_included: boolean
          ends_at: string | null
          id: string
          machine_id: string | null
          notes: string | null
          operator_included: boolean
          payment_status: Database["public"]["Enums"]["payment_status"]
          quantity: number
          quoted_amount: number | null
          rental_unit: Database["public"]["Enums"]["rental_unit"]
          site_address: string
          site_landmark: string | null
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          tracking_token_hash: string | null
          transport_required: boolean
          updated_at: string
          work_type: string | null
        }
        Insert: {
          branch_id?: string | null
          business_id: string
          created_at?: string
          customer_mobile: string
          customer_name: string
          customer_user_id?: string | null
          diesel_included?: boolean
          ends_at?: string | null
          id?: string
          machine_id?: string | null
          notes?: string | null
          operator_included?: boolean
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity: number
          quoted_amount?: number | null
          rental_unit: Database["public"]["Enums"]["rental_unit"]
          site_address: string
          site_landmark?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          tracking_token_hash?: string | null
          transport_required?: boolean
          updated_at?: string
          work_type?: string | null
        }
        Update: {
          branch_id?: string | null
          business_id?: string
          created_at?: string
          customer_mobile?: string
          customer_name?: string
          customer_user_id?: string | null
          diesel_included?: boolean
          ends_at?: string | null
          id?: string
          machine_id?: string | null
          notes?: string | null
          operator_included?: boolean
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity?: number
          quoted_amount?: number | null
          rental_unit?: Database["public"]["Enums"]["rental_unit"]
          site_address?: string
          site_landmark?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          tracking_token_hash?: string | null
          transport_required?: boolean
          updated_at?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_branch_business_fk"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_machine_business_fk"
            columns: ["machine_id", "business_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "bookings_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          business_id: string
          created_at: string
          id: string
          is_primary: boolean
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          default_currency: string
          gst_enabled: boolean
          gstin: string | null
          id: string
          name: string
          phone: string | null
          service_area: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_currency?: string
          gst_enabled?: boolean
          gstin?: string | null
          id?: string
          name: string
          phone?: string | null
          service_area?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_currency?: string
          gst_enabled?: boolean
          gstin?: string | null
          id?: string
          name?: string
          phone?: string | null
          service_area?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      driver_attendance: {
        Row: {
          branch_id: string | null
          business_id: string
          check_in_at: string
          check_in_note: string | null
          check_out_at: string | null
          check_out_note: string | null
          created_at: string
          driver_user_id: string
          id: string
        }
        Insert: {
          branch_id?: string | null
          business_id: string
          check_in_at?: string
          check_in_note?: string | null
          check_out_at?: string | null
          check_out_note?: string | null
          created_at?: string
          driver_user_id: string
          id?: string
        }
        Update: {
          branch_id?: string | null
          business_id?: string
          check_in_at?: string
          check_in_note?: string | null
          check_out_at?: string | null
          check_out_note?: string | null
          created_at?: string
          driver_user_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_branch_business_fk"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "attendance_driver_business_fk"
            columns: ["driver_user_id", "business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "driver_attendance_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_attendance_driver_user_id_fkey"
            columns: ["driver_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_logs: {
        Row: {
          booking_id: string | null
          business_id: string
          created_at: string
          details: string
          driver_user_id: string
          evidence_path: string | null
          id: string
          log_type: string
          machine_id: string
          meter_reading: number | null
          occurred_at: string
          quantity: number | null
          unit: string | null
        }
        Insert: {
          booking_id?: string | null
          business_id: string
          created_at?: string
          details: string
          driver_user_id: string
          evidence_path?: string | null
          id?: string
          log_type: string
          machine_id: string
          meter_reading?: number | null
          occurred_at?: string
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          booking_id?: string | null
          business_id?: string
          created_at?: string
          details?: string
          driver_user_id?: string
          evidence_path?: string | null
          id?: string
          log_type?: string
          machine_id?: string
          meter_reading?: number | null
          occurred_at?: string
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_booking_business_fk"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "logs_driver_business_fk"
            columns: ["driver_user_id", "business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "logs_machine_business_fk"
            columns: ["machine_id", "business_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "machine_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_logs_driver_user_id_fkey"
            columns: ["driver_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_logs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          branch_id: string | null
          business_id: string
          category: string
          created_at: string
          current_location: string | null
          daily_rate: number | null
          description: string | null
          fleet_code: string
          hourly_rate: number
          id: string
          monthly_rate: number | null
          name: string
          shift_rate: number | null
          status: Database["public"]["Enums"]["machine_status"]
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          business_id: string
          category: string
          created_at?: string
          current_location?: string | null
          daily_rate?: number | null
          description?: string | null
          fleet_code: string
          hourly_rate?: number
          id?: string
          monthly_rate?: number | null
          name: string
          shift_rate?: number | null
          status?: Database["public"]["Enums"]["machine_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          business_id?: string
          category?: string
          created_at?: string
          current_location?: string | null
          daily_rate?: number | null
          description?: string | null
          fleet_code?: string
          hourly_rate?: number
          id?: string
          monthly_rate?: number | null
          name?: string
          shift_rate?: number | null
          status?: Database["public"]["Enums"]["machine_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "machines_branch_business_fk"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "machines_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch_id: string | null
          business_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          business_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          business_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_business_fk"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      public_booking_rate_limits: {
        Row: {
          attempts: number
          blocked_until: string | null
          id: string
          ip_hash: string
          phone_hash: string
          updated_at: string
          window_started_at: string
        }
        Insert: {
          attempts?: number
          blocked_until?: string | null
          id?: string
          ip_hash: string
          phone_hash: string
          updated_at?: string
          window_started_at?: string
        }
        Update: {
          attempts?: number
          blocked_until?: string | null
          id?: string
          ip_hash?: string
          phone_hash?: string
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
      staff_login_attempts: {
        Row: {
          attempts: number
          blocked_until: string | null
          id: string
          identifier_hash: string
          ip_hash: string
          updated_at: string
          window_started_at: string
        }
        Insert: {
          attempts?: number
          blocked_until?: string | null
          id?: string
          identifier_hash: string
          ip_hash: string
          updated_at?: string
          window_started_at?: string
        }
        Update: {
          attempts?: number
          blocked_until?: string | null
          id?: string
          identifier_hash?: string
          ip_hash?: string
          updated_at?: string
          window_started_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_booking: {
        Args: {
          p_booking_id: string
          p_driver_user_id: string
          p_machine_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "owner" | "manager" | "driver" | "customer"
      booking_status:
        | "pending"
        | "approved"
        | "rejected"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      machine_status: "available" | "on_rent" | "maintenance" | "inactive"
      payment_status:
        | "unpaid"
        | "advance_paid"
        | "partially_paid"
        | "paid"
        | "refunded"
      rental_unit: "hour" | "shift" | "day" | "month" | "project"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["owner", "manager", "driver", "customer"],
      booking_status: [
        "pending",
        "approved",
        "rejected",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      machine_status: ["available", "on_rent", "maintenance", "inactive"],
      payment_status: [
        "unpaid",
        "advance_paid",
        "partially_paid",
        "paid",
        "refunded",
      ],
      rental_unit: ["hour", "shift", "day", "month", "project"],
    },
  },
} as const
