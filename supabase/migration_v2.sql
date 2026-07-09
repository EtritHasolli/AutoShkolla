-- ============================================================================
-- DriveFlow — migration v2: public school directory + student self-enrollment
-- ============================================================================
-- Run AFTER schema.sql (safe to run on an existing project — everything is
-- create-or-replace). Adds:
--   1. public_schools view — anonymous visitors can browse registered schools
--      (landing page directory).
--   2. Self-enrollment: a student signs up from the landing page with
--      { enroll: { school_id, phone, cat } } metadata → a students row is
--      created in that school and linked to their account.
--   3. provision_user(): the signup logic extracted so it can be replayed.
--   4. ensure_account() RPC: self-heals accounts that were created before the
--      trigger existed (fixes "I signed up but can't log in").
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Public directory of schools (safe columns only, no RLS needed — the view
--    is owned by postgres and exposes only what a visitor may see).
-- ---------------------------------------------------------------------------
create or replace view public.public_schools as
select
  s.id, s.name, s.city, s.address, s.phone, s.cats, s.logo_url,
  s.created_at::date as joined,
  (select count(*) from public.students    st where st.school_id = s.id) as students,
  (select count(*) from public.instructors i  where i.school_id  = s.id) as instructors,
  (select count(*) from public.vehicles    v  where v.school_id  = s.id) as vehicles
from public.schools s
where s.status in ('trial', 'active');

grant select on public.public_schools to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2 + 3. Signup provisioning, extracted and extended with enrollment
-- ---------------------------------------------------------------------------
create or replace function public.provision_user(uid uuid, uemail text, meta jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  sch    jsonb := meta -> 'school';
  enr    jsonb := meta -> 'enroll';
  sid    uuid;
  fname  text := coalesce(meta ->> 'full_name', split_part(uemail, '@', 1));
begin
  -- profile (idempotent)
  insert into profiles (id, email, full_name)
  values (uid, uemail, fname)
  on conflict (id) do nothing;

  -- already linked? nothing to do
  if (select school_id from profiles where id = uid) is not null then return; end if;

  if sch is not null and jsonb_typeof(sch) = 'object' then
    -- School registration → create the tenant, caller becomes owner.
    insert into schools (name, biz_number, address, city, phone, logo_url, cats)
    values (
      coalesce(sch ->> 'name', 'My driving school'),
      sch ->> 'bizNumber', sch ->> 'address', sch ->> 'city', sch ->> 'phone',
      sch ->> 'logo',
      coalesce((select array_agg(x) from jsonb_array_elements_text(sch -> 'cats') as t(x)), array['B'])
    )
    returning id into sid;
    update profiles set school_id = sid, role = 'owner', full_name = fname where id = uid;

  elsif enr is not null and jsonb_typeof(enr) = 'object' then
    -- Landing-page enrollment → create a linked student row in the chosen school.
    sid := (enr ->> 'school_id')::uuid;
    if exists (select 1 from schools where id = sid and status in ('trial', 'active')) then
      insert into students (school_id, profile_id, name, email, phone, cat)
      values (sid, uid, fname, uemail, coalesce(enr ->> 'phone', ''), coalesce(enr ->> 'cat', 'B'));
      update profiles set school_id = sid, role = 'student' where id = uid;
      insert into notifications (school_id, type, title, body, status, read)
      values (sid, 'reminder', 'New enrollment', fname || ' enrolled via DriveFlow', 'sent', false);
    end if;

  else
    -- Invitation claim: link to a pre-created instructor/student row by email.
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

-- Trigger now delegates to provision_user
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.provision_user(new.id, new.email, coalesce(new.raw_user_meta_data, '{}'::jsonb));
  return new;
end $$;

-- (the on_auth_user_created trigger from schema.sql keeps pointing at this)

-- ---------------------------------------------------------------------------
-- 4. Self-heal RPC — replays provisioning for the calling user. The app calls
--    this automatically when it finds an account with no profile / no school.
-- ---------------------------------------------------------------------------
create or replace function public.ensure_account()
returns void
language plpgsql security definer set search_path = public as $$
declare u record;
begin
  select id, email, coalesce(raw_user_meta_data, '{}'::jsonb) as meta
  into u from auth.users where id = auth.uid();
  if u.id is null then raise exception 'Not authenticated'; end if;
  perform public.provision_user(u.id, u.email, u.meta);
end $$;

grant execute on function public.ensure_account() to authenticated;
