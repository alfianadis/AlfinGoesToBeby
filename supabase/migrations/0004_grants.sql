-- ============================================================
-- Grant table privileges to the 'authenticated' role.
-- Required because "auto-expose new tables" was disabled at
-- project creation: RLS policies alone are not enough — PostgREST
-- also needs underlying SQL grants. Access is still restricted by
-- the RLS policies (authenticated-only) defined in 0001_init.sql.
-- ============================================================

grant usage on schema public to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'config', 'kategori', 'vendor', 'transaksi', 'checklist',
    'seserahan', 'kua', 'moodboard', 'tamu', 'rundown', 'notes'
  ]
  loop
    execute format(
      'grant select, insert, update, delete on public.%I to authenticated;',
      t
    );
  end loop;
end;
$$;

-- Future-proof: default privileges for any new tables/sequences
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
