-- The site relies on PostgREST/Supabase Data API access for public intake and
-- authenticated admin reads/writes. RLS policies alone are not sufficient:
-- anon/authenticated also need table grants.

grant usage on schema public to anon, authenticated;

revoke all on table public.pricing_inquiries from anon, authenticated;
grant insert on table public.pricing_inquiries to anon, authenticated;

revoke all on table public.reviews from anon, authenticated;
grant select, insert on table public.reviews to anon, authenticated;

revoke all on table public.client_accounts from anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;
