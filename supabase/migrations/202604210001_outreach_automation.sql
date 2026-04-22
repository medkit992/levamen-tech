create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.outreach_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'default',
  enabled boolean not null default false,
  sender_name text not null default 'Levamen Tech',
  sender_email text not null default 'outreach@outreach.levamentech.com',
  reply_to_email text not null default 'admin@levamentech.com',
  website_url text not null default 'https://levamentech.com',
  contact_url text not null default 'https://levamentech.com/contact',
  mailing_address text not null default '',
  daily_draft_limit integer not null default 20 check (daily_draft_limit between 1 and 50),
  daily_send_limit integer not null default 20 check (daily_send_limit between 1 and 50),
  max_pending_approval integer not null default 60 check (max_pending_approval between 1 and 250),
  target_cities text[] not null default array['Phoenix, Arizona'],
  target_industries text[] not null default array[
    'plumber',
    'electrician',
    'hvac contractor',
    'landscaper',
    'roofing contractor',
    'cleaning service',
    'pressure washing service',
    'auto detailing service',
    'home remodeling contractor',
    'moving company'
  ],
  last_run_at timestamptz,
  last_run_status text not null default 'idle',
  last_run_summary jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach_prospects (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'google_places',
  source_place_id text,
  business_name text not null,
  primary_type text,
  city text,
  region text,
  country text,
  formatted_address text,
  google_maps_url text,
  website_url text,
  website_fetch_status text not null default 'not_checked',
  website_quality text not null default 'unknown',
  website_quality_reasons text[] not null default '{}'::text[],
  phone text,
  contact_email text,
  contact_page_url text,
  email_source text,
  rating numeric(3, 2),
  user_rating_count integer,
  search_query text,
  qualification_summary text,
  personalization_context text,
  demo_slug text,
  status text not null default 'new',
  metadata jsonb not null default '{}'::jsonb,
  unsubscribe_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists outreach_prospects_source_place_idx
  on public.outreach_prospects (source, source_place_id)
  where source_place_id is not null;

create index if not exists outreach_prospects_status_idx
  on public.outreach_prospects (status, created_at desc);

create index if not exists outreach_prospects_contact_email_idx
  on public.outreach_prospects (lower(contact_email))
  where contact_email is not null;

create table if not exists public.outreach_drafts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.outreach_prospects(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  body_text text not null,
  personalization_summary text not null default '',
  demo_slug text,
  demo_url text,
  ai_model text,
  status text not null default 'pending_approval',
  provider_email_id text,
  provider_last_event text,
  provider_error text,
  approved_by text,
  denied_by text,
  sent_by text,
  approved_at timestamptz,
  denied_at timestamptz,
  sent_at timestamptz,
  last_edited_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prospect_id)
);

create index if not exists outreach_drafts_status_idx
  on public.outreach_drafts (status, created_at desc);

create index if not exists outreach_drafts_provider_email_idx
  on public.outreach_drafts (provider_email_id)
  where provider_email_id is not null;

create index if not exists outreach_drafts_recipient_email_idx
  on public.outreach_drafts (lower(recipient_email));

create table if not exists public.outreach_events (
  id uuid primary key default gen_random_uuid(),
  delivery_id text unique,
  draft_id uuid references public.outreach_drafts(id) on delete set null,
  prospect_id uuid references public.outreach_prospects(id) on delete set null,
  provider text not null,
  provider_message_id text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists outreach_events_draft_idx
  on public.outreach_events (draft_id, created_at desc);

create table if not exists public.outreach_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text generated always as (lower(email)) stored,
  reason text not null,
  source text not null,
  provider_message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists outreach_suppressions_email_idx
  on public.outreach_suppressions (email_normalized);

alter table public.outreach_settings enable row level security;
alter table public.outreach_prospects enable row level security;
alter table public.outreach_drafts enable row level security;
alter table public.outreach_events enable row level security;
alter table public.outreach_suppressions enable row level security;

drop trigger if exists outreach_settings_set_updated_at on public.outreach_settings;
create trigger outreach_settings_set_updated_at
before update on public.outreach_settings
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists outreach_prospects_set_updated_at on public.outreach_prospects;
create trigger outreach_prospects_set_updated_at
before update on public.outreach_prospects
for each row
execute function public.set_current_timestamp_updated_at();

drop trigger if exists outreach_drafts_set_updated_at on public.outreach_drafts;
create trigger outreach_drafts_set_updated_at
before update on public.outreach_drafts
for each row
execute function public.set_current_timestamp_updated_at();
