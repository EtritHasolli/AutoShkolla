# DriveFlow – Implementation Plan

## Completed
- ✅ Full-viewport desktop layout (no floating card, no grey wrapper, no prototype bar)
- ✅ TopControls prototype strip removed from App.jsx
- ✅ Sidebar, Topbar, Router, Modal, Toast all wired up
- ✅ All 11 pages implemented: Dashboard, Calendar, Students (+ profile), Instructors, Vehicles, Packages, Payments, Exams, Reports, Notifications, Settings
- ✅ Drag-to-reschedule calendar
- ✅ Modals: new lesson, lesson view, record payment, add student
- ✅ i18n EN/SQ (toggle in Settings)
- ✅ Toast notifications

---

## Next: Login screen + role-based access

### Login screen
- Centered card on a dark gradient background
- DriveFlow logo + tagline
- Email + Password fields (demo — any value works)
- Role selector (all 5 roles shown):
  - Owner, Administrator, Receptionist → desktop shell
  - Instructor, Student → mobile shell
- "Sign in" button → sets `user.role` and `user.device` in context
- File already drafted: `src/pages/Login.jsx` (needs wiring into App.jsx)

### Wiring login into App
In `AppContext.jsx`:
- Add `isLoggedIn: false`, `user: null` to initial state
- Add `login(role, device)` function → sets `isLoggedIn: true`, `user: { role, device }`
- Add `logout()` → resets to `isLoggedIn: false`

In `App.jsx`:
- If `!isLoggedIn` → render `<Login />`
- If `isLoggedIn && user.device === 'desktop'` → render desktop shell (current `<AppInner />`)
- If `isLoggedIn && user.device === 'mobile'` → render `<MobileFrame />`

### Role-based nav visibility
Filter sidebar nav items by role. Both desktop AND mobile exist for all roles — device is separate from role.

| Nav item      | owner | administrator | receptionist |
|---------------|-------|---------------|--------------|
| Dashboard     | ✅    | ✅            | ✅           |
| Calendar      | ✅    | ✅            | ✅           |
| Students      | ✅    | ✅            | ✅           |
| Instructors   | ✅    | ✅            | ❌           |
| Vehicles      | ✅    | ✅            | ❌           |
| Packages      | ✅    | ✅            | ❌           |
| Payments      | ✅    | ✅            | ✅           |
| Exams         | ✅    | ✅            | ✅           |
| Reports       | ✅    | ❌            | ❌           |
| Notifications | ✅    | ✅            | ✅           |
| Settings      | ✅    | ✅            | ❌           |

Mobile role screens (already implemented in MobileFrame.jsx):
- `instructor` → Today / Schedule / My Students / Profile
- `student` → Home / Progress / Payments / Profile

### Action visibility by role
- `receptionist`: hide "Add instructor" button, no vehicle/package management buttons
- `administrator`: no reports page, no settings
- All roles: "Schedule lesson" button always visible

### Files to touch
1. `src/AppContext.jsx` — add `isLoggedIn`, `user`, `login()`, `logout()`
2. `src/App.jsx` — gate on `isLoggedIn`, pick desktop vs mobile shell from `user.device`
3. `src/pages/Login.jsx` — already written, wire `login()` call
4. `src/components/Sidebar.jsx` — filter nav by `role` from context
5. Sidebar logout button → call `logout()` to return to login screen

### Language
- EN/SQ toggle stays in Settings page (already there)
- Default language: `en`

---

## Mobile shell notes
- `MobileFrame.jsx` already implements both instructor + student screens
- When device = mobile: render MobileFrame directly (full viewport, no sidebar/topbar)
- MobileFrame already has its own bottom nav and status bar
