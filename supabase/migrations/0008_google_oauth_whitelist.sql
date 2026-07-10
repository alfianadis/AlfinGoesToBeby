-- ============================================================
-- Replace open authenticated policies with email whitelist.
-- Only whitelisted emails can access data.
-- Edit the email list below to match your users.
-- ============================================================

create or replace function public.is_allowed_user()
returns boolean
language sql stable security definer
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'user1@example.com',  -- ganti dengan email pasangan 1
    'user2@example.com'   -- ganti dengan email pasangan 2
  );
$$;

-- Drop old policies and create whitelist policies
do $$
declare
  t text;
begin
  foreach t in array array[
    'config', 'kategori', 'vendor', 'transaksi', 'checklist',
    'seserahan', 'kua', 'moodboard', 'tamu', 'rundown', 'notes', 'kontak'
  ]
  loop
    execute format('drop policy if exists "authenticated_all" on %I;', t);
    execute format(
      'create policy "whitelist_only" on %I
         for all to authenticated
         using (public.is_allowed_user())
         with check (public.is_allowed_user());', t);
  end loop;
end;
$$;
