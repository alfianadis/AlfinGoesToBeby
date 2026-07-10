// Row types mirroring the Supabase schema (supabase/migrations/0001_init.sql)

export interface Kategori {
  id: string
  nama: string
  budget_rencana: number
  created_at: string
  updated_at: string
}

export type VendorStatus = 'kandidat' | 'deal' | 'lunas'

export interface Vendor {
  id: string
  nama: string
  kategori: string | null
  kontak: string | null
  harga_deal: number
  status: VendorStatus
  dp_dibayar: number
  sisa: number
  catatan: string | null
  link: string | null
  created_at: string
  updated_at: string
}

export type TransaksiTipe = 'pemasukan' | 'pengeluaran'

export interface Transaksi {
  id: string
  tanggal: string | null
  tipe: TransaksiTipe
  kategori: string | null
  deskripsi: string | null
  jumlah: number
  dibayar_oleh: string | null
  vendor_id: string | null
  catatan: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ChecklistStatus = 'belum' | 'proses' | 'selesai'

export interface Checklist {
  id: string
  task: string
  kategori: string | null
  deadline: string | null
  pic: string | null
  status: ChecklistStatus
  catatan: string | null
  created_at: string
  updated_at: string
}

export type SeserahanStatus = 'rencana' | 'sudah dibeli'

export interface Seserahan {
  id: string
  kategori: string | null
  item: string
  brand: string | null
  status: SeserahanStatus
  harga: number
  link: string | null
  created_at: string
  updated_at: string
}

export interface Kua {
  id: string
  syarat: string
  status_cpp: boolean
  status_cpw: boolean
  catatan: string | null
  created_at: string
  updated_at: string
}

export interface Moodboard {
  id: string
  judul: string | null
  storage_path: string | null
  file_url: string | null
  mime: string | null
  ukuran: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TamuStatus = 'belum' | 'terkirim' | 'hadir' | 'tidak hadir'
export type TamuPihak = 'CPP' | 'CPW' | 'Bersama'

export interface Tamu {
  id: string
  nama: string
  relasi: string | null
  jumlah_orang: number
  status_undangan: TamuStatus
  pihak: TamuPihak
  catatan: string | null
  created_at: string
  updated_at: string
}

export interface Rundown {
  id: string
  acara: string
  waktu_mulai: string | null
  waktu_selesai: string | null
  lokasi: string | null
  pic: string | null
  catatan: string | null
  created_at: string
  updated_at: string
}

export interface Notes {
  id: string
  judul: string
  isi: string | null
  link: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ConfigRow {
  key: string
  value: string | null
  updated_at: string
}

export interface Kontak {
  id: string
  nama: string
  peran: string | null
  telepon: string | null
  kategori: string | null
  catatan: string | null
  created_at: string
  updated_at: string
}
