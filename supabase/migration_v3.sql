-- ============================================================================
-- DriveFlow — migration v3: school preferences (currency, working hours)
-- ============================================================================
-- Run AFTER migration_v2.sql. Adds the two Settings-page preference fields
-- that previously had nowhere to persist.
-- ============================================================================

alter table public.schools
  add column if not exists currency text not null default 'EUR',
  add column if not exists working_hours text not null default '08:00 – 18:00';
