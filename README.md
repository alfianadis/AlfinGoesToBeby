# Wedding Tracker

Aplikasi web untuk manajemen persiapan pernikahan — dibangun dengan React + Supabase, di-deploy di Vercel.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)

---

## Mulai

Lihat **[INSTALLATION.md](./docs/INSTALLATION.md)** untuk panduan setup dan deploy lengkap dari nol.

---

## Fitur

12 modul untuk manajemen persiapan pernikahan dari awal hingga hari-H.

| Modul | Deskripsi |
|-------|-----------|
| **Dashboard** | Countdown hari-H, ringkasan saldo keuangan, progress checklist, statistik tamu & vendor |
| **Keuangan** | Catat pemasukan & pengeluaran, ringkasan anggaran per kategori dengan progress bar, auto-detect over-budget |
| **Vendor** | Kelola vendor (kandidat / deal / lunas), tracking DP & sisa pembayaran, auto-recalculate via DB trigger |
| **Kategori** | Atur kategori anggaran & budget rencana, visualisasi terpakai vs budget |
| **Checklist** | 38 tugas preset berdasarkan fase waktu (12+ Bulan s/d Setelah), deadline otomatis, status toggle, highlight overdue |
| **Seserahan** | Daftar item seserahan, toggle status beli, harga per item, grup per kategori |
| **Dokumen KUA** | 18 persyaratan nikah standar, dual checkbox per pihak (CPP & CPW) |
| **Moodboard** | Upload gambar/PDF ke Supabase Storage (maks 10MB), lightbox preview, grid gallery |
| **Tamu** | Daftar undangan dipisah per pihak (CPP/CPW/Bersama), status undangan, statistik per pihak |
| **Rundown** | Timeline acara hari-H, urut otomatis berdasarkan waktu |
| **Catatan** | Notes bebas dengan link referensi, card grid |
| **Kontak Penting** | Daftar kontak vendor/panitia/keluarga, tombol telepon & WhatsApp langsung |

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Vite 8 + React 19 + TypeScript 6 |
| Styling | Tailwind CSS v4 + shadcn/ui (preset Nova) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Hosting | Vercel |
| Font | Geist Variable |
| PWA | vite-plugin-pwa + Workbox |
| Icons | Lucide React |

---

## Arsitektur & Security

```
Browser (React SPA + PWA)
    ↓ supabase-js (anon key)
Supabase (PostgreSQL + Auth + Storage)
    ├── Row Level Security (RLS) — semua tabel
    ├── Email Whitelist — hanya email terdaftar yang bisa akses data
    ├── Auth — Google OAuth, sign-up disabled
    ├── DB Triggers — auto recalculate vendor DP dari transaksi
    └── Storage — bucket 'moodboard' (public read, auth write)
```

**Security layers:**

1. **Google OAuth** — hanya user dengan akun Google yang bisa mencoba login
2. **Email Whitelist** — dicek di dua lapis: frontend (`VITE_ALLOWED_EMAILS`) dan database (RLS function `is_allowed_user()`)
3. **Storage policies** — upload/delete hanya authenticated, read public
4. **No backend code** — semua logic via Supabase client + DB triggers

---

## Database Schema

### Tabel

| Tabel | Deskripsi | Kolom utama |
|-------|-----------|-------------|
| `config` | Key-value settings app | key, value |
| `kategori` | Kategori anggaran | nama, budget_rencana |
| `vendor` | Data vendor | nama, kategori, harga_deal, status, dp_dibayar, sisa (generated) |
| `transaksi` | Pemasukan/pengeluaran | tanggal, tipe, kategori, deskripsi, jumlah, dibayar_oleh, vendor_id |
| `checklist` | Tugas persiapan | task, kategori, deadline, pic, status |
| `seserahan` | Item seserahan | item, kategori, brand, status, harga, link |
| `kua` | Persyaratan dokumen KUA | syarat, status_cpp, status_cpw, catatan |
| `moodboard` | File inspirasi | judul, storage_path, file_url, mime, ukuran |
| `tamu` | Daftar undangan | nama, relasi, jumlah_orang, status_undangan, pihak |
| `rundown` | Susunan acara | acara, waktu_mulai, waktu_selesai, lokasi, pic |
| `notes` | Catatan bebas | judul, isi, link |
| `kontak` | Kontak penting | nama, peran, telepon, kategori |

### Triggers

| Trigger | Fungsi |
|---------|--------|
| `recalc_vendor_dp` | Otomatis update `vendor.dp_dibayar` dan set status `lunas` saat ada perubahan di `transaksi` yang terkait vendor |
| `set_updated_at` | Auto-update kolom `updated_at` di semua tabel |

### Migrations

```
supabase/migrations/
├── 0001_init.sql                    # Schema lengkap + RLS + triggers
├── 0002_storage_moodboard.sql       # Storage bucket policies
├── 0003_update_config.sql           # Set config awal (tanggal, nama pasangan)
├── 0004_grants.sql                  # Table grants untuk authenticated role
├── 0005_seed_from_xlsx.sql          # Data seed dummy
├── 0006_kontak.sql                  # Tabel kontak penting
├── 0007_tamu_pihak.sql              # Kolom pihak (CPP/CPW/Bersama) di tamu
└── 0008_google_oauth_whitelist.sql  # Email whitelist via RLS function
```

---

## Struktur Project

```
wedding-tracker-web/
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.svg
│   └── pwa-512x512.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (vendored)
│   │   ├── AppLayout.tsx        # Sidebar + topbar layout
│   │   ├── ConfirmDialog.tsx
│   │   ├── CurrencyInput.tsx
│   │   ├── EmptyState.tsx
│   │   ├── PageHeader.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── StatCard.tsx
│   │   └── StatusBadge.tsx
│   ├── hooks/
│   │   ├── useCollection.ts     # Generic CRUD hook untuk semua tabel Supabase
│   │   └── useConfig.tsx        # Load + update config (tanggal, nama pasangan)
│   ├── lib/
│   │   ├── auth.tsx             # AuthProvider + Google OAuth + email whitelist
│   │   ├── database.types.ts    # Generated types dari Supabase
│   │   ├── format.ts            # formatRupiah, formatDate, relativeDays, initials
│   │   ├── supabase.ts          # Supabase client singleton
│   │   ├── types.ts             # TypeScript interfaces semua tabel
│   │   └── utils.ts             # cn() utility (shadcn)
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── KeuanganPage.tsx
│   │   ├── VendorPage.tsx
│   │   ├── KategoriPage.tsx
│   │   ├── ChecklistPage.tsx
│   │   ├── SeserahanPage.tsx
│   │   ├── KuaPage.tsx
│   │   ├── MoodboardPage.tsx
│   │   ├── TamuPage.tsx
│   │   ├── RundownPage.tsx
│   │   ├── NotesPage.tsx
│   │   ├── KontakPage.tsx
│   │   ├── PengaturanPage.tsx
│   │   └── LoginPage.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase/
│   └── migrations/
├── .env.example
├── docs/
│   └── INSTALLATION.md
├── README.md
├── package.json
└── vite.config.ts
```

---

## Scripts

```bash
npm run dev      # Development server → http://localhost:5173
npm run build    # Production build → /dist
npm run preview  # Preview production build secara lokal
npm run lint     # ESLint check
```

---

## Environment Variables

| Variable | Deskripsi | Wajib |
|----------|-----------|:-----:|
| `VITE_SUPABASE_URL` | URL project Supabase — `https://xxx.supabase.co` | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key dari Supabase | ✅ |
| `VITE_ALLOWED_EMAILS` | Email Google yang diizinkan login, pisah koma — `email1@gmail.com,email2@gmail.com` | ✅ |

---

## Design System

| Aspek | Value |
|-------|-------|
| Primary color | Warm rose/wine — `oklch(0.47 0.13 12)` |
| Font | Geist Variable (sans-serif) |
| Border radius | `0.7rem` |
| Components | shadcn/ui preset Nova |
| Icons | Lucide React |
| Theme | Light mode |

---

## Credit

made with ❤️ by **Botang**

[![Instagram](https://img.shields.io/badge/Instagram-@alvinghzl-E4405F?logo=instagram&logoColor=white)](https://instagram.com/alvinghzl)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-alfianadis-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alfianadisseptianto/)
[![GitHub](https://img.shields.io/badge/GitHub-eLsavation-181717?logo=github&logoColor=white)](https://github.com/eLsavation)

---

## License

MIT — bebas digunakan dan dimodifikasi.
