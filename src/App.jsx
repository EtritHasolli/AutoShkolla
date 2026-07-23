import React from 'react';
import { AppProvider, useApp } from './AppContext.jsx';
import Sidebar, { BottomNav, BOTTOM_NAV_ROLES } from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Modal from './components/Modal.jsx';
import Toast from './components/Toast.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Landing from './pages/Landing.jsx';
import SuperAdmin from './pages/SuperAdmin.jsx';
import { useIsMobile } from './hooks/useMediaQuery.js';

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

import { C } from './data/seed.js';

function RoleDashboard() {
  const { role } = useApp();
  if (role === 'instructor') return <InstructorDashboard />;
  if (role === 'student') return <StudentDashboard />;
  return <Dashboard />;
}

function Router() {
  const { route } = useApp();
  switch (route) {
    case 'dashboard':     return <RoleDashboard />;
    case 'calendar':      return <Calendar />;
    case 'students':      return <Students />;
    case 'instructors':   return <Instructors />;
    case 'vehicles':      return <Vehicles />;
    case 'packages':      return <Packages />;
    case 'payments':      return <Payments />;
    case 'exams':         return <Exams />;
    case 'courses':       return <Courses />;
    case 'reports':       return <Reports />;
    case 'notifications': return <Notifications />;
    case 'settings':      return <Settings />;
    default:              return <Dashboard />;
  }
}

function AppInner() {
  const { role } = useApp();
  const isMobile = useIsMobile();
  const usesBottomNav = BOTTOM_NAV_ROLES.includes(role);
  const showBottomNav = isMobile && usesBottomNav;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Manrope', sans-serif" }}>
      {/* Static sidebar on desktop */}
      <Sidebar />
      {/* Drawer overlay on mobile (hamburger roles) */}
      <Sidebar asDrawer />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.bg }}>
        <Topbar />
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Router />
        </div>
        {showBottomNav && <BottomNav />}
      </div>
      <Modal />
      <Toast />
    </div>
  );
}

function Shell() {
  const { isLoggedIn, portal, authScreen } = useApp();
  if (!isLoggedIn) {
    // Pre-auth screens render directly under #root (which is overflow:hidden),
    // so give them their own scroll container.
    let screen;
    if (authScreen === 'signup') screen = <Signup />;
    else if (authScreen === 'login') screen = <Login />;
    else screen = <Landing />;
    return (
      <div style={{ height: '100vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {screen}
      </div>
    );
  }
  if (portal === 'superadmin') return <SuperAdmin />;
  return <AppInner />;
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
