-- Align row-level security with the current product flows:
-- - public pricing inquiry submissions
-- - public review submissions plus approved review reads
-- - admin dashboard access only through secured edge functions

alter table if exists public.pricing_inquiries enable row level security;
alter table if exists public.reviews enable row level security;
alter table if exists public.client_accounts enable row level security;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'pricing_inquiries'
  ) then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'pricing_inquiries'
        and policyname = 'pricing_inquiries_public_insert'
    ) then
      execute $policy$
        create policy pricing_inquiries_public_insert
        on public.pricing_inquiries
        for insert
        to anon, authenticated
        with check (true)
      $policy$;
    end if;

    drop policy if exists pricing_inquiries_authenticated_select
      on public.pricing_inquiries;
    drop policy if exists pricing_inquiries_authenticated_update
      on public.pricing_inquiries;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'reviews'
  ) then
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'reviews'
        and policyname = 'reviews_public_select_approved'
    ) then
      execute $policy$
        create policy reviews_public_select_approved
        on public.reviews
        for select
        to anon, authenticated
        using (coalesce(approved, false) = true)
      $policy$;
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'reviews'
        and policyname = 'reviews_public_insert_pending'
    ) then
      execute $policy$
        create policy reviews_public_insert_pending
        on public.reviews
        for insert
        to anon, authenticated
        with check (coalesce(approved, false) = false)
      $policy$;
    end if;

    drop policy if exists reviews_authenticated_select_all on public.reviews;
    drop policy if exists reviews_authenticated_update on public.reviews;
    drop policy if exists reviews_authenticated_delete on public.reviews;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'client_accounts'
  ) then
    drop policy if exists client_accounts_authenticated_select
      on public.client_accounts;
    drop policy if exists client_accounts_authenticated_update
      on public.client_accounts;
  end if;
end
$$;
