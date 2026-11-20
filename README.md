# AutoShkolla

Software for driving schools in Kosovo — **website + web app + Android app**.
Students, instructors, vehicles, packages, payments, exams, calendar, theory
tests, reports, and a public school directory with online enrollment.
Albanian first, English as a toggle.

React 19 + Vite, Supabase (Postgres + Auth + Realtime), Capacitor 8 for Android.

## What's where

| Part | What it is |
|---|---|
| **Website** (`#/`) | Landing page: school directory with search/filters, school pages with packages & prices, online enrollment (with consent), "for school owners" pitch, plans + pilot offer, Android download, privacy page |
| **Web app** (`#/app/...`) | Office (owner / administrator / receptionist) on desktop; instructors and students on phone — same code, responsive |
| **Android app** (`android/`) | The same app wrapped with Capacitor. Hardware back button, safe areas, call/WhatsApp links, file sharing for CSV exports |
| **Super admin** | Platform view of all schools: status, plan, MRR |

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
```

With no `.env` the app runs on **offline demo data** (resets on reload).
Demo login: any email; the password picks the role —
`owner` · `admin` · `receptionist` · `instructor` · `student` · `superadmin`.
Every build also has **"Shiko demon / Try the demo"** on the landing and login
pages, which switches to demo data at runtime — useful for in-person demos.

## Connect a backend (Supabase)

> The current project (`nrmsudixqjqdxnjnedfk`) is restored and has all
> migrations up to v5. The steps below are for setting up a fresh project.

1. Create a project at [database.new](https://database.new) (**EU region**).
2. SQL editor → run in order: `supabase/schema.sql`, `migration_v2.sql`,
   `migration_v3.sql`, `migration_v4.sql`, `migration_v5.sql` (optionally `seed.sql`).
3. Copy `.env.example` → `.env`, fill in Project URL + anon key.
4. Auth → URL configuration: set the Site URL to your website's address.
5. Make yourself super admin: sign up, then
   `select public.promote_to_superadmin('you@example.com');`

The app keeps working if `migration_v4.sql` hasn't been run yet (it drops
unknown columns when saving), but directory controls, packages, notes and the
new plan names only persist once it's applied.

### Keep-alive (stop the free tier from pausing the project)

Free Supabase projects pause after ~7 days without activity, and a paused
project can eventually be deleted. `.github/workflows/keep-supabase-awake.yml`
pings the database every day at 05:23 UTC by calling `public.keep_alive()`
(from `migration_v5.sql` — it writes one timestamp, so it's real activity).

One-time setup on GitHub: **Settings → Secrets and variables → Actions → New
repository secret**: `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Then **Actions →
Keep Supabase awake → Run workflow** once to check it's green.

- If the secrets are missing the job is skipped with a warning (no failure emails).
- If the project is paused, deleted or the key is wrong, the job **fails** — GitHub
  emails you, so you hear about it before your users do.
- The workflow re-enables itself each run, so GitHub's "disabled after 60 days
  without commits" rule doesn't switch it off.
- Check from your PC any time: `npm run keepalive` (reads `.env`).

Once a school pays, move to Supabase Pro (no pausing, daily backups) — the
keep-alive is a free-tier safety net, not a substitute for backups.

## Website (Netlify)

`netlify.toml` is ready: connect the GitHub repo in Netlify, add the two
`VITE_SUPABASE_*` variables, deploy. The site's Android button links to the
newest APK on GitHub Releases (`APK_URL` in `src/lib/brand.js`).

## Android releases & auto-update

Every push to `main` runs `.github/workflows/release.yml`, which publishes a
GitHub Release with `AutoShkolla.apk`, a web `bundle.zip` and `update.json`.
No secrets: the Supabase URL + anon key come from the committed
`.env.production`, and the APK is the one committed in `apk/`.
Newest APK, always: <https://github.com/EtritHasolli/AutoShkolla/releases/latest/download/AutoShkolla.apk>

Installed apps check `update.json` on launch (`src/lib/updater.js`):

- **Web-only change** → just push. The app downloads the new bundle in the
  background and shows "Restart"; otherwise it applies on the next launch (or
  after 10 min in the background). No reinstall. A bundle that crashes on
  start is rolled back.
- **Native change** (`android/`, `capacitor.config.json`, adding/upgrading a
  Capacitor plugin) → run `npm run android:apk` (signs with the local key,
  bumps versionCode, writes `apk/`), commit `apk/`, push. The app offers the
  new APK. If you forget, the workflow fails and says so — phones never get JS
  that needs native code they don't have.

Put `[skip ci]` in a commit message to push without releasing. The repo must
stay public, or phones can't download releases.

## Android APK (local build)

Requirements: Android Studio (for its JDK 21 + Android SDK). Then:

```bash
npm run android:apk            # live build (uses .env)
npm run android:apk -- --demo  # offline demo build
```

Output: `release/AutoShkolla-v<version>.apk`. Install it on a phone (allow
"install unknown apps"). `npm run android:open` opens the project in Android
Studio.

**Signing:** release builds are signed with `android/keystore/autoshkolla-release.jks`
(passwords in `android/keystore.properties`). Both are git-ignored.
**Back them up somewhere safe** — every future update must be signed with the
same key, including on Google Play. Without `keystore.properties` the script
builds a debug APK instead.

Icons and splash screens come from `scripts/make-icons.mjs` → `assets/` →
`npx capacitor-assets generate --android`.

## Configuration

`src/lib/brand.js` — product name (one place, for when the trademark search is
done), plan tiers, `SHOW_PRICES` (prices stay hidden on the website until
discovery interviews validate them), APK link, contact details, default
lesson packages.

## How it's built

- `src/AppContext.jsx` — session, demo/live switch, all data + mutations
  (optimistic locally, then written to Supabase; realtime refetch reconciles)
- `src/lib/db.js` — Supabase adapter with retry on flaky connections
- `src/lib/derive.js` — lessons used, balance, readiness, exam status
  (computed, identical in demo and live)
- `src/lib/router.js` — hash URLs (`#/school/<id>`, `#/app/students/<id>`)
- `src/data/i18n.js` — every string, `[sq, en]` side by side
- `src/index.css` — design system (tokens + components)

### Security model

Row Level Security on every table: members only see their own school; staff
write everything, instructors write their lessons and their students'
progress/notes, students can cancel their own lessons; the super admin reads
platform-wide via `platform_school_stats`.

## Scripts

```bash
npm run dev            # dev server
npm run build          # production build → dist/
npm run preview        # serve the build
npm run android:apk    # build the Android APK
npm run android:sync   # build + copy into the Android project
npm run android:open   # open in Android Studio
npm run keepalive      # ping Supabase now (same check the daily GitHub Action runs)
```
