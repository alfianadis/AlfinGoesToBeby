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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      checklist: {
        Row: {
          catatan: string | null
          created_at: string
          deadline: string | null
          id: string
          kategori: string | null
          pic: string | null
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          kategori?: string | null
          pic?: string | null
          status?: string
          task: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          kategori?: string | null
          pic?: string | null
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: []
      }
      config: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      kategori: {
        Row: {
          budget_rencana: number
          created_at: string
          id: string
          nama: string
          updated_at: string
        }
        Insert: {
          budget_rencana?: number
          created_at?: string
          id?: string
          nama: string
          updated_at?: string
        }
        Update: {
          budget_rencana?: number
          created_at?: string
          id?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      kontak: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          kategori: string | null
          nama: string
          peran: string | null
          telepon: string | null
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          kategori?: string | null
          nama: string
          peran?: string | null
          telepon?: string | null
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          kategori?: string | null
          nama?: string
          peran?: string | null
          telepon?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kua: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          status_cpp: boolean
          status_cpw: boolean
          syarat: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          status_cpp?: boolean
          status_cpw?: boolean
          syarat: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          status_cpp?: boolean
          status_cpw?: boolean
          syarat?: string
          updated_at?: string
        }
        Relationships: []
      }
      moodboard: {
        Row: {
          created_at: string
          created_by: string | null
          file_url: string | null
          id: string
          judul: string | null
          mime: string | null
          storage_path: string | null
          ukuran: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          judul?: string | null
          mime?: string | null
          storage_path?: string | null
          ukuran?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          judul?: string | null
          mime?: string | null
          storage_path?: string | null
          ukuran?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          isi: string | null
          judul: string
          link: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          isi?: string | null
          judul: string
          link?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          isi?: string | null
          judul?: string
          link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rundown: {
        Row: {
          acara: string
          catatan: string | null
          created_at: string
          id: string
          lokasi: string | null
          pic: string | null
          updated_at: string
          waktu_mulai: string | null
          waktu_selesai: string | null
        }
        Insert: {
          acara: string
          catatan?: string | null
          created_at?: string
          id?: string
          lokasi?: string | null
          pic?: string | null
          updated_at?: string
          waktu_mulai?: string | null
          waktu_selesai?: string | null
        }
        Update: {
          acara?: string
          catatan?: string | null
          created_at?: string
          id?: string
          lokasi?: string | null
          pic?: string | null
          updated_at?: string
          waktu_mulai?: string | null
          waktu_selesai?: string | null
        }
        Relationships: []
      }
      seserahan: {
        Row: {
          brand: string | null
          created_at: string
          harga: number
          id: string
          item: string
          kategori: string | null
          link: string | null
          status: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          harga?: number
          id?: string
          item: string
          kategori?: string | null
          link?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          harga?: number
          id?: string
          item?: string
          kategori?: string | null
          link?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tamu: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          jumlah_orang: number
          nama: string
          pihak: string
          relasi: string | null
          status_undangan: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          jumlah_orang?: number
          nama: string
          pihak?: string
          relasi?: string | null
          status_undangan?: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          jumlah_orang?: number
          nama?: string
          pihak?: string
          relasi?: string | null
          status_undangan?: string
          updated_at?: string
        }
        Relationships: []
      }
      transaksi: {
        Row: {
          catatan: string | null
          created_at: string
          created_by: string | null
          deskripsi: string | null
          dibayar_oleh: string | null
          id: string
          jumlah: number
          kategori: string | null
          tanggal: string | null
          tipe: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          dibayar_oleh?: string | null
          id?: string
          jumlah?: number
          kategori?: string | null
          tanggal?: string | null
          tipe: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          dibayar_oleh?: string | null
          id?: string
          jumlah?: number
          kategori?: string | null
          tanggal?: string | null
          tipe?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaksi_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor: {
        Row: {
          catatan: string | null
          created_at: string
          dp_dibayar: number
          harga_deal: number
          id: string
          kategori: string | null
          kontak: string | null
          link: string | null
          nama: string
          sisa: number | null
          status: string
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          dp_dibayar?: number
          harga_deal?: number
          id?: string
          kategori?: string | null
          kontak?: string | null
          link?: string | null
          nama: string
          sisa?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          dp_dibayar?: number
          harga_deal?: number
          id?: string
          kategori?: string | null
          kontak?: string | null
          link?: string | null
          nama?: string
          sisa?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_allowed_user: { Args: never; Returns: boolean }
      recalc_vendor_dp: { Args: { p_vendor_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
