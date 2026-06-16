-- Manual migration for Supabase Auth authorization changes.
--
-- Apply this in the Supabase SQL Editor for the remote project.
-- It is idempotent for the current remote state checked on 2026-06-10.
-- It preserves existing anonymous guestbook data by keeping user_id nullable.

begin;

create extension if not exists "pgcrypto";

alter table public.guestbook_posts
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.comments
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists guestbook_posts_user_id_created_at_idx
  on public.guestbook_posts(user_id, created_at desc);

create index if not exists comments_user_id_created_at_idx
  on public.comments(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_guestbook_posts_updated_at on public.guestbook_posts;
create trigger set_guestbook_posts_updated_at
before update on public.guestbook_posts
for each row execute function public.set_updated_at();

alter table public.guestbook_posts enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Anyone can create guestbook posts" on public.guestbook_posts;
drop policy if exists "Authenticated users can create guestbook posts" on public.guestbook_posts;

create policy "Authenticated users can create guestbook posts"
  on public.guestbook_posts for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Anyone can create comments" on public.comments;
drop policy if exists "Authenticated users can create comments" on public.comments;

create policy "Authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Anyone can read guestbook posts" on public.guestbook_posts;
create policy "Anyone can read guestbook posts"
  on public.guestbook_posts for select
  using (true);

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments"
  on public.comments for select
  using (true);

insert into storage.buckets (id, name, public)
values ('guestbook-images', 'guestbook-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can read guestbook images" on storage.objects;
drop policy if exists "Anyone can upload guestbook images" on storage.objects;
drop policy if exists "Authenticated users can upload own guestbook images" on storage.objects;

-- Policies found in the current remote project from Dashboard-created Storage setup.
drop policy if exists "Allow anonymous upload f7olc4_0" on storage.objects;
drop policy if exists "Allow anonymous upload f7olc4_1" on storage.objects;

create policy "Anyone can read guestbook images"
  on storage.objects for select
  using (bucket_id = 'guestbook-images');

create policy "Authenticated users can upload own guestbook images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'guestbook-images'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
    and ((storage.foldername(name))[3] = 'uploads' or (storage.foldername(name))[3] = 'drawings')
  );

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'guestbook_posts'
    ) then
      alter publication supabase_realtime add table public.guestbook_posts;
    end if;

    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'comments'
    ) then
      alter publication supabase_realtime add table public.comments;
    end if;
  end if;
end $$;

commit;

-- Verification queries.
-- Run these after the migration and confirm the result matches the comments.

select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('guestbook_posts', 'comments')
  and column_name = 'user_id'
order by table_name;
-- Expected: comments.user_id and guestbook_posts.user_id, both nullable uuid.

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in ('guestbook_posts', 'comments', 'objects')
  and (
    policyname like '%guestbook%'
    or policyname like '%comments%'
    or policyname like '%images%'
  )
order by schemaname, tablename, policyname;
-- Expected: public read policies, authenticated insert policies, authenticated own image upload policy.

select
  schemaname,
  tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and schemaname = 'public'
  and tablename in ('guestbook_posts', 'comments')
order by tablename;
-- Expected: comments and guestbook_posts.

select
  id,
  name,
  public
from storage.buckets
where id = 'guestbook-images';
-- Expected: public = true.

-- Optional security follow-up for the unused learning table.
-- The app does not use public.guestbook. If it should remain unused, decide whether to
-- enable RLS with explicit policies or remove the table after confirming it is not needed.
-- Do not run this blindly if you still use the table for learning experiments.
--
-- alter table public.guestbook enable row level security;
