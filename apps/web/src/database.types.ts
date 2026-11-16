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
          tracking_token_expires_at: string | null
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
          tracking_token_expires_at?: string | null
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
          tracking_token_expires_at?: string | null
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
      business_expenses: {
        Row: {
          amount: number
          booking_id: string | null
          branch_id: string | null
          business_id: string
          category: string
          created_at: string
          created_by: string
          description: string
          evidence_path: string | null
          expense_date: string
          id: string
          machine_id: string | null
          payment_method: string
          reference: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          branch_id?: string | null
          business_id: string
          category: string
          created_at?: string
          created_by: string
          description: string
          evidence_path?: string | null
          expense_date?: string
          id?: string
          machine_id?: string | null
          payment_method?: string
          reference?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          branch_id?: string | null
          business_id?: string
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          evidence_path?: string | null
          expense_date?: string
          id?: string
          machine_id?: string | null
          payment_method?: string
          reference?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_expenses_booking_id_business_id_fkey"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "business_expenses_branch_id_business_id_fkey"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "business_expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_expenses_machine_id_business_id_fkey"
            columns: ["machine_id", "business_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          default_currency: string
          gst_enabled: boolean
          gst_rate: number
          gstin: string | null
          id: string
          invoice_prefix: string
          invoice_terms: string | null
          name: string
          phone: string | null
          service_area: string | null
          updated_at: string
          upi_id: string | null
          upi_qr_path: string | null
        }
        Insert: {
          created_at?: string
          default_currency?: string
          gst_enabled?: boolean
          gst_rate?: number
          gstin?: string | null
          id?: string
          invoice_prefix?: string
          invoice_terms?: string | null
          name: string
          phone?: string | null
          service_area?: string | null
          updated_at?: string
          upi_id?: string | null
          upi_qr_path?: string | null
        }
        Update: {
          created_at?: string
          default_currency?: string
          gst_enabled?: boolean
          gst_rate?: number
          gstin?: string | null
          id?: string
          invoice_prefix?: string
          invoice_terms?: string | null
          name?: string
          phone?: string | null
          service_area?: string | null
          updated_at?: string
          upi_id?: string | null
          upi_qr_path?: string | null
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
      driver_tracking_sessions: {
        Row: {
          assignment_id: string
          booking_id: string
          branch_id: string | null
          business_id: string
          created_at: string
          driver_user_id: string
          ended_at: string | null
          id: string
          last_location_at: string | null
          machine_id: string
          started_at: string
        }
        Insert: {
          assignment_id: string
          booking_id: string
          branch_id?: string | null
          business_id: string
          created_at?: string
          driver_user_id: string
          ended_at?: string | null
          id?: string
          last_location_at?: string | null
          machine_id: string
          started_at?: string
        }
        Update: {
          assignment_id?: string
          booking_id?: string
          branch_id?: string | null
          business_id?: string
          created_at?: string
          driver_user_id?: string
          ended_at?: string | null
          id?: string
          last_location_at?: string | null
          machine_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_tracking_sessions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_session_assignment_fk"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "booking_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_session_booking_business_fk"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "tracking_session_branch_business_fk"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "tracking_session_business_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_session_driver_business_fk"
            columns: ["driver_user_id", "business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "tracking_session_machine_business_fk"
            columns: ["machine_id", "business_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      machine_location_updates: {
        Row: {
          accuracy_m: number | null
          assignment_id: string
          booking_id: string
          branch_id: string | null
          business_id: string
          captured_at: string
          driver_user_id: string
          heading_deg: number | null
          id: number
          latitude: number
          longitude: number
          machine_id: string
          received_at: string
          speed_mps: number | null
          tracking_session_id: string
        }
        Insert: {
          accuracy_m?: number | null
          assignment_id: string
          booking_id: string
          branch_id?: string | null
          business_id: string
          captured_at: string
          driver_user_id: string
          heading_deg?: number | null
          id?: never
          latitude: number
          longitude: number
          machine_id: string
          received_at?: string
          speed_mps?: number | null
          tracking_session_id: string
        }
        Update: {
          accuracy_m?: number | null
          assignment_id?: string
          booking_id?: string
          branch_id?: string | null
          business_id?: string
          captured_at?: string
          driver_user_id?: string
          heading_deg?: number | null
          id?: never
          latitude?: number
          longitude?: number
          machine_id?: string
          received_at?: string
          speed_mps?: number | null
          tracking_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_booking_business_fk"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "location_branch_business_fk"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "location_business_fk"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_driver_business_fk"
            columns: ["driver_user_id", "business_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "location_machine_business_fk"
            columns: ["machine_id", "business_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "machine_location_updates_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "booking_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_location_updates_tracking_session_id_fkey"
            columns: ["tracking_session_id"]
            isOneToOne: false
            referencedRelation: "driver_tracking_sessions"
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
      notifications: {
        Row: {
          audience: string
          body: string
          booking_id: string | null
          branch_id: string | null
          business_id: string
          created_at: string
          event_type: string
          id: string
          payload: Json
          read_at: string | null
          recipient_user_id: string | null
          title: string
        }
        Insert: {
          audience: string
          body: string
          booking_id?: string | null
          branch_id?: string | null
          business_id: string
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          read_at?: string | null
          recipient_user_id?: string | null
          title: string
        }
        Update: {
          audience?: string
          body?: string
          booking_id?: string | null
          branch_id?: string | null
          business_id?: string
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          read_at?: string | null
          recipient_user_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_business_fk"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "notifications_branch_business_fk"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "notifications_business_id_fkey"
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
      rental_invoice_items: {
        Row: {
          business_id: string
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          business_id: string
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total: number
          quantity?: number
          unit?: string
          unit_price: number
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "rental_invoice_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_invoice_items_invoice_id_business_id_fkey"
            columns: ["invoice_id", "business_id"]
            isOneToOne: false
            referencedRelation: "rental_invoices"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      rental_invoices: {
        Row: {
          amount_paid: number
          balance_amount: number
          billing_address: string
          booking_id: string
          branch_id: string | null
          business_id: string
          created_at: string
          created_by: string
          currency: string
          customer_mobile: string
          customer_name: string
          discount_amount: number
          due_at: string | null
          gst_enabled_snapshot: boolean
          gstin_snapshot: string | null
          id: string
          invoice_number: string
          issued_at: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          taxable_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          balance_amount: number
          billing_address: string
          booking_id: string
          branch_id?: string | null
          business_id: string
          created_at?: string
          created_by: string
          currency?: string
          customer_mobile: string
          customer_name: string
          discount_amount?: number
          due_at?: string | null
          gst_enabled_snapshot?: boolean
          gstin_snapshot?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          notes?: string | null
          status?: string
          subtotal: number
          tax_amount?: number
          tax_rate?: number
          taxable_amount: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          balance_amount?: number
          billing_address?: string
          booking_id?: string
          branch_id?: string | null
          business_id?: string
          created_at?: string
          created_by?: string
          currency?: string
          customer_mobile?: string
          customer_name?: string
          discount_amount?: number
          due_at?: string | null
          gst_enabled_snapshot?: boolean
          gstin_snapshot?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          taxable_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_invoices_booking_id_business_id_fkey"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "rental_invoices_branch_id_business_id_fkey"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "rental_invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_payments: {
        Row: {
          amount: number
          booking_id: string
          branch_id: string | null
          business_id: string
          id: string
          invoice_id: string
          method: string
          notes: string | null
          payment_reference: string | null
          received_at: string
          received_by: string
          status: string
        }
        Insert: {
          amount: number
          booking_id: string
          branch_id?: string | null
          business_id: string
          id?: string
          invoice_id: string
          method: string
          notes?: string | null
          payment_reference?: string | null
          received_at?: string
          received_by: string
          status?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          branch_id?: string | null
          business_id?: string
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          payment_reference?: string | null
          received_at?: string
          received_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_payments_booking_id_business_id_fkey"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "rental_payments_branch_id_business_id_fkey"
            columns: ["branch_id", "business_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "rental_payments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_invoice_id_business_id_fkey"
            columns: ["invoice_id", "business_id"]
            isOneToOne: false
            referencedRelation: "rental_invoices"
            referencedColumns: ["id", "business_id"]
          },
        ]
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
      create_booking_invoice: {
        Args: {
          p_booking_id: string
          p_diesel_amount?: number
          p_discount_amount?: number
          p_notes?: string
          p_operator_amount?: number
          p_other_amount?: number
          p_rental_amount: number
          p_tax_rate?: number
          p_transport_amount?: number
        }
        Returns: string
      }
      driver_set_booking_status: {
        Args: {
          p_booking_id: string
          p_status: Database["public"]["Enums"]["booking_status"]
        }
        Returns: undefined
      }
      record_driver_location: {
        Args: {
          p_accuracy_m?: number
          p_captured_at?: string
          p_heading_deg?: number
          p_latitude: number
          p_longitude: number
          p_session_id: string
          p_speed_mps?: number
        }
        Returns: number
      }
      record_invoice_payment: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_method: string
          p_notes?: string
          p_reference?: string
        }
        Returns: string
      }
      start_driver_tracking: {
        Args: { p_assignment_id: string }
        Returns: string
      }
      stop_driver_tracking: {
        Args: { p_session_id: string }
        Returns: undefined
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
