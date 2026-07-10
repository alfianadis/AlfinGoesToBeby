-- ============================================================
-- kontak  (important contacts: vendor, panitia, keluarga)
-- ============================================================
create table kontak (
  id          uuid primary key default gen_random_uuid(),
  nama        text not null,
  peran       text,            -- mis. "WO", "MUA", "Penghulu", "Panitia"
  telepon     text,
  kategori    text,            -- mis. "Vendor", "Keluarga", "Panitia"
  catatan     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_kontak_updated before update on kontak
  for each row execute function set_updated_at();

alter table kontak enable row level security;

create policy "authenticated_all" on kontak
  for all to authenticated
  using (true) with check (true);

grant select, insert, update, delete on public.kontak to authenticated;
