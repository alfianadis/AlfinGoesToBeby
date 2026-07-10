-- ============================================================
-- Storage policies for the 'moodboard' bucket.
-- Bucket is public (read via public URL). Only authenticated
-- users may upload/update/delete objects.
-- ============================================================

create policy "moodboard_auth_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'moodboard');

create policy "moodboard_auth_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'moodboard')
  with check (bucket_id = 'moodboard');

create policy "moodboard_auth_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'moodboard');

create policy "moodboard_public_read"
  on storage.objects for select to public
  using (bucket_id = 'moodboard');
