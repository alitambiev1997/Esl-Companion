insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content',
  'content',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;