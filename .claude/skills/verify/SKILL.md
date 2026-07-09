---
name: verify
description: Build, launch and drive the DriveFlow app to verify changes end-to-end.
---

# Verifying DriveFlow (AutoShkolla)

React 19 + Vite SPA. No router — navigation is context state (`route` in AppContext).

## Build & launch

```bash
npm run build                      # quick sanity; must pass clean
npm run dev -- --port 5199 &       # dev server for driving
```

**⚠️ The repo has a real `.env` pointing at the user's live Supabase project.**
Never drive signup/enroll/login flows against it in tests. Force demo mode:

```bash
VITE_SUPABASE_URL='' VITE_SUPABASE_ANON_KEY='' npm run dev -- --port 5199 &
```

In demo mode the app uses in-memory seed data; reloading the page resets all
state and returns to the landing screen — that's the fastest "logout" in tests.
The unauthenticated flow starts on the **Landing** page (school directory);
"Sign in" → login screen, "Register your school" → signup wizard.

## Demo credentials

Email is always `you@example.com`; the password picks the role:
`superadmin` | `owner` | `admin` (administrator) | `instructor` | `student`.

## Driving with Playwright

Playwright works headless via a scratch `npm install playwright` + `npx playwright install chromium`.
Gotchas discovered:

- The Calendar page has two filter `<select>`s of its own; scope modal selects with
  `page.locator('select', { has: page.locator('option', { hasText: … }) })`.
- `page.locator('input').first()` on Settings grabs the **topbar search box** —
  target inputs inside the form card.
- Toasts ("New lesson ✓") linger 2.2s and match `getByText` — don't use modal
  title text to assert the modal closed.
- The New-Lesson save is conflict-checked; the default slot (today 09:00) is
  usually taken by seed data. Use Saturday 17:00 (free in seed).
- Buttons: "Record payment" (not "Record"), "Save" is exact.

## Flows worth driving

login (each role) → dashboard renders · add student → appears in Students ·
record payment → totals change · new lesson in free slot → calendar chip + toast ·
add instructor / vehicle / exam · Settings save → sidebar shows school name ·
superadmin portal shows schools table. Capture `page.on('console'/'pageerror')` —
should stay empty.

Live Supabase mode needs a real project with `supabase/schema.sql` applied; demo
mode verification does not cover RLS/trigger behavior.
