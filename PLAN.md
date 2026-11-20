# AutoShkolla — implementation status

Mirrors the Obsidian "MVP Roadmap". Ticked = in code (demo-tested; not yet
tested end-to-end with a real school or a live Supabase project).

## Done in the redesign (Nov 2026)

- [x] New design system (blue + warm accent, Inter bundled for offline use), every screen rebuilt
- [x] Albanian by default, EN toggle everywhere (`src/data/i18n.js`, `[sq, en]` pairs)
- [x] Website: landing, directory with filters, school pages with packages, owner pitch, plans (prices hidden — `SHOW_PRICES`), pilot offer, privacy page
- [x] Enrollment form: privacy notice + consent checkbox (Legal & Compliance)
- [x] Directory controls: hide from directory / stop online enrollments (P1)
- [x] Plan names Fillestar / Standard / Premium (P1) — `migration_v4.sql`
- [x] School-defined packages, editable, shown publicly
- [x] Calendar: real dates, week navigation, per-instructor day view, phone agenda, drag to reschedule
- [x] Recurring lessons — weekly, up to 12 weeks, clashes skipped (P1)
- [x] Owner dashboard with real KPIs: revenue this month vs last, balances, active students, top instructor (P1)
- [x] Vehicle insurance / registration / service alerts from real dates (P1)
- [x] Printable receipts + WhatsApp receipt (P1)
- [x] Full data export: students, lessons, payments as CSV (P1)
- [x] WhatsApp reminders: tomorrow's lessons, exams this week, balances — one tap each (partial P1: manual send, no gateway)
- [x] Flaky-internet handling: quiet retry with backoff, offline banner, refetch on reconnect (P1)
- [x] Instructor: one-tap complete / no-show, editable skill scores and notes
- [x] Student: next lesson, package ring, readiness, balance, exams, theory tests, cancel own lesson
- [x] Hash URLs (shareable school pages, back button), runtime "Try the demo"
- [x] Android app (Capacitor 8): signed release APK, icons, splash, back button, safe areas

## Still open (from the roadmap)

- [x] Keep-alive: daily GitHub Action pings `keep_alive()` so the free tier doesn't pause the project
- [x] Restore the paused Supabase project + run migrations up to v5 (Nov 20, 2026)
- [ ] Add `SUPABASE_URL` / `SUPABASE_ANON_KEY` as GitHub Actions secrets
- [ ] Tenant isolation test with 2 schools; backups (Supabase Pro) before pilots
- [ ] Netlify deploy + domain; Sentry
- [ ] Data import helper (CSV) for pilots' paper records
- [ ] SMS / WhatsApp gateway (automatic sending)
- [ ] Exam dates for the year (one-click booking into a round)
- [ ] Audit log
- [ ] Albanian review of every string by a native speaker
- [ ] Uploaded student documents (ID, consent) — needs Supabase Storage
- [ ] Persist theory-test results per student
