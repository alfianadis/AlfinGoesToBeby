# Panduan Instalasi & Setup

Panduan lengkap untuk menginstall, mengkonfigurasi, dan men-deploy Wedding Tracker dari nol.

> **Tidak perlu install apapun di komputer.** Semua bisa dilakukan langsung dari browser via GitHub, Supabase Dashboard, dan Vercel Dashboard. Development lokal bersifat opsional.

---

## Daftar Isi

- [Alur Setup](#alur-setup)
- [1. Fork Repo](#1-fork-repo)
- [2. Setup Supabase](#2-setup-supabase)
  - [2a. Buat Project](#2a-buat-project)
  - [2b. Catat API Keys](#2b-catat-api-keys)
  - [2c. Jalankan Migrations](#2c-jalankan-migrations)
  - [2d. Edit Email Whitelist (Migration)](#2d-edit-email-whitelist-migration)
  - [2e. Buat Storage Bucket](#2e-buat-storage-bucket)
  - [2f. Setup Google OAuth](#2f-setup-google-oauth)
  - [2g. Tambah Redirect URL Sementara](#2g-tambah-redirect-url-sementara)
- [3. Deploy ke Vercel](#3-deploy-ke-vercel)
  - [3a. Import Project](#3a-import-project)
  - [3b. Konfigurasi Build](#3b-konfigurasi-build)
  - [3c. Tambah Environment Variables](#3c-tambah-environment-variables)
  - [3d. Deploy](#3d-deploy)
- [4. Finalisasi Supabase](#4-finalisasi-supabase)
- [5. Development Lokal (opsional)](#5-development-lokal-opsional)
- [Troubleshooting](#troubleshooting)

---

## Alur Setup

```
1. Fork repo di GitHub
         ↓
2. Setup Supabase
   (database + storage + Google OAuth)
         ↓
3. Deploy ke Vercel
   (connect repo + env vars)
         ↓
4. Finalisasi Supabase
   (update redirect URL ke domain Vercel)
         ↓
   Aplikasi live ✓
```

---

## 1. Fork Repo

1. Buka [github.com/eLsavation/wedding-tracker-web](https://github.com/eLsavation/wedding-tracker-web)
2. Klik tombol **Fork** di pojok kanan atas
3. Pilih akun GitHub tujuan → klik **Create fork**
4. Repo akan tersalin ke akun kamu dengan nama `wedding-tracker-web`

---

## 2. Setup Supabase

### 2a. Buat Project

1. Buka [supabase.com](https://supabase.com) → Login → klik **New project**
2. Pilih organisasi → isi form:
   - **Name** — bebas, mis. `wedding-tracker`
   - **Database Password** — buat password yang kuat, **simpan di tempat aman** (dibutuhkan saat push migration via CLI)
   - **Region** — pilih terdekat, mis. `Southeast Asia (Singapore)`
3. Klik **Create new project** → tunggu ~2 menit hingga status berubah menjadi **Healthy**

### 2b. Catat API Keys

1. Di Supabase Dashboard → klik **⚙️ Settings** (sidebar kiri bawah) → **API**
2. Salin dan simpan dua nilai berikut:

   | Nilai | Lokasi |
   |-------|--------|
   | **Project URL** | Bagian "Project URL" — format `https://xxxx.supabase.co` |
   | **anon / public key** | Bagian "Project API Keys" → baris `anon public` |

   > Kedua nilai ini akan digunakan di Vercel (step 3) dan `.env` lokal (step 5).

### 2c. Jalankan Migrations

Migrations membuat semua tabel, trigger, RLS policy, grants, dan data seed secara otomatis. Jalankan **berurutan dari `0001` ke `0008`** — jangan lewati satu pun.

1. Supabase Dashboard → **SQL Editor** (ikon terminal di sidebar kiri)
2. Klik **New query**
3. Buka file `supabase/migrations/0001_init.sql` dari repo → salin seluruh isinya → paste ke SQL Editor → klik **Run**
4. Pastikan muncul pesan **Success** sebelum lanjut ke file berikutnya
5. Ulangi untuk `0002`, `0003`, `0004`, `0005`, `0006`, `0007`
6. **Sebelum menjalankan `0008`**, baca langkah 2d terlebih dahulu

### 2d. Edit Email Whitelist (Migration)

File `0008_google_oauth_whitelist.sql` membatasi akses data hanya untuk email Google tertentu. Edit bagian berikut sebelum dijalankan:

```sql
select coalesce(auth.jwt() ->> 'email', '') in (
  'user1@gmail.com',  -- ← ganti dengan email Google pasangan 1
  'user2@gmail.com'   -- ← ganti dengan email Google pasangan 2
);
```

Setelah diedit, paste ke SQL Editor → klik **Run**.

### 2e. Buat Storage Bucket

Bucket ini digunakan oleh modul Moodboard untuk menyimpan gambar dan PDF.

1. Supabase Dashboard → **Storage** (ikon kotak di sidebar kiri)
2. Klik **New bucket**
3. **Bucket name**: `moodboard`
4. Aktifkan toggle **Public bucket**
5. Klik **Save**

> Policies storage (upload hanya authenticated, read public) sudah diset otomatis oleh migration `0002`.

### 2f. Setup Google OAuth

Aplikasi ini **hanya mendukung login via Google OAuth**.

**Di Google Cloud Console:**

1. Buka [console.cloud.google.com](https://console.cloud.google.com) → buat project baru atau pilih project yang ada
2. Masuk ke project → **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → **Create**
   - Isi **App name** (mis. `Wedding Tracker`), **User support email**, **Developer contact email**
   - Klik **Save and Continue** hingga selesai
3. Masuk ke **Credentials** → klik **+ Create Credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Di bagian **Authorized redirect URIs** → klik **Add URI** → isi:
   ```
   https://xxxxxxxxxxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   Ganti dengan **Project URL** kamu dari langkah 2b.
6. Klik **Create** → catat **Client ID** dan **Client Secret** yang muncul

**Di Supabase:**

1. Authentication → tab **Providers** → pilih **Google**
2. Aktifkan toggle **Enable Google provider**
3. Isi **Client ID** dan **Client Secret** dari langkah sebelumnya
4. Klik **Save**

### 2g. Tambah Redirect URL Sementara

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Redirect URLs** → klik **Add URL** → tambahkan:
   ```
   http://localhost:5173/**
   ```
3. Klik **Save**

> URL production Vercel akan ditambahkan setelah deploy selesai (step 4).

---

## 3. Deploy ke Vercel

### 3a. Import Project

1. Buka [vercel.com/new](https://vercel.com/new) → login dengan akun GitHub
2. Di bagian **Import Git Repository**, cari `wedding-tracker-web` → klik **Import**

### 3b. Konfigurasi Build

Di halaman konfigurasi, pastikan nilai berikut sudah benar (biasanya sudah auto-detected):

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `.` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3c. Tambah Environment Variables

Expand bagian **Environment Variables** → tambahkan tiga variabel berikut:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxxxxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_ALLOWED_EMAILS` | `user1@gmail.com,user2@gmail.com` |

> - `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` — salin dari langkah 2b
> - `VITE_ALLOWED_EMAILS` — isi dengan email Google yang diizinkan, pisahkan dengan koma tanpa spasi

### 3d. Deploy

1. Klik **Deploy**
2. Tunggu ~1–2 menit hingga muncul layar **Congratulations!**
3. Catat domain yang diberikan, mis. `https://wedding-tracker-web-abc123.vercel.app`

---

## 4. Finalisasi Supabase

Setelah mendapat domain Vercel, update konfigurasi URL di Supabase:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL** → ganti ke:
   ```
   https://wedding-tracker-web-abc123.vercel.app
   ```
3. **Redirect URLs** → klik **Add URL** → tambahkan:
   ```
   https://wedding-tracker-web-abc123.vercel.app/**
   ```
4. Klik **Save**

**Verifikasi akhir** — buka domain Vercel di browser:
- [ ] Halaman login muncul dengan tombol "Masuk dengan Google"
- [ ] Bisa login dengan akun Google yang emailnya terdaftar di whitelist
- [ ] Dashboard menampilkan data
- [ ] Semua menu di sidebar bisa diakses
- [ ] Modul Moodboard bisa upload file

---

## 5. Development Lokal (opsional)

Untuk pengembangan atau modifikasi di komputer lokal.

**Prerequisites:** Node.js 18+ dan npm

```bash
# Clone repo (ganti <username> dengan akun GitHub kamu)
git clone https://github.com/<username>/wedding-tracker-web.git
cd wedding-tracker-web

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `.env` dengan nilai yang sesuai:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ALLOWED_EMAILS=user1@gmail.com,user2@gmail.com
```

```bash
# Jalankan development server
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173)

> `.env` sudah ada di `.gitignore` — tidak akan ter-commit ke GitHub.

**Push migration via CLI (opsional, alternatif SQL Editor manual):**

```bash
# Login ke Supabase
npx supabase login

# Link ke project (project-ref ada di URL dashboard supabase.com/dashboard/project/<ref>)
npx supabase link --project-ref <project-ref>

# Push semua migration sekaligus
npx supabase db push
```

---

## Troubleshooting

**Login gagal — muncul "Akses ditolak"**

Email Google yang dipakai login tidak ada di whitelist. Pastikan email tersebut sudah ditambahkan di:
- `VITE_ALLOWED_EMAILS` di Vercel Environment Variables (untuk production) atau `.env` (untuk lokal)
- Function `is_allowed_user()` di Supabase — jalankan ulang migration `0008` dengan email yang sudah diupdate

**Redirect setelah login kembali ke halaman kosong**

URL redirect belum ditambahkan di Supabase. Pastikan sudah menambahkan URL yang sesuai di Authentication → URL Configuration → Redirect URLs:
- Lokal: `http://localhost:5173/**`
- Production: `https://<domain-vercel>.vercel.app/**`

**Moodboard tidak bisa upload**

Pastikan storage bucket `moodboard` sudah dibuat dan opsi **Public bucket** diaktifkan (langkah 2e). Cek juga bahwa migration `0002` sudah dijalankan.

**Build gagal di Vercel**

Pastikan ketiga environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ALLOWED_EMAILS`) sudah diisi dengan benar di Vercel Dashboard → Project → Settings → Environment Variables. Setelah mengubah env vars, trigger redeploy manual dari tab Deployments.
