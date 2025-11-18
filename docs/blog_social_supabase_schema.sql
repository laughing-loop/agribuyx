-- Supabase schema for AgriBuyX blog + social settings
-- Run this in the Supabase SQL editor or as part of a migration.

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Blog posts used by public /blog and /blog/[slug] pages and admin Updates tab
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  image_url text,
  video_url text,
  created_at timestamptz not null default now()
);

-- Key/value site-wide settings used for social links on the shop page
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text,
  created_at timestamptz not null default now()
);

-- Optional: seed keys so the admin dashboard can start filling values immediately
insert into public.site_settings (key, value)
values
  ('whatsapp_channel_url', null),
  ('tiktok_url', null),
  ('facebook_url', null)
on conflict (key) do nothing;

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  category text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
