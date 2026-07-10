-- ============================================================
-- Wedding Tracker - Initial schema
-- Mirrors the original Google Apps Script (Sheets) data model.
-- Security model: 2 users, sign up disabled. Any authenticated
-- user has full access; anon has none (enforced via RLS).
-- ============================================================

-- Helpers --------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- Auto-update updated_at on row change
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- config  (key/value settings)
-- ============================================================
create table config (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

insert into config (key, value) values
  ('tanggal_pernikahan', '2027-03-15'),
  ('nama_pasangan_1',    'Andi'),
  ('nama_pasangan_2',    'Rina'),
  ('nama_app',           'Wedding Tracker');

-- ============================================================
-- kategori  (budget categories)
-- ============================================================
create table kategori (
  id              uuid primary key default gen_random_uuid(),
  nama            text not null unique,
  budget_rencana  numeric not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_kategori_updated before update on kategori
  for each row execute function set_updated_at();

insert into kategori (nama) values
  ('Venue'), ('Catering'), ('Dekorasi'), ('Busana'),
  ('Dokumentasi'), ('Undangan'), ('MUA'), ('Entertainment'),
  ('Souvenir'), ('Lain-lain');

-- ============================================================
-- vendor
-- ============================================================
create table vendor (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  kategori    text,
  kontak      text,
  harga_deal  numeric not null default 0,
  status      text not null default 'kandidat'
              check (status in ('kandidat', 'deal', 'lunas')),
  dp_dibayar  numeric not null default 0,
  sisa        numeric generated always as (greatest(0, harga_deal - dp_dibayar)) stored,
  catatan     text,
  link        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_vendor_updated before update on vendor
  for each row execute function set_updated_at();

-- ============================================================
-- transaksi  (financial transactions)
-- ============================================================
create table transaksi (
  id            uuid primary key default gen_random_uuid(),
  tanggal       date,
  tipe          text not null check (tipe in ('pemasukan', 'pengeluaran')),
  kategori      text,
  deskripsi     text,
  jumlah        numeric not null default 0,
  dibayar_oleh  text,
  vendor_id     uuid references vendor(id) on delete set null,
  catatan       text,
  created_by    uuid references auth.users(id) default auth.uid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_transaksi_vendor on transaksi(vendor_id);
create index idx_transaksi_kategori on transaksi(kategori);

create trigger trg_transaksi_updated before update on transaksi
  for each row execute function set_updated_at();

-- Recalculate vendor.dp_dibayar from related pengeluaran transactions,
-- and auto-set status to 'lunas' when fully paid. Mirrors GAS updateVendorDp().
create or replace function recalc_vendor_dp(p_vendor_id uuid)
returns void
language plpgsql
as $$
declare
  v_total numeric;
  v_harga numeric;
begin
  if p_vendor_id is null then
    return;
  end if;

  select coalesce(sum(jumlah), 0) into v_total
  from transaksi
  where vendor_id = p_vendor_id and tipe = 'pengeluaran';

  select harga_deal into v_harga from vendor where id = p_vendor_id;

  update vendor
  set dp_dibayar = v_total,
      status = case
                 when v_harga > 0 and (v_harga - v_total) <= 0 then 'lunas'
                 else status
               end
  where id = p_vendor_id;
end;
$$;

create or replace function trg_transaksi_vendor_dp()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'DELETE') then
    perform recalc_vendor_dp(old.vendor_id);
    return old;
  end if;

  -- INSERT or UPDATE
  perform recalc_vendor_dp(new.vendor_id);
  -- if vendor changed on update, recalc the old vendor too
  if (tg_op = 'UPDATE' and old.vendor_id is distinct from new.vendor_id) then
    perform recalc_vendor_dp(old.vendor_id);
  end if;
  return new;
end;
$$;

create trigger trg_transaksi_dp
  after insert or update or delete on transaksi
  for each row execute function trg_transaksi_vendor_dp();

-- ============================================================
-- checklist
-- ============================================================
create table checklist (
  id          uuid primary key default gen_random_uuid(),
  task        text not null,
  kategori    text,
  deadline    date,
  pic         text,
  status      text not null default 'belum'
              check (status in ('belum', 'proses', 'selesai')),
  catatan     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_checklist_updated before update on checklist
  for each row execute function set_updated_at();

-- ============================================================
-- seserahan
-- ============================================================
create table seserahan (
  id          uuid primary key default gen_random_uuid(),
  kategori    text,
  item        text not null,
  brand       text,
  status      text not null default 'rencana'
              check (status in ('rencana', 'sudah dibeli')),
  harga       numeric not null default 0,
  link        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_seserahan_updated before update on seserahan
  for each row execute function set_updated_at();

-- ============================================================
-- kua  (marriage document requirements)
-- ============================================================
create table kua (
  id          uuid primary key default gen_random_uuid(),
  syarat      text not null,
  status_cpp  boolean not null default false,
  status_cpw  boolean not null default false,
  catatan     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_kua_updated before update on kua
  for each row execute function set_updated_at();

-- ============================================================
-- moodboard  (uses Supabase Storage instead of Google Drive)
-- ============================================================
create table moodboard (
  id          uuid primary key default gen_random_uuid(),
  judul       text,
  storage_path text,            -- path in the 'moodboard' storage bucket
  file_url    text,             -- public/signed URL
  mime        text,
  ukuran      bigint default 0,
  created_by  uuid references auth.users(id) default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_moodboard_updated before update on moodboard
  for each row execute function set_updated_at();

-- ============================================================
-- tamu  (guest list)
-- ============================================================
create table tamu (
  id              uuid primary key default gen_random_uuid(),
  nama            text not null,
  relasi          text,
  jumlah_orang    integer not null default 1,
  status_undangan text not null default 'belum'
                  check (status_undangan in ('belum', 'terkirim', 'hadir', 'tidak hadir')),
  catatan         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger trg_tamu_updated before update on tamu
  for each row execute function set_updated_at();

-- ============================================================
-- rundown  (event schedule)
-- ============================================================
create table rundown (
  id            uuid primary key default gen_random_uuid(),
  acara         text not null,
  waktu_mulai   text,   -- HH:mm
  waktu_selesai text,   -- HH:mm
  lokasi        text,
  pic           text,
  catatan       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_rundown_updated before update on rundown
  for each row execute function set_updated_at();

-- ============================================================
-- notes
-- ============================================================
create table notes (
  id          uuid primary key default gen_random_uuid(),
  judul       text not null,
  isi         text,
  link        text,
  created_by  uuid references auth.users(id) default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_notes_updated before update on notes
  for each row execute function set_updated_at();

-- ============================================================
-- Row Level Security
-- All tables: only authenticated users may read/write.
-- Sign up is disabled in the dashboard, so only the 2 created
-- users can authenticate.
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'config', 'kategori', 'vendor', 'transaksi', 'checklist',
    'seserahan', 'kua', 'moodboard', 'tamu', 'rundown', 'notes'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy "authenticated_all" on %I
         for all to authenticated
         using (true) with check (true);', t);
  end loop;
end;
$$;
