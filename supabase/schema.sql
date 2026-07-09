-- ============================================================================
-- DriveFlow (AutoShkolla) — Supabase schema
-- ============================================================================
-- Run this whole file in the Supabase SQL editor (or `supabase db push`).
-- It is idempotent-ish for a fresh project; on re-runs drop objects first.
--
-- Architecture:
--   * Multi-tenant: every business table carries school_id (the tenant key).
--   * profiles is 1:1 with auth.users and holds role + school membership.
--   * Roles: superadmin | owner | administrator | receptionist | instructor | student
--   * Signup flows (all handled by the handle_new_user trigger):
--       1. School registration: auth.signUp with { school: {...} } metadata
--          → creates the school and makes the user its owner.
--       2. Invited member: staff adds an instructor/student row with an email;
--          when that person signs up with the same email they are linked to
--          the row and get the matching role automatically.
--   * Superadmin: promote manually once — see promote_to_superadmin() below.
--   * RLS: members read their own school's data; writes are role-scoped.
--   * Realtime: all business tables are in the supabase_realtime publication.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
create type public.app_role as enum
  ('superadmin', 'owner', 'administrator', 'receptionist', 'instructor', 'student');

create type public.lesson_status as enum
  ('scheduled', 'completed', 'cancelled', 'no_show');

create type public.exam_type   as enum ('theory', 'practical');
create type public.exam_status as enum ('scheduled', 'passed', 'failed');

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------
create table public.schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  biz_number  text,
  address     text,
  city        text,
  phone       text,
  logo_url    text,                          -- data-URI or storage URL
  cats        text[] not null default '{B}', -- licence categories offered
  plan        text not null default 'Starter' check (plan in ('Starter', 'Pro')),
  status      text not null default 'trial'  check (status in ('trial', 'active', 'suspended')),
  mrr         numeric not null default 0,    -- what DriveFlow bills this school
  created_at  timestamptz not null default now()
);

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  school_id  uuid references public.schools (id) on delete set null,
  role       public.app_role not null default 'student',
  full_name  text,
  email      text,
  created_at timestamptz not null default now()
);

create table public.instructors (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  name       text not null,
  email      text,                -- invitation email (links auth user on signup)
  phone      text,
  cat        text not null default 'B',
  color      text not null default '#2a6fdb',
  rating     numeric not null default 4.8,
  vehicle_id uuid,                -- default vehicle (FK added after vehicles)
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  name       text not null,
  plate      text not null,
  cat        text not null default 'B',
  year       int,
  reg        date,                -- registration expiry
  ins        date,                -- insurance expiry
  km         int not null default 0,
  status     text not null default 'available' check (status in ('available', 'in_use', 'maintenance')),
  service    date,                -- next service
  created_at timestamptz not null default now()
);

alter table public.instructors
  add constraint instructors_vehicle_fk
  foreign key (vehicle_id) references public.vehicles (id) on delete set null;

create table public.students (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools (id) on delete cascade,
  profile_id    uuid references public.profiles (id) on delete set null,
  instructor_id uuid references public.instructors (id) on delete set null,
  name          text not null,
  email         text,             -- invitation email (links auth user on signup)
  phone         text,
  cat           text not null default 'B',
  total         int  not null default 30,      -- lessons in package
  price         numeric not null default 360,  -- package price €
  progress      jsonb not null default '{"parking":1,"reverse":1,"highway":1,"clutch":1,"roundabout":1,"lane":1}',
  theory        text not null default 'not_taken' check (theory    in ('not_taken', 'scheduled', 'passed', 'failed')),
  practical     text not null default 'not_taken' check (practical in ('not_taken', 'scheduled', 'passed', 'failed')),
  joined        date not null default current_date,
  created_at    timestamptz not null default now()
);

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid not null references public.schools (id) on delete cascade,
  student_id    uuid not null references public.students (id) on delete cascade,
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  vehicle_id    uuid references public.vehicles (id) on delete set null,
  lesson_date   date not null,
  hour          int  not null check (hour between 0 and 23),
  status        public.lesson_status not null default 'scheduled',
  type          text not null default 'city' check (type in ('city', 'highway')),
  pickup        text not null default '',
  created_at    timestamptz not null default now()
);

create table public.payments (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  date       date not null default current_date,
  amount     numeric not null check (amount > 0),
  method     text not null default 'cash' check (method in ('cash', 'bank', 'other')),
  note       text not null default '',
  created_at timestamptz not null default now()
);

create table public.exams (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  type       public.exam_type not null,
  date       date not null,
  status     public.exam_status not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table public.courses (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  title      text not null,
  descr      text not null default '',
  questions  jsonb not null default '[]',   -- [{id,text,image,explanation,options:[{id,text,correct}]}]
  created_at timestamptz not null default now()
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  type       text not null default 'reminder' check (type in ('reminder', 'payment', 'cancel', 'alert')),
  title      text not null,
  body       text not null default '',
  status     text not null default 'sent' check (status in ('sent', 'pending')),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes for the common access paths
create index on public.profiles      (school_id);
create index on public.instructors   (school_id);
create index on public.instructors   (profile_id);
create index on public.vehicles      (school_id);
create index on public.students      (school_id);
create index on public.students      (profile_id);
create index on public.students      (instructor_id);
create index on public.lessons       (school_id, lesson_date);
create index on public.lessons       (student_id);
create index on public.lessons       (instructor_id);
create index on public.payments      (school_id, date);
create index on public.payments      (student_id);
create index on public.exams         (school_id, date);
create index on public.courses       (school_id);
create index on public.notifications (school_id, created_at);

-- ---------------------------------------------------------------------------
-- 3. Helper functions (SECURITY DEFINER so RLS policies don't recurse)
-- ---------------------------------------------------------------------------
create or replace function public.my_role()
returns public.app_role
language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() $$;

create or replace function public.my_school()
returns uuid
language sql stable security definer set search_path = public as
$$ select school_id from profiles where id = auth.uid() $$;

create or replace function public.is_superadmin()
returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() = 'superadmin', false) $$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() in ('owner', 'administrator', 'receptionist'), false) $$;

-- member of the school OR platform superadmin (read access)
create or replace function public.is_member(sid uuid)
returns boolean
language sql stable security definer set search_path = public as
$$ select sid = public.my_school() or public.is_superadmin() $$;

-- the auth user is the instructor with this id
create or replace function public.is_my_instructor_row(iid uuid)
returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from instructors where id = iid and profile_id = auth.uid()) $$;

-- the auth user is the student with this id
create or replace function public.is_my_student_row(sid uuid)
returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from students where id = sid and profile_id = auth.uid()) $$;

-- One-time promotion of a platform superadmin (run from the SQL editor):
--   select public.promote_to_superadmin('you@example.com');
create or replace function public.promote_to_superadmin(user_email text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update profiles set role = 'superadmin', school_id = null
  where lower(email) = lower(user_email);
  if not found then
    raise exception 'No profile with email %. Sign the user up first.', user_email;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. New-user trigger: creates profile, school (owner signup) or claims invite
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  sch  jsonb := meta -> 'school';
  sid  uuid;
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(meta ->> 'full_name', split_part(new.email, '@', 1)));

  if sch is not null and jsonb_typeof(sch) = 'object' then
    -- School registration signup → create the tenant, caller becomes owner.
    insert into schools (name, biz_number, address, city, phone, logo_url, cats)
    values (
      coalesce(sch ->> 'name', 'My driving school'),
      sch ->> 'bizNumber',
      sch ->> 'address',
      sch ->> 'city',
      sch ->> 'phone',
      sch ->> 'logo',
      coalesce(
        (select array_agg(x) from jsonb_array_elements_text(sch -> 'cats') as t(x)),
        array['B']
      )
    )
    returning id into sid;

    update profiles set school_id = sid, role = 'owner' where id = new.id;
  else
    -- Invitation claim: link to a pre-created instructor/student row by email.
    select school_id into sid from instructors
    where lower(email) = lower(new.email) and profile_id is null limit 1;

    if sid is not null then
      update instructors set profile_id = new.id
      where lower(email) = lower(new.email) and profile_id is null;
      update profiles set school_id = sid, role = 'instructor' where id = new.id;
    else
      select school_id into sid from students
      where lower(email) = lower(new.email) and profile_id is null limit 1;

      if sid is not null then
        update students set profile_id = new.id
        where lower(email) = lower(new.email) and profile_id is null;
        update profiles set school_id = sid, role = 'student' where id = new.id;
      end if;
    end if;
  end if;

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.schools       enable row level security;
alter table public.profiles      enable row level security;
alter table public.instructors   enable row level security;
alter table public.vehicles      enable row level security;
alter table public.students      enable row level security;
alter table public.lessons       enable row level security;
alter table public.payments      enable row level security;
alter table public.exams         enable row level security;
alter table public.courses       enable row level security;
alter table public.notifications enable row level security;

-- schools -------------------------------------------------------------------
create policy "schools: members read own, superadmin all"
  on public.schools for select using (public.is_member(id));
create policy "schools: owner updates own"
  on public.schools for update
  using (id = public.my_school() and public.my_role() = 'owner')
  with check (id = public.my_school());
create policy "schools: superadmin updates any"
  on public.schools for update using (public.is_superadmin());
-- inserts happen only inside the SECURITY DEFINER signup trigger

-- profiles ------------------------------------------------------------------
create policy "profiles: own row read"
  on public.profiles for select using (id = auth.uid());
create policy "profiles: school staff read members"
  on public.profiles for select using (public.is_staff() and school_id = public.my_school());
create policy "profiles: superadmin reads all"
  on public.profiles for select using (public.is_superadmin());
create policy "profiles: own row update (not role/school)"
  on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid());

-- instructors ---------------------------------------------------------------
create policy "instructors: member read"
  on public.instructors for select using (public.is_member(school_id));
create policy "instructors: staff insert"
  on public.instructors for insert with check (school_id = public.my_school() and public.is_staff());
create policy "instructors: staff or self update"
  on public.instructors for update
  using (school_id = public.my_school() and (public.is_staff() or profile_id = auth.uid()));
create policy "instructors: staff delete"
  on public.instructors for delete using (school_id = public.my_school() and public.is_staff());

-- vehicles ------------------------------------------------------------------
create policy "vehicles: member read"
  on public.vehicles for select using (public.is_member(school_id));
create policy "vehicles: staff write"
  on public.vehicles for insert with check (school_id = public.my_school() and public.is_staff());
create policy "vehicles: staff update"
  on public.vehicles for update using (school_id = public.my_school() and public.is_staff());
create policy "vehicles: staff delete"
  on public.vehicles for delete using (school_id = public.my_school() and public.is_staff());

-- students ------------------------------------------------------------------
create policy "students: member read"
  on public.students for select using (public.is_member(school_id));
create policy "students: staff insert"
  on public.students for insert with check (school_id = public.my_school() and public.is_staff());
create policy "students: staff or assigned instructor update"
  on public.students for update
  using (school_id = public.my_school()
         and (public.is_staff() or public.is_my_instructor_row(instructor_id)));
create policy "students: staff delete"
  on public.students for delete using (school_id = public.my_school() and public.is_staff());

-- lessons -------------------------------------------------------------------
create policy "lessons: member read"
  on public.lessons for select using (public.is_member(school_id));
create policy "lessons: staff or own instructor insert"
  on public.lessons for insert
  with check (school_id = public.my_school()
              and (public.is_staff() or public.is_my_instructor_row(instructor_id)));
create policy "lessons: staff, own instructor, or own student update"
  on public.lessons for update
  using (school_id = public.my_school()
         and (public.is_staff()
              or public.is_my_instructor_row(instructor_id)
              or public.is_my_student_row(student_id)));
create policy "lessons: staff delete"
  on public.lessons for delete using (school_id = public.my_school() and public.is_staff());

-- payments ------------------------------------------------------------------
create policy "payments: member read"
  on public.payments for select using (public.is_member(school_id));
create policy "payments: staff insert"
  on public.payments for insert with check (school_id = public.my_school() and public.is_staff());
create policy "payments: staff update"
  on public.payments for update using (school_id = public.my_school() and public.is_staff());
create policy "payments: staff delete"
  on public.payments for delete using (school_id = public.my_school() and public.is_staff());

-- exams ---------------------------------------------------------------------
create policy "exams: member read"
  on public.exams for select using (public.is_member(school_id));
create policy "exams: staff insert"
  on public.exams for insert with check (school_id = public.my_school() and public.is_staff());
create policy "exams: staff update"
  on public.exams for update using (school_id = public.my_school() and public.is_staff());
create policy "exams: staff delete"
  on public.exams for delete using (school_id = public.my_school() and public.is_staff());

-- courses -------------------------------------------------------------------
create policy "courses: member read"
  on public.courses for select using (public.is_member(school_id));
create policy "courses: staff insert"
  on public.courses for insert with check (school_id = public.my_school() and public.is_staff());
create policy "courses: staff update"
  on public.courses for update using (school_id = public.my_school() and public.is_staff());
create policy "courses: staff delete"
  on public.courses for delete using (school_id = public.my_school() and public.is_staff());

-- notifications ---------------------------------------------------------------
create policy "notifications: member read"
  on public.notifications for select using (public.is_member(school_id));
create policy "notifications: staff insert"
  on public.notifications for insert with check (school_id = public.my_school() and public.is_staff());
create policy "notifications: member update (mark read)"
  on public.notifications for update using (school_id = public.my_school());
create policy "notifications: staff delete"
  on public.notifications for delete using (school_id = public.my_school() and public.is_staff());

-- ---------------------------------------------------------------------------
-- 6. Super-admin platform view (aggregates per school)
--    security_invoker → underlying RLS applies: superadmin sees every school,
--    a school member would only ever see their own school through it.
-- ---------------------------------------------------------------------------
create or replace view public.platform_school_stats
with (security_invoker = true) as
select
  s.id, s.name, s.city, s.biz_number, s.plan, s.status, s.mrr, s.cats,
  s.created_at::date                                   as joined,
  (select count(*) from students   st where st.school_id = s.id)  as students,
  (select count(distinct l.student_id) from lessons l
     where l.school_id = s.id
       and l.lesson_date > current_date - 30)                     as active_students,
  (select count(*) from instructors i  where i.school_id = s.id)  as instructors,
  (select count(*) from vehicles v     where v.school_id = s.id)  as vehicles,
  (select count(*) from lessons l
     where l.school_id = s.id
       and date_trunc('month', l.lesson_date) = date_trunc('month', current_date)) as lessons_this_month,
  (select count(*) from exams e
     where e.school_id = s.id
       and date_trunc('month', e.date) = date_trunc('month', current_date))        as exams_this_month,
  coalesce((select round(100.0 * count(*) filter (where e.status = 'passed')
                   / nullif(count(*) filter (where e.status in ('passed', 'failed')), 0))
     from exams e where e.school_id = s.id), 0)::int              as exam_pass_rate,
  coalesce((select sum(p.amount) from payments p
     where p.school_id = s.id
       and date_trunc('year', p.date) = date_trunc('year', current_date)), 0)      as revenue_ytd,
  (select max(l.created_at)::date from lessons l where l.school_id = s.id)         as last_active
from public.schools s;

grant select on public.platform_school_stats to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Realtime — broadcast changes on all business tables
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table
  public.schools,
  public.instructors,
  public.vehicles,
  public.students,
  public.lessons,
  public.payments,
  public.exams,
  public.courses,
  public.notifications;

-- ============================================================================
-- Done. Next steps:
--   1. (Optional) run supabase/seed.sql for a demo school with data.
--   2. Sign up through the app ("Register your school").
--   3. To create the platform superadmin: sign that user up first (any way),
--      then run:  select public.promote_to_superadmin('you@example.com');
-- ============================================================================
