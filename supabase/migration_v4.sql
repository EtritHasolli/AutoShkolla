-- ============================================================================
-- AutoShkolla — migration v4: redesign features
-- ============================================================================
-- Run AFTER migration_v3.sql (safe to re-run). Adds:
--   1. Plan names from "Pricing & Packages": Fillestar / Standard / Premium
--      (old Starter → Fillestar, Pro → Standard).
--   2. Directory controls: a school can hide itself from the public list and
--      choose whether to accept online enrollments (MVP Roadmap P1).
--   3. School-defined lesson packages (jsonb on schools), shown on the public
--      school page.
--   4. Student notes + the package name a student bought.
--   5. Administrators may edit school settings (was owner-only).
--   6. Online enrollment respects accept_enrollments; Albanian notification.
--
-- The app keeps working before this runs (it drops unknown columns when
-- saving), but these settings only persist once it has been applied.
-- ============================================================================

-- 1. plan names -----------------------------------------------------------------
alter table public.schools drop constraint if exists schools_plan_check;
update public.schools set plan = 'Fillestar' where plan = 'Starter';
update public.schools set plan = 'Standard'  where plan = 'Pro';
alter table public.schools alter column plan set default 'Fillestar';
alter table public.schools
  add constraint schools_plan_check check (plan in ('Fillestar', 'Standard', 'Premium'));

-- 2 + 3. directory controls and packages ---------------------------------------------
alter table public.schools
  add column if not exists listed             boolean not null default true,
  add column if not exists accept_enrollments boolean not null default true,
  add column if not exists packages           jsonb;

-- 4. student notes / package name --------------------------------------------------
alter table public.students
  add column if not exists notes        text not null default '',
  add column if not exists package_name text;

-- 5. owners AND administrators can update their school ---------------------------
drop policy if exists "schools: owner updates own" on public.schools;
drop policy if exists "schools: owner or admin updates own" on public.schools;
create policy "schools: owner or admin updates own"
  on public.schools for update
  using (id = public.my_school() and public.my_role() in ('owner', 'administrator'))
  with check (id = public.my_school());

-- Public directory: only listed schools, plus packages + enrollment flag.
-- (drop first: the column list changes, which create-or-replace can't do)
drop view if exists public.public_schools;
create view public.public_schools as
select
  s.id, s.name, s.city, s.address, s.phone, s.cats, s.logo_url,
  s.created_at::date as joined,
  (select count(*) from public.students    st where st.school_id = s.id) as students,
  (select count(*) from public.instructors i  where i.school_id  = s.id) as instructors,
  (select count(*) from public.vehicles    v  where v.school_id  = s.id) as vehicles,
  s.maps_url, s.hours_start, s.hours_end, s.working_days,
  s.accept_enrollments, s.packages
from public.schools s
where s.status in ('trial', 'active') and s.listed;

grant select on public.public_schools to anon, authenticated;

-- 6. enrollment honours accept_enrollments; notification in Albanian ------------------
create or replace function public.provision_user(uid uuid, uemail text, meta jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  sch    jsonb := meta -> 'school';
  enr    jsonb := meta -> 'enroll';
  sid    uuid;
  fname  text := coalesce(meta ->> 'full_name', split_part(uemail, '@', 1));
begin
  insert into profiles (id, email, full_name)
  values (uid, uemail, fname)
  on conflict (id) do nothing;

  if (select school_id from profiles where id = uid) is not null then return; end if;

  if sch is not null and jsonb_typeof(sch) = 'object' then
    insert into schools (name, biz_number, address, city, phone, logo_url, cats)
    values (
      coalesce(sch ->> 'name', 'Autoshkolla ime'),
      nullif(sch ->> 'bizNumber', ''), sch ->> 'address', sch ->> 'city', sch ->> 'phone',
      sch ->> 'logo',
      coalesce((select array_agg(x) from jsonb_array_elements_text(sch -> 'cats') as t(x)), array['B'])
    )
    returning id into sid;
    update profiles set school_id = sid, role = 'owner', full_name = fname where id = uid;

  elsif enr is not null and jsonb_typeof(enr) = 'object' then
    sid := (enr ->> 'school_id')::uuid;
    if exists (select 1 from schools where id = sid and status in ('trial', 'active') and accept_enrollments) then
      insert into students (school_id, profile_id, name, email, phone, cat)
      values (sid, uid, fname, uemail, coalesce(enr ->> 'phone', ''), coalesce(enr ->> 'cat', 'B'));
      update profiles set school_id = sid, role = 'student' where id = uid;
      insert into notifications (school_id, type, title, body, status, read)
      values (sid, 'reminder', 'Regjistrim i ri', fname || ' u regjistrua online', 'sent', false);
    end if;

  else
    select school_id into sid from instructors
    where lower(email) = lower(uemail) and profile_id is null limit 1;
    if sid is not null then
      update instructors set profile_id = uid
      where lower(email) = lower(uemail) and profile_id is null;
      update profiles set school_id = sid, role = 'instructor' where id = uid;
    else
      select school_id into sid from students
      where lower(email) = lower(uemail) and profile_id is null limit 1;
      if sid is not null then
        update students set profile_id = uid
        where lower(email) = lower(uemail) and profile_id is null;
        update profiles set school_id = sid, role = 'student' where id = uid;
      end if;
    end if;
  end if;
end $$;
