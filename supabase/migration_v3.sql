-- ============================================================================
-- DriveFlow — migration v3: school preferences (hours, maps link)
-- ============================================================================
-- Run AFTER migration_v2.sql. Adds the Settings-page preference fields that
-- previously had nowhere to persist: working hours (as a start/end pair plus
-- which days are open) and an optional Google Maps link shown on the public
-- school-detail view. All money in DriveFlow is EUR — no per-school currency.
-- ============================================================================

alter table public.schools
  add column if not exists hours_start   text     not null default '08:00',
  add column if not exists hours_end     text     not null default '18:00',
  add column if not exists working_days  text[]   not null default '{Mon,Tue,Wed,Thu,Fri}',
  add column if not exists maps_url      text;

-- ---------------------------------------------------------------------------
-- Surface the new fields (plus the address already on `schools`) on the
-- public directory view so the landing-page school-detail view can show
-- them to anonymous visitors before they enroll.
-- ---------------------------------------------------------------------------
create or replace view public.public_schools as
select
  s.id, s.name, s.city, s.address, s.phone, s.cats, s.logo_url,
  s.created_at::date as joined,
  (select count(*) from public.students    st where st.school_id = s.id) as students,
  (select count(*) from public.instructors i  where i.school_id  = s.id) as instructors,
  (select count(*) from public.vehicles    v  where v.school_id  = s.id) as vehicles,
  s.maps_url, s.hours_start, s.hours_end, s.working_days
from public.schools s
where s.status in ('trial', 'active');

grant select on public.public_schools to anon, authenticated;
