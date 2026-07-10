# Dokumentasi Teknis — Wedding Tracker

Dokumen ini berisi panduan lengkap arsitektur, konvensi, dan pola yang digunakan di project ini. Dibuat agar AI coding assistant (atau developer baru) bisa langsung produktif tanpa perlu membaca seluruh source code.

---

## 1. Arsitektur Overview

```
┌─────────────────────────────────────────────────────┐
│  Browser (React SPA + Service Worker/PWA)           │
│  ├── React 19 + TypeScript (strict)                 │
│  ├── Tailwind CSS v4 + shadcn/ui (Nova preset)      │
│  ├── React Router v6 (BrowserRouter, flat routes)   │
│  └── @supabase/supabase-js (client SDK)             │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS (anon key + JWT)
┌─────────────────────▼───────────────────────────────┐
│  Supabase (hosted PostgreSQL + GoTrue + Storage)    │
│  ├── Auth: 2 users, sign-up disabled                │
│  ├── PostgREST: auto-generated REST API             │
│  ├── RLS: policy "authenticated_all" on all tables  │
│  ├── Triggers: recalc_vendor_dp, set_updated_at     │
│  └── Storage: bucket "moodboard" (public read)      │
└─────────────────────────────────────────────────────┘
```

**Tidak ada backend custom.** Semua logic ada di:
- Frontend (React) untuk UI + business rules ringan
- Database (triggers, generated columns, RLS) untuk data integrity

---

## 2. Konvensi & Patterns

### 2.1 File Naming

| Jenis | Pattern | Contoh |
|-------|---------|--------|
| Page component | `PascalCase + Page` | `KeuanganPage.tsx` |
| Shared component | `PascalCase` | `StatCard.tsx`, `CurrencyInput.tsx` |
| Hook | `camelCase` (use prefix) | `useCollection.ts`, `useConfig.ts` |
| Utility | `camelCase` | `format.ts`, `supabase.ts` |
| Type definitions | `types.ts` (single file) | `src/lib/types.ts` |
| shadcn UI | lowercase (vendored) | `src/components/ui/button.tsx` |

### 2.2 Folder Structure

```
src/
├── components/       # Shared components (non-page-specific)
│   ├── ui/           # shadcn/ui vendored components (DO NOT manually edit)
│   └── *.tsx         # App shared components
├── hooks/            # Custom React hooks
├── lib/              # Utilities, config, types
├── pages/            # Route page components (one per menu)
├── App.tsx           # Router definition
├── main.tsx          # Entry point
└── index.css         # Tailwind directives + theme tokens
```

### 2.3 Supabase & Data Access

**Singleton client:** `src/lib/supabase.ts`

**Generic CRUD hook:** `src/hooks/useCollection.ts`
```typescript
const { rows, loading, insert, update, remove, refetch } = useCollection<Vendor>('vendor', {
  orderBy: 'created_at',
  ascending: true,
})
```
- `insert(values)` → returns `boolean`
- `update(id, values)` → optimistic update + refetch
- `remove(id)` → delete + refetch
- Semua menampilkan toast otomatis (success/error)
- `loading` hanya `true` pada initial fetch

**Direct queries** (untuk aggregates, multi-table joins):
```typescript
const { data } = await supabase.from('transaksi').select('tipe, jumlah')
```

### 2.4 Page Component Pattern

Semua page mengikuti pola yang sama:

```tsx
export function NamaPage() {
  // 1. useCollection hook (primary data)
  // 2. useState untuk dialog/form/delete
  // 3. useMemo untuk computed values (stats, grouped, sorted)
  // 4. Form handlers (openCreate, openEdit, handleSubmit)
  
  return (
    <div className="space-y-8">
      {/* PageHeader: title, description, action button */}
      {/* StatCards: 2-4 metric cards */}
      {/* Main content: Card with Table/List/Grid */}
      {/* Dialog: form for create/edit */}
      {/* ConfirmDialog: delete confirmation */}
    </div>
  )
}
```

### 2.5 Form Pattern

```tsx
const emptyForm = { field1: '', field2: '' }
const [form, setForm] = useState(emptyForm)
const [editing, setEditing] = useState<Type | null>(null)
const [dialogOpen, setDialogOpen] = useState(false)

// Create
function openCreate() {
  setEditing(null)
  setForm(emptyForm)
  setDialogOpen(true)
}

// Edit
function openEdit(item: Type) {
  setEditing(item)
  setForm({ field1: item.field1, ... })
  setDialogOpen(true)
}

// Submit (handles both create & edit)
async function handleSubmit() {
  const payload = { ... }
  const ok = editing ? await update(editing.id, payload) : await insert(payload)
  if (ok) setDialogOpen(false)
}
```

### 2.6 Currency Input

Gunakan `<CurrencyInput>` untuk semua input uang:
```tsx
<CurrencyInput
  value={form.jumlah}        // raw digit string: "1000000"
  onChange={(v) => setForm(f => ({ ...f, jumlah: v }))}
/>
```
- Otomatis format ribuan: `1.000.000`
- Prefix "Rp" di kiri
- Simpan raw digit, `Number(form.jumlah)` saat submit

### 2.7 Styling Rules

- **Tailwind utility-first** — tidak ada custom CSS kecuali di `index.css` (theme tokens)
- **cn() utility** dari shadcn untuk conditional classes
- **Spacing:** `space-y-8` antara section utama, `space-y-4` atau `gap-4` untuk grid
- **Max width:** content dibatasi `max-w-6xl mx-auto` (di AppLayout)
- **Action buttons:** SELALU visible (bukan hover-reveal), ukuran `size-8`
- **StatCard:** untuk metric summary di atas page
- **StatusBadge:** untuk status label berwarna (tones: neutral/rose/amber/green/blue/red)
- **EmptyState:** saat data kosong (icon + title + description + action)
- **Skeleton:** saat loading

### 2.8 Toast Notifications

Pakai `sonner` via `toast` import:
```typescript
import { toast } from 'sonner'
toast.success('Berhasil')
toast.error('Gagal: ...')
```
`useCollection` sudah handle toast otomatis, tidak perlu manual kecuali kasus khusus.

---

## 3. Database Schema Detail

### 3.1 Tabel & Relasi

```
config (key PK)
kategori (id UUID PK, nama UNIQUE)
vendor (id UUID PK, kategori → text match kategori.nama)
transaksi (id UUID PK, vendor_id → vendor.id FK, kategori → text, created_by → auth.users.id)
checklist (id UUID PK)
seserahan (id UUID PK)
kua (id UUID PK)
moodboard (id UUID PK, created_by → auth.users.id)
tamu (id UUID PK)
rundown (id UUID PK)
notes (id UUID PK, created_by → auth.users.id)
kontak (id UUID PK)
```

### 3.2 Generated Columns & Triggers

**`vendor.sisa`** — generated column:
```sql
sisa numeric GENERATED ALWAYS AS (greatest(0, harga_deal - dp_dibayar)) STORED
```

**`recalc_vendor_dp`** — after trigger on `transaksi`:
- Saat transaksi insert/update/delete → hitung ulang total pengeluaran per vendor
- Update `vendor.dp_dibayar` dan set status = 'lunas' jika sudah lunas
- Jaga agar manual edit `dp_dibayar` via form juga bisa (tidak di-overwrite kalau tidak ada transaksi terkait)

**`set_updated_at`** — before update trigger di semua tabel

### 3.3 Enum / Check Constraints

| Tabel | Kolom | Values |
|-------|-------|--------|
| vendor | status | `kandidat`, `deal`, `lunas` |
| transaksi | tipe | `pemasukan`, `pengeluaran` |
| checklist | status | `belum`, `proses`, `selesai` |
| seserahan | status | `rencana`, `sudah dibeli` |
| tamu | status_undangan | `belum`, `terkirim`, `hadir`, `tidak hadir` |
| tamu | pihak | `CPP`, `CPW`, `Bersama` |

### 3.4 RLS Policy

Semua tabel menggunakan whitelist policy via function `is_allowed_user()`:
```sql
CREATE POLICY "whitelist_only" ON <table>
  FOR ALL TO authenticated
  USING (public.is_allowed_user())
  WITH CHECK (public.is_allowed_user());
```
Akses hanya diberikan ke email yang terdaftar di function `is_allowed_user()` (migration `0008`). Sign-up disabled.

### 3.5 Storage

- Bucket: `moodboard`
- Public read (images bisa diakses tanpa auth via public URL)
- Write/delete: hanya authenticated
- Path pattern: `{uuid}.{ext}` (random UUID per file)
- Max size: 10MB
- Allowed MIME: image/*, application/pdf

---

## 4. Routing

Semua route ada di `src/App.tsx`:

```
/login          → LoginPage (public)
/               → DashboardPage
/keuangan       → KeuanganPage
/vendor         → VendorPage
/kategori       → KategoriPage
/checklist      → ChecklistPage
/seserahan      → SeserahanPage
/kua            → KuaPage
/moodboard      → MoodboardPage
/tamu           → TamuPage
/rundown        → RundownPage
/notes          → NotesPage
/kontak         → KontakPage
```

Protected via `<ProtectedRoute>` wrapper → redirect ke `/login` jika belum auth.

---

## 5. AppLayout & Navigation

Sidebar navigation didefinisikan di `src/components/AppLayout.tsx` sebagai `NAV_GROUPS`:

```typescript
const NAV_GROUPS: NavGroup[] = [
  { label: 'Ringkasan', items: [Dashboard] },
  { label: 'Anggaran', items: [Keuangan, Vendor, Kategori] },
  { label: 'Persiapan', items: [Checklist, Seserahan, KUA, Moodboard] },
  { label: 'Acara', items: [Tamu, Rundown, Catatan, Kontak Penting] },
]
```

**Menambah menu baru:**
1. Buat page di `src/pages/NamaPage.tsx`
2. Tambah route di `App.tsx`
3. Tambah entry di `NAV_GROUPS` di `AppLayout.tsx` (import icon dari lucide-react)

---

## 6. Auth Flow

1. User buka app → `AuthProvider` cek session via `supabase.auth.getSession()`
2. Tidak ada session → redirect ke `/login`
3. Login form submit → `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. Redirect ke Google → user pilih akun → redirect balik ke app
5. `onAuthStateChange` menangkap session baru → cek email via `ALLOWED_EMAILS` (dari `VITE_ALLOWED_EMAILS`)
6. Email tidak terdaftar → `signOut()` otomatis + tampilkan pesan "Akses ditolak"
7. Email terdaftar → session disimpan, redirect ke `/`
8. Logout → `supabase.auth.signOut()` → redirect ke `/login`

---

## 7. PWA Configuration

Didefinisikan di `vite.config.ts` via `vite-plugin-pwa`:
- **Strategy:** `generateSW` (auto-generated service worker)
- **Register type:** `autoUpdate` (update tanpa prompt)
- **Precache:** semua static assets (JS, CSS, HTML, SVG, WOFF2)
- **Runtime cache:** Supabase API (`NetworkFirst`, max 50 entries, 5 min TTL)
- **Manifest:** name, icons, theme_color, display: standalone

---

## 8. Design Tokens (Theme)

Didefinisikan di `src/index.css` `:root` block. Primary colors:

| Token | Value (oklch) | Deskripsi |
|-------|---------------|-----------|
| --primary | 0.47 0.13 12 | Warm rose/wine |
| --background | 0.992 0.004 60 | Warm off-white |
| --muted | 0.966 0.008 55 | Light warm gray |
| --destructive | 0.577 0.245 27 | Red for errors |

Prefix warna: bukan gray murni, melainkan warm-tinted (hue 25-60) agar kohesif dengan primary wine.

---

## 9. Dependencies (Key Packages)

| Package | Versi | Fungsi |
|---------|-------|--------|
| react | 19.x | UI framework |
| @supabase/supabase-js | latest | Supabase client |
| react-router-dom | 6.x | Client-side routing |
| tailwindcss | 4.x | CSS framework |
| @tailwindcss/vite | 4.x | Tailwind Vite plugin |
| radix-ui | 1.x | Headless UI primitives (via shadcn) |
| lucide-react | latest | Icon library |
| sonner | 2.x | Toast notifications |
| class-variance-authority | 0.7 | Component variants |
| vite-plugin-pwa | 1.x | PWA/Service Worker |

---

## 10. Cara Menambah Modul Baru

### Step-by-step:

1. **Buat tabel** di `supabase/migrations/000X_nama.sql`:
   ```sql
   create table nama (...);
   create trigger trg_nama_updated before update on nama for each row execute function set_updated_at();
   alter table nama enable row level security;
   create policy "authenticated_all" on nama for all to authenticated using (true) with check (true);
   grant select, insert, update, delete on public.nama to authenticated;
   ```

2. **Push migration:** `npx supabase db push -p <password>`

3. **Tambah type** di `src/lib/types.ts`

4. **Buat page** di `src/pages/NamaPage.tsx` (ikuti pattern existing: PageHeader + Stats + Content + Dialog + ConfirmDialog)

5. **Tambah route** di `src/App.tsx`

6. **Tambah nav item** di `src/components/AppLayout.tsx` (import icon, tambah ke NAV_GROUPS)

7. **Build & verify:** `npm run build`

---

## 11. Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| "permission denied for table X" | Grants belum diberikan | Jalankan `GRANT SELECT, INSERT, UPDATE, DELETE ON public.X TO authenticated;` |
| Data tidak muncul setelah login | RLS blocking | Pastikan policy `authenticated_all` ada di tabel |
| Upload moodboard gagal | Storage policy | Cek policy `moodboard_auth_insert` di storage.objects |
| Build error "unused import" | TypeScript strict mode | Hapus import yang tidak dipakai |
| `useCollection` insert/update type error | Supabase strict generics | Gunakan `values as any` cast (sudah ada) |

---

## 12. Environment & Deploy

### Local Dev
```bash
npm install
cp .env.example .env  # isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ALLOWED_EMAILS
npm run dev
```

### Vercel Deploy
- Framework: Vite
- Build command: `npm run build`
- Output: `dist`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ALLOWED_EMAILS`
- Post-deploy: tambahkan Vercel URL ke Supabase Auth → URL Configuration → Redirect URLs

### Supabase Project
- Region: Asia Pacific (Singapore) — disarankan
- Auth: Google OAuth only, sign-up disabled
- Email whitelist: set via `VITE_ALLOWED_EMAILS` (env) + migration `0008` (RLS)

Lihat [INSTALLATION.md](../INSTALLATION.md) untuk panduan setup lengkap.
