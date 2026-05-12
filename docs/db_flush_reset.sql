-- AgriBuyX safe database flush
-- Run in Supabase SQL Editor.
--
-- What this does:
-- 1. Shows the public tables currently in your database.
-- 2. Flushes only known AgriBuyX content/transaction tables that actually exist.
-- 3. Preserves Supabase Auth users, admins, vendors, categories, and site settings.
--
-- Tables intentionally preserved by default:
-- - auth.users
-- - public.admins
-- - public.vendors
-- - public.categories
-- - public.site_settings

select 'Public tables before flush' as report, table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;

do $$
declare
  tables_to_flush text[] := array[
    'product_images',
    'products',
    'blog_posts',
    'support_requests',
    'vendor_invites'
  ];
  target_table text;
begin
  foreach target_table in array tables_to_flush loop
    if to_regclass(format('public.%I', target_table)) is not null then
      raise notice 'Flushing public.%', target_table;
      execute format('truncate table public.%I restart identity cascade', target_table);
    else
      raise notice 'Skipping public.% because it does not exist', target_table;
    end if;
  end loop;
end $$;

create temporary table if not exists flush_report (
  table_name text primary key,
  row_count bigint not null
) on commit drop;

truncate table flush_report;

do $$
declare
  tables_to_check text[] := array[
    'product_images',
    'products',
    'blog_posts',
    'support_requests',
    'vendor_invites'
  ];
  target_table text;
  rows_after bigint;
begin
  foreach target_table in array tables_to_check loop
    if to_regclass(format('public.%I', target_table)) is not null then
      execute format('select count(*) from public.%I', target_table) into rows_after;
      insert into flush_report (table_name, row_count)
      values (target_table, rows_after)
      on conflict (table_name) do update set row_count = excluded.row_count;
    end if;
  end loop;
end $$;

select 'Public row counts after flush' as report, table_name, row_count
from flush_report
order by table_name;

-- Optional full catalog/settings reset.
-- Only run this separate block if you also want to remove categories and site settings.
--
-- do $$
-- declare
--   tables_to_flush text[] := array[
--     'categories',
--     'site_settings'
--   ];
--   target_table text;
-- begin
--   foreach target_table in array tables_to_flush loop
--     if to_regclass(format('public.%I', target_table)) is not null then
--       raise notice 'Flushing public.%', target_table;
--       execute format('truncate table public.%I restart identity cascade', target_table);
--     else
--       raise notice 'Skipping public.% because it does not exist', target_table;
--     end if;
--   end loop;
-- end $$;
