create extension if not exists pgcrypto;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  business_name text,
  business_type text,
  requested_demo_slug text,
  source_path text,
  timeline text,
  project_scope text,
  message text not null,
  status text not null default 'new',
  last_contacted_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_idx
  on public.contact_inquiries (created_at desc);

create index if not exists contact_inquiries_status_idx
  on public.contact_inquiries (status, created_at desc);

create index if not exists contact_inquiries_email_idx
  on public.contact_inquiries (lower(email));

alter table public.contact_inquiries enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on table public.contact_inquiries from anon, authenticated;
grant insert on table public.contact_inquiries to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_inquiries'
      and policyname = 'contact_inquiries_public_insert'
  ) then
    execute $policy$
      create policy contact_inquiries_public_insert
      on public.contact_inquiries
      for insert
      to anon, authenticated
      with check (true)
    $policy$;
  end if;
end
$$;

create table if not exists public.vercel_analytics_events (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  schema_name text not null default 'vercel.analytics.v2',
  event_type text not null,
  event_name text,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  path text not null default '/',
  route text,
  origin text,
  referrer text,
  query_params text,
  country text,
  region text,
  city text,
  os_name text,
  os_version text,
  client_name text,
  client_type text,
  client_version text,
  browser_engine text,
  browser_engine_version text,
  device_type text,
  device_brand text,
  device_model text,
  sdk_name text,
  sdk_version text,
  vercel_environment text,
  vercel_url text,
  deployment text,
  project_id text,
  owner_id text,
  session_id text,
  device_id text,
  event_data jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb
);

create index if not exists vercel_analytics_events_occurred_idx
  on public.vercel_analytics_events (occurred_at desc);

create index if not exists vercel_analytics_events_event_idx
  on public.vercel_analytics_events (event_type, occurred_at desc);

create index if not exists vercel_analytics_events_path_idx
  on public.vercel_analytics_events (path, occurred_at desc);

create index if not exists vercel_analytics_events_event_name_idx
  on public.vercel_analytics_events (event_name, occurred_at desc)
  where event_name is not null;

create index if not exists vercel_analytics_events_country_idx
  on public.vercel_analytics_events (country, occurred_at desc)
  where country is not null;

create index if not exists vercel_analytics_events_session_idx
  on public.vercel_analytics_events (session_id, occurred_at desc)
  where session_id is not null;

alter table public.vercel_analytics_events enable row level security;
