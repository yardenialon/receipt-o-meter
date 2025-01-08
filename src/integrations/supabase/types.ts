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
          completed_at: string | null
          created_by: string | null
          error_log: Json | null
          id: string
          processed_products: number | null
          started_at: string | null
          status: string | null
          total_products: number | null
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          id?: string
          processed_products?: number | null
          started_at?: string | null
          status?: string | null
          total_products?: number | null
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          error_log?: Json | null
          id?: string
          processed_products?: number | null
          started_at?: string | null
          status?: string | null
          total_products?: number | null
        }
        Relationships: []
      }
      price_upload_chunks: {
        Row: {
          chunk_index: number
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          started_at: string | null
          status: string
          upload_id: string | null
        }
        Insert: {
          chunk_index: number
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          upload_id?: string | null
        }
        Update: {
          chunk_index?: number
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_upload_chunks_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "price_file_uploads"
            referencedColumns: ["id"]
          },
        ]
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          list_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          list_id?: string
          name?: string
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
      store_products_import: {
        Row: {
          AllowDiscount: boolean | null
          bIsWeighted: boolean | null
          ItemCode: string | null
          ItemName: string | null
          ItemPrice: number | null
          ItemStatus: string | null
          ItemType: string | null
          ManufactureCountry: string | null
          ManufacturerItemDescription: string | null
          ManufacturerName: string | null
          PriceUpdateDate: string | null
          QtyInPackage: number | null
          Quantity: number | null
          store_address: string | null
          store_chain: string | null
          store_id: string | null
          UnitOfMeasure: string | null
          UnitOfMeasurePrice: number | null
          UnitQty: string | null
        }
        Insert: {
          AllowDiscount?: boolean | null
          bIsWeighted?: boolean | null
          ItemCode?: string | null
          ItemName?: string | null
          ItemPrice?: number | null
          ItemStatus?: string | null
          ItemType?: string | null
          ManufactureCountry?: string | null
          ManufacturerItemDescription?: string | null
          ManufacturerName?: string | null
          PriceUpdateDate?: string | null
          QtyInPackage?: number | null
          Quantity?: number | null
          store_address?: string | null
          store_chain?: string | null
          store_id?: string | null
          UnitOfMeasure?: string | null
          UnitOfMeasurePrice?: number | null
          UnitQty?: string | null
        }
        Update: {
          AllowDiscount?: boolean | null
          bIsWeighted?: boolean | null
          ItemCode?: string | null
          ItemName?: string | null
          ItemPrice?: number | null
          ItemStatus?: string | null
          ItemType?: string | null
          ManufactureCountry?: string | null
          ManufacturerItemDescription?: string | null
          ManufacturerName?: string | null
          PriceUpdateDate?: string | null
          QtyInPackage?: number | null
          Quantity?: number | null
          store_address?: string | null
          store_chain?: string | null
          store_id?: string | null
          UnitOfMeasure?: string | null
          UnitOfMeasurePrice?: number | null
          UnitQty?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
