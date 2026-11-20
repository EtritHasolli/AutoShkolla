---
name: verify
description: Build, launch and drive the AutoShkolla app to verify changes end-to-end.
---

# Verifying AutoShkolla

React 19 + Vite SPA. Hash router (`src/lib/router.js`): `#/`, `#/login`,
`#/signup`, `#/privacy`, `#/school/<id>`, `#/app/<route>`, `#/app/students/<id>`.
Navigate in tests with `location.hash = '#/app/calendar'`.

## Build & launch

```bash
npm run build                      # must pass clean
VITE_SUPABASE_URL='' VITE_SUPABASE_ANON_KEY='' npx vite --port 5199 --strictPort
```

Always force demo mode (empty env vars) — never drive signup/enroll/login
against a real Supabase project.

## Demo login

Any email; password = role: `owner` | `admin` | `receptionist` | `instructor` |
`student` | `superadmin`. Or "Shiko demon" → pick a role. Demo data is
generated relative to today (lessons last/this/next week). A demo session
survives reload (localStorage `as-demo`); clear it to start fresh.

## UI language

Albanian is the default — button names in tests are Albanian:
"Hyr" (sign in, use `exact: true`), "Cakto mësim" (topbar), "Mësim i ri",
"Shto kandidat", "Regjistro pagesë", "Ruaj", "Përfundoi", "Përparimi",
"Pagesat" (profile tab — use `.last()`, the sidebar has one too), "Shiko demon".
Toggle EN via the topbar `.seg` buttons.

## Gotchas

- Dialogs render in `.dialog`; scope selectors there. The lesson form's selects
  are: student, time, instructor, vehicle, repeat (last).
- The lesson form disables "Ruaj" while a conflict is shown (`.tone-red`).
- Payment save opens the receipt dialog — close with Escape.
- Toasts (`.toast`) linger ~2.6 s.
- Phone layout below 1024 px: tab bar (`.tabbar`), FAB (`.fab`) for staff,
  "More" sheet = last tab.

## Flows worth driving

login each role → dashboard · add student → row appears · record payment →
balance drops, receipt shows · lesson at a booked slot → conflict warning ·
weekly repeat → "N mësime u caktuan" · mark lesson completed → lessons used +1
· skill score click · EN toggle · Reports CSV download · add package ·
browser back. Capture `pageerror`/console errors — should stay empty.

## Android

`npm run android:apk -- --demo` → `release/*.apk`. No emulator is installed on
this machine; install on a phone to check native behaviour (back button,
safe areas, tel:/WhatsApp links, CSV share sheet).
