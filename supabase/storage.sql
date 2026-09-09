-- Create storage bucket for wedding images
insert into storage.buckets (id, name, public)
values ('wedding-images', 'wedding-images', true)
on conflict (id) do nothing;

-- Create storage bucket for gallery photos
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Create storage bucket for gift/product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gift-images',
  'gift-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']::text[]
)
on conflict (id) do nothing;

-- Allow public access to wedding-images bucket
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Public read access for wedding-images') then
    create policy "Public read access for wedding-images"
    on storage.objects for select
    to public
    using (bucket_id = 'wedding-images');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Public upload for wedding-images') then
    create policy "Public upload for wedding-images"
    on storage.objects for insert
    to public
    with check (bucket_id = 'wedding-images');
  end if;
end $$;

-- Allow public access to gallery bucket
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Public read access for gallery') then
    create policy "Public read access for gallery"
    on storage.objects for select
    to public
    using (bucket_id = 'gallery');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Public upload for gallery') then
    create policy "Public upload for gallery"
    on storage.objects for insert
    to public
    with check (bucket_id = 'gallery');
  end if;
end $$;

-- Allow public access to gift-images bucket
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Public read access for gift-images') then
    create policy "Public read access for gift-images"
    on storage.objects for select
    to public
    using (bucket_id = 'gift-images');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'objects' and policyname = 'Public upload for gift-images') then
    create policy "Public upload for gift-images"
    on storage.objects for insert
    to public
    with check (bucket_id = 'gift-images');
  end if;
end $$;
