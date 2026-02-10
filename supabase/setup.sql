-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates the tables needed for the Mood Checker app

-- Users table (synced from NextAuth on sign-in)
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  image text,
  created_at timestamp with time zone default now()
);

-- Mood entries table
create table if not exists mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  date text not null,
  mood_value integer not null check (mood_value >= 1 and mood_value <= 5),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Index for faster queries by user
create index if not exists mood_entries_user_id_idx on mood_entries(user_id);

-- Disable RLS so the server-side anon key can read/write freely.
-- If you want finer access control, enable RLS and add policies instead.
alter table users enable row level security;
alter table mood_entries enable row level security;

-- Allow all operations via the anon/service key (server-side usage)
create policy "Allow all for authenticated requests" on users
  for all using (true) with check (true);

create policy "Allow all for authenticated requests" on mood_entries
  for all using (true) with check (true);
