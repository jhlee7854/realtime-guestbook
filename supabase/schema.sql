create extension if not exists "pgcrypto";

create table if not exists public.guestbook_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null check (char_length(trim(author_name)) > 0 and char_length(author_name) <= 40),
  message text not null check (char_length(trim(message)) > 0 and char_length(message) <= 240),
  image_url text not null,
  image_type text not null check (image_type in ('upload', 'drawing')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.guestbook_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null check (char_length(trim(author_name)) > 0 and char_length(author_name) <= 40),
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 180),
  created_at timestamptz not null default now()
);

alter table public.guestbook_posts
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.comments
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists guestbook_posts_created_at_idx on public.guestbook_posts(created_at desc);
create index if not exists guestbook_posts_user_id_created_at_idx on public.guestbook_posts(user_id, created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_created_at_idx on public.comments(created_at asc);
create index if not exists comments_user_id_created_at_idx on public.comments(user_id, created_at desc);

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

drop policy if exists "Anyone can read guestbook posts" on public.guestbook_posts;
drop policy if exists "Anyone can create guestbook posts" on public.guestbook_posts;
drop policy if exists "Authenticated users can create guestbook posts" on public.guestbook_posts;
drop policy if exists "Anyone can read comments" on public.comments;
drop policy if exists "Anyone can create comments" on public.comments;
drop policy if exists "Authenticated users can create comments" on public.comments;

create policy "Anyone can read guestbook posts"
  on public.guestbook_posts for select
  using (true);

create policy "Authenticated users can create guestbook posts"
  on public.guestbook_posts for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Anyone can read comments"
  on public.comments for select
  using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  to authenticated
  with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('guestbook-images', 'guestbook-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone can read guestbook images" on storage.objects;
drop policy if exists "Anyone can upload guestbook images" on storage.objects;
drop policy if exists "Authenticated users can upload own guestbook images" on storage.objects;

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
