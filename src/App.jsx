import React from 'react';
import { AppProvider, useApp } from './AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Modal from './components/Modal.jsx';
import Toast from './components/Toast.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Calendar from './pages/Calendar.jsx';
import Students from './pages/Students.jsx';
import Instructors from './pages/Instructors.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Packages from './pages/Packages.jsx';
import Payments from './pages/Payments.jsx';
import Exams from './pages/Exams.jsx';
import Reports from './pages/Reports.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';

import { C } from './data/seed.js';

function Router() {
  const { route } = useApp();
  switch (route) {
    case 'dashboard':     return <Dashboard />;
    case 'calendar':      return <Calendar />;
    case 'students':      return <Students />;
    case 'instructors':   return <Instructors />;
    case 'vehicles':      return <Vehicles />;
    case 'packages':      return <Packages />;
    case 'payments':      return <Payments />;
    case 'exams':         return <Exams />;
    case 'reports':       return <Reports />;
    case 'notifications': return <Notifications />;
    case 'settings':      return <Settings />;
    default:              return <Dashboard />;
  }
}

function AppInner() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: "'Manrope', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.bg }}>
        <Topbar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Router />
        </div>
      </div>
      <Modal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
