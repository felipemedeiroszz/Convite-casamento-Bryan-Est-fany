-- Create storage bucket for wedding images
insert into storage.buckets (id, name, public)
values ('wedding-images', 'wedding-images', true)
on conflict (id) do nothing;

-- Create storage bucket for gallery photos
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Allow public access to wedding-images bucket
create policy "Public read access for wedding-images"
on storage.objects for select
to public
using (bucket_id = 'wedding-images');

create policy "Public upload for wedding-images"
on storage.objects for insert
to public
with check (bucket_id = 'wedding-images');

-- Allow public access to gallery bucket
create policy "Public read access for gallery"
on storage.objects for select
to public
using (bucket_id = 'gallery');

create policy "Public upload for gallery"
on storage.objects for insert
to public
with check (bucket_id = 'gallery');
