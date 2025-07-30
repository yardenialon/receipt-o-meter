export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      branch_mappings: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          source_branch_id: string
          source_branch_name: string | null
          source_chain: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          source_branch_id: string
          source_branch_name?: string | null
          source_chain: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          source_branch_id?: string
          source_branch_name?: string | null
          source_chain?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chain_mappings: {
        Row: {
          created_at: string | null
          id: string
          mapping_status: string | null
          our_chain_id: string
          source_chain_id: string
          source_chain_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mapping_status?: string | null
          our_chain_id: string
          source_chain_id: string
          source_chain_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mapping_status?: string | null
          our_chain_id?: string
          source_chain_id?: string
          source_chain_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chain_mappings_our_chain_id_fkey"
            columns: ["our_chain_id"]
            isOneToOne: false
            referencedRelation: "store_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          contant: string | null
          created_at: string
          id: number
        }
        Insert: {
          contant?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          contant?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      image_batch_uploads: {
        Row: {
          completed_at: string | null
          created_at: string
          failed_images: number | null
          id: string
          name: string
          processed_images: number | null
          status: string | null
          successful_images: number | null
          total_images: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          failed_images?: number | null
          id?: string
          name: string
          processed_images?: number | null
          status?: string | null
          successful_images?: number | null
          total_images?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          failed_images?: number | null
          id?: string
          name?: string
          processed_images?: number | null
          status?: string | null
          successful_images?: number | null
          total_images?: number | null
        }
        Relationships: []
      }
      price_file_uploads: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_log: Json | null
          filename: string
          id: string
          processed_chunks: number
          started_at: string | null
          status: string
          store_chain: string
          total_chunks: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          filename: string
          id?: string
          processed_chunks?: number
          started_at?: string | null
          status?: string
          store_chain: string
          total_chunks?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          filename?: string
          id?: string
          processed_chunks?: number
          started_at?: string | null
          status?: string
          store_chain?: string
          total_chunks?: number
        }
        Relationships: []
      }
      price_history: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          is_promotion: boolean | null
          price: number
          product_id: string
          promotion_description: string | null
          quantity: number | null
          unit_price: number | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          is_promotion?: boolean | null
          price: number
          product_id: string
          promotion_description?: string | null
          quantity?: number | null
          unit_price?: number | null
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          is_promotion?: boolean | null
          price?: number
          product_id?: string
          promotion_description?: string | null
          quantity?: number | null
          unit_price?: number | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_updates: {
        Row: {
          chain_name: string
          completed_at: string | null
          error_log: Json | null
          id: string
          processed_products: number | null
          processed_stores: number | null
          started_at: string
          status: string
          total_products: number | null
          total_stores: number | null
        }
        Insert: {
          chain_name: string
          completed_at?: string | null
          error_log?: Json | null
          id?: string
          processed_products?: number | null
          processed_stores?: number | null
          started_at?: string
          status?: string
          total_products?: number | null
          total_stores?: number | null
        }
        Update: {
          chain_name?: string
          completed_at?: string | null
          error_log?: Json | null
          id?: string
          processed_products?: number | null
          processed_stores?: number | null
          started_at?: string
          status?: string
          total_products?: number | null
          total_stores?: number | null
        }
        Relationships: []
      }
      product_alternatives: {
        Row: {
          alternative_name: string
          alternative_type: string
          benefits: string
          category: string
          created_at: string
          id: string
          price_range_max: number | null
          price_range_min: number | null
          product_name: string
        }
        Insert: {
          alternative_name: string
          alternative_type: string
          benefits: string
          category: string
          created_at?: string
          id?: string
          price_range_max?: number | null
          price_range_min?: number | null
          product_name: string
        }
        Update: {
          alternative_name?: string
          alternative_type?: string
          benefits?: string
          category?: string
          created_at?: string
          id?: string
          price_range_max?: number | null
          price_range_min?: number | null
          product_name?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          batch_id: string | null
          created_at: string
          id: string
          image_path: string
          is_primary: boolean
          product_code: string
          product_name: string | null
          status: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          id?: string
          image_path: string
          is_primary?: boolean
          product_code: string
          product_name?: string | null
          status?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          id?: string
          image_path?: string
          is_primary?: boolean
          product_code?: string
          product_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_weighted: boolean | null
          manufacturer: string | null
          name: string
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_weighted?: boolean | null
          manufacturer?: string | null
          name: string
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_weighted?: boolean | null
          manufacturer?: string | null
          name?: string
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          price: number
          product_code: string | null
          quantity: number | null
          receipt_id: string
          refundable_amount: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          price: number
          product_code?: string | null
          quantity?: number | null
          receipt_id: string
          refundable_amount?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          product_code?: string | null
          quantity?: number | null
          receipt_id?: string
          refundable_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          store_name: string | null
          total: number | null
          total_refundable: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          store_name?: string | null
          total?: number | null
          total_refundable?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          store_name?: string | null
          total?: number | null
          total_refundable?: number | null
          user_id?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          list_id: string
          name: string
          product_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          list_id: string
          name: string
          product_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          list_id?: string
          name?: string
          product_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_branches: {
        Row: {
          address: string | null
          branch_id: string
          chain_id: string
          city: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          branch_id: string
          chain_id: string
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string
          chain_id?: string
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_branches_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "store_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      store_chains: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      store_products: {
        Row: {
          allow_discount: boolean | null
          branch_mapping_id: string | null
          category: string | null
          id: string
          is_weighted: boolean | null
          item_status: string | null
          item_type: string | null
          manufacture_country: string | null
          manufacturer: string | null
          manufacturer_item_description: string | null
          price: number
          price_update_date: string | null
          product_code: string
          product_name: string
          qty_in_package: number | null
          quantity: number | null
          store_chain: string
          store_id: string
          unit_of_measure: string | null
          unit_of_measure_price: number | null
          unit_quantity: string | null
        }
        Insert: {
          allow_discount?: boolean | null
          branch_mapping_id?: string | null
          category?: string | null
          id?: string
          is_weighted?: boolean | null
          item_status?: string | null
          item_type?: string | null
          manufacture_country?: string | null
          manufacturer?: string | null
          manufacturer_item_description?: string | null
          price: number
          price_update_date?: string | null
          product_code: string
          product_name: string
          qty_in_package?: number | null
          quantity?: number | null
          store_chain: string
          store_id: string
          unit_of_measure?: string | null
          unit_of_measure_price?: number | null
          unit_quantity?: string | null
        }
        Update: {
          allow_discount?: boolean | null
          branch_mapping_id?: string | null
          category?: string | null
          id?: string
          is_weighted?: boolean | null
          item_status?: string | null
          item_type?: string | null
          manufacture_country?: string | null
          manufacturer?: string | null
          manufacturer_item_description?: string | null
          price?: number
          price_update_date?: string | null
          product_code?: string
          product_name?: string
          qty_in_package?: number | null
          quantity?: number | null
          store_chain?: string
          store_id?: string
          unit_of_measure?: string | null
          unit_of_measure_price?: number | null
          unit_quantity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_products_branch_mapping_id_fkey"
            columns: ["branch_mapping_id"]
            isOneToOne: false
            referencedRelation: "branch_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_popular_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          name: string
          product_code: string
          count: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      process_imported_products: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_keshet_products: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
