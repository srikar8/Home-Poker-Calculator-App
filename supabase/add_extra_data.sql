-- Run once in the Supabase SQL editor so settlement extras sync across devices.
alter table public.games
  add column if not exists extra_data jsonb default '{}'::jsonb;
