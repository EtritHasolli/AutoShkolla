# DriveFlow — Autoshkolla OS

Multi-tenant SaaS for driving schools: scheduling, students, instructors,
vehicles, payments, exams, theory courses — plus a platform super-admin portal.

React 19 + Vite frontend, Supabase (Postgres + Auth + Realtime) backend.

## Two modes

| Mode | When | Data |
|---|---|---|
| **Demo (offline)** | no `.env` configured | bundled seed data, in-memory, resets on reload |
| **Live** | `.env` points at a Supabase project | real auth, per-school data, realtime sync |

### Demo credentials

Email `you@example.com`, password picks the role:
`superadmin` · `owner` · `admin` · `instructor` · `student`.

## Live setup (Supabase)

1. Create a project at [database.new](https://database.new).
2. In the SQL editor run **`supabase/schema.sql`** (tables, RLS, triggers,
   realtime), then **`supabase/migration_v2.sql`** (public school directory,
   student self-enrollment, account self-heal), then optionally
   **`supabase/seed.sql`** (demo school + fleet of skeleton schools).
3. Copy `.env.example` → `.env` and fill in the Project URL and anon key
   (Project Settings → API).
4. `npm install && npm run dev`

### "I signed up but can't log in"

Supabase requires **email confirmation** by default. Either click the link in
the confirmation email (check spam), use the login screen's *Resend
confirmation email* button — or turn it off for development:
Dashboard → **Authentication → Sign In / Providers → Email → uncheck
"Confirm email"**. Accounts created before the DB triggers were installed are
repaired automatically at next login (`ensure_account()`).

### Accounts & roles

- **Register a school** — the in-app "Register your school" wizard signs the
  user up and a DB trigger creates the school with them as `owner`.
- **Students enroll from the landing page** — the public landing page lists
  every active school (filterable by Kosovo city and licence category); a
  student picks one, fills in the enroll form, and lands in their student
  portal linked to that school.
- **Invite instructors / students** — add them in the app *with an email*;
  when that person signs up with the same email, a trigger links them to the
  row and gives them the `instructor` / `student` role automatically.
- **Super admin** — sign the user up once, then in the SQL editor:
  `select public.promote_to_superadmin('you@example.com');`
- To attach a login to the seeded demo school, see the header of `supabase/seed.sql`.

### Security model

Row Level Security on every table: members only see their own school's rows;
owner/administrator write everything, instructors write their own lessons and
their students' progress, students can update (e.g. cancel) their own lessons;
the superadmin has read access platform-wide via `platform_school_stats`.

### Reactivity

The app subscribes to Postgres changes (`supabase_realtime`) for its school —
any insert/update/delete from another device refreshes the UI within ~250 ms.

## Scripts

```bash
npm run dev       # dev server
npm run build     # production build → dist/
npm run preview   # serve the build
```
