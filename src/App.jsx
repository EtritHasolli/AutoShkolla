import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AppProvider, useApp } from './AppContext.jsx';
import { Sidebar, Topbar, TabBar, MoreSheet, QuickSheet, Banners, Toast, UpdateBar } from './components/Shell.jsx';
import Modal from './components/Modal.jsx';
import { Icon, LogoMark, Dialog, Field, PasswordInput, Button } from './components/ui.jsx';
import { useIsMobile } from './hooks/useMediaQuery.js';
import { canOpen, isStaff } from './lib/nav.js';
import { initUpdater } from './lib/updater.js';

import Landing from './pages/Landing.jsx';
import SchoolPage from './pages/SchoolPage.jsx';
import Privacy from './pages/Privacy.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import SuperAdmin from './pages/SuperAdmin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import Calendar from './pages/Calendar.jsx';
import Students from './pages/Students.jsx';
import Instructors from './pages/Instructors.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Packages from './pages/Packages.jsx';
import Payments from './pages/Payments.jsx';
import Exams from './pages/Exams.jsx';
import Courses from './pages/Courses.jsx';
import Reports from './pages/Reports.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import Profile from './pages/Profile.jsx';

const PAGES = {
  calendar: Calendar, students: Students, instructors: Instructors, vehicles: Vehicles,
  packages: Packages, payments: Payments, exams: Exams, courses: Courses, reports: Reports,
  notifications: Notifications, settings: Settings, profile: Profile,
};

function Page() {
  const { route, role } = useApp();
  if (route !== 'dashboard' && canOpen(role, route) && PAGES[route]) {
    const P = PAGES[route];
    return <P />;
  }
  if (role === 'instructor') return <InstructorDashboard />;
  if (role === 'student') return <StudentDashboard />;
  return <Dashboard />;
}

function SchoolApp() {
  const { role, sheet, setSheet, route, selStudent } = useApp();
  const mobile = useIsMobile(1023);
  const scrollRef = React.useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, [route, selStudent]);
  const fab = mobile && isStaff(role) && !selStudent && ['dashboard', 'calendar', 'students', 'payments'].includes(route);

  return (
    <div className="app">
      {!mobile && <Sidebar />}
      <div className="app-main">
        <Banners />
        <Topbar mobile={mobile} />
        <main className="app-scroll" ref={scrollRef}><Page /></main>
        {mobile && <TabBar />}
      </div>
      {fab && (
        <button className="fab" onClick={() => setSheet('quick')} aria-label="+"><Icon name="plus" size={26} sw={2.4} /></button>
      )}
      {mobile && sheet === 'more' && <MoreSheet />}
      {mobile && sheet === 'quick' && <QuickSheet />}
      <Modal />
      <UpdateBar withTabbar={mobile} />
      <Toast withTabbar={mobile} />
    </div>
  );
}

function RecoveryDialog() {
  const { T, changePassword, setRecovery } = useApp();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Dialog title={T('set_new_password')} onClose={() => setRecovery(false)} footer={
      <Button variant="primary" loading={busy} disabled={pw.length < 6} onClick={async () => { setBusy(true); await changePassword(pw); setBusy(false); }}>{T('save')}</Button>
    }>
      <p className="muted" style={{ marginBottom: 14 }}>{T('set_new_password_sub')}</p>
      <Field label={T('new_password')} hint={T('min6')}>
        <PasswordInput value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
      </Field>
    </Dialog>
  );
}

function Splash() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-block', animation: 'pulse 1.4s ease infinite' }}><LogoMark size={56} /></div>
      </div>
    </div>
  );
}

// Android hardware back: close overlays first, then walk back through
// screens; on the home screen, send the app to the background.
function useNativeBack() {
  const ctx = useApp();
  const ref = React.useRef(ctx);
  ref.current = ctx;
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let handle;
    import('@capacitor/app').then(({ App }) => {
      handle = App.addListener('backButton', ({ canGoBack }) => {
        const c = ref.current;
        if (c.modal) return c.setModal(null);
        if (c.sheet) return c.setSheet(null);
        if (c.recovery) return c.setRecovery(false);
        const atHome = c.isLoggedIn ? (c.view.screen === 'app' && c.view.route === 'dashboard') : c.view.screen === 'landing';
        if (atHome || !canGoBack) return App.minimizeApp();
        window.history.back();
      });
    });
    return () => { handle?.then?.(h => h.remove()); };
  }, []);
}

function Shell() {
  const { booting, isLoggedIn, portal, view, navigate, recovery } = useApp();
  useNativeBack();

  // Signed-in users skip the login/signup screens.
  useEffect(() => {
    if (isLoggedIn && (view.screen === 'login' || view.screen === 'signup')) navigate({ screen: 'app', route: 'dashboard' }, { replace: true });
  }, [isLoggedIn, view.screen, navigate]);

  if (booting) return <Splash />;

  // Public screens each get their own scroll container (keyed) so moving
  // between them starts at the top.
  const pub = (key, el) => <div className="screen-scroll" key={key}>{el}<UpdateBar /><Toast /></div>;
  let screen;
  if (isLoggedIn && (view.screen === 'app' || view.screen === 'login' || view.screen === 'signup')) {
    screen = portal === 'superadmin' ? <SuperAdmin /> : <SchoolApp />;
  } else if (view.screen === 'app' || view.screen === 'login') {
    screen = pub('login', <Login />);
  } else if (view.screen === 'signup') {
    screen = pub('signup', <Signup />);
  } else if (view.screen === 'privacy') {
    screen = pub('privacy', <Privacy />);
  } else if (view.screen === 'school') {
    screen = pub('school-' + view.schoolId, <SchoolPage />);
  } else {
    screen = pub('landing', <Landing />);
  }
  return (
    <>
      {screen}
      {recovery && isLoggedIn && <RecoveryDialog />}
    </>
  );
}

export default function App() {
  useEffect(() => { initUpdater(); }, []);
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
