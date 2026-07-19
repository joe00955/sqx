-- SquashX Rally — initial schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) once your project is created.

create extension if not exists "pgcrypto";

-- ── Courts ──────────────────────────────────────────────────────────
create table if not exists courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null
);

create table if not exists court_bookable_slots (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  day text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  start_time time not null,
  end_time time not null
);

-- ── Profiles (one per auth user) ───────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  bio text not null default '',
  skill_level numeric not null default 3.0,
  home_court_id uuid references courts(id),
  avatar_url text,
  competitive_elo integer not null default 1400,
  casual_games_played integer not null default 0,
  latitude double precision,
  longitude double precision,
  contact_email text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  verification_video_path text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists availability_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  day text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  start_time time not null,
  end_time time not null,
  active boolean not null default true
);

-- ── Communities ─────────────────────────────────────────────────────
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  meetup_note text not null default '',
  vibe text not null check (vibe in ('Casual','Competitive','Mixed'))
);

create table if not exists community_members (
  community_id uuid not null references communities(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

-- ── Match requests ──────────────────────────────────────────────────
create table if not exists match_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references profiles(id) on delete cascade,
  to_user_id uuid not null references profiles(id) on delete cascade,
  mode text not null check (mode in ('casual','competitive')),
  day text not null check (day in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  start_time time not null,
  end_time time not null,
  court_id uuid references courts(id),
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────
alter table courts enable row level security;
alter table court_bookable_slots enable row level security;
alter table profiles enable row level security;
alter table availability_slots enable row level security;
alter table communities enable row level security;
alter table community_members enable row level security;
alter table match_requests enable row level security;

-- Public read-only reference data
create policy "courts are viewable by everyone" on courts for select using (true);
create policy "court slots are viewable by everyone" on court_bookable_slots for select using (true);
create policy "communities are viewable by everyone" on communities for select using (true);

-- Profiles: anyone signed in can browse basic profile info; only the owner can edit
create policy "profiles are viewable by authenticated users" on profiles
  for select using (auth.role() = 'authenticated');
create policy "users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- security definer avoids RLS recursion when a profiles policy checks profiles.is_admin
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select is_admin from profiles where id = uid), false);
$$;

create policy "admins can update any profile" on profiles
  for update using (public.is_admin(auth.uid()));

-- Availability: readable by anyone signed in (needed for matching), writable only by the owner
create policy "availability is viewable by authenticated users" on availability_slots
  for select using (auth.role() = 'authenticated');
create policy "users manage their own availability" on availability_slots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Community membership: readable by anyone signed in; users can only join/leave for themselves
create policy "memberships are viewable by authenticated users" on community_members
  for select using (auth.role() = 'authenticated');
create policy "users can join communities" on community_members
  for insert with check (auth.uid() = user_id);
create policy "users can leave communities" on community_members
  for delete using (auth.uid() = user_id);

-- Match requests: only the two people involved can see or act on a request
create policy "involved users can view a request" on match_requests
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);
create policy "senders can create a request" on match_requests
  for insert with check (auth.uid() = from_user_id);
create policy "recipients can respond to a request" on match_requests
  for update using (auth.uid() = to_user_id);

-- ── Safety: blocking + reporting ─────────────────────────────────────
create table if not exists blocked_users (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_id uuid not null references profiles(id) on delete cascade,
  reason text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

alter table blocked_users enable row level security;
alter table reports enable row level security;

-- Block list: only the blocker can see or manage their own list
create policy "users manage their own block list" on blocked_users
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- Reports: write-only from the client; no one can read reports back via the API
create policy "users can file a report" on reports
  for insert with check (auth.uid() = reporter_id);

-- ── Identity verification: photo + video review ──────────────────────
-- 'avatars' is public-read (profile photos); 'verification-videos' is
-- private — only the uploader and admins (profiles.is_admin) can read it.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('verification-videos', 'verification-videos', false)
on conflict (id) do nothing;

create policy "avatar photos are publicly viewable" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "users can upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users can replace their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can upload their own verification video" on storage.objects
  for insert with check (bucket_id = 'verification-videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users can replace their own verification video" on storage.objects
  for update using (bucket_id = 'verification-videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users can view their own verification video" on storage.objects
  for select using (bucket_id = 'verification-videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admins can view any verification video" on storage.objects
  for select using (
    bucket_id = 'verification-videos'
    and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true)
  );
