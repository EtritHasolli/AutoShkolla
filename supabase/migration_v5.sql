-- ============================================================================
-- AutoShkolla — migration v5: keep-alive endpoint
-- ============================================================================
-- Free Supabase projects are paused after ~7 days without activity (and a
-- paused project can later be deleted). The GitHub Action
-- .github/workflows/keep-supabase-awake.yml calls public.keep_alive() once a
-- day; it writes one timestamp so the ping is real database activity.
-- Safe to re-run.
-- ============================================================================

create table if not exists public.keep_alive (
  id        int primary key default 1 check (id = 1),   -- exactly one row
  pinged_at timestamptz not null default now(),
  pings     bigint not null default 0
);

-- RLS on with no policies: the table is unreachable directly; only the
-- function below (security definer) touches it.
alter table public.keep_alive enable row level security;

insert into public.keep_alive (id) values (1) on conflict (id) do nothing;

create or replace function public.keep_alive()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update keep_alive set pinged_at = now(), pings = pings + 1 where id = 1
  returning pinged_at;
$$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon, authenticated;
