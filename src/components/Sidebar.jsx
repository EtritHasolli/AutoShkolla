import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from './ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

// roles that may see each nav item
const NAV = [
  ['dashboard', 'dashboard', ['owner', 'administrator', 'receptionist', 'instructor', 'student']],
  ['calendar', 'calendar', ['owner', 'administrator', 'receptionist', 'instructor']],
  ['students', 'students', ['owner', 'administrator', 'receptionist', 'instructor']],
  ['instructors', 'instructors', ['owner', 'administrator']],
  ['vehicles', 'vehicles', ['owner', 'administrator']],
  ['packages', 'packages', ['owner', 'administrator']],
  ['payments', 'payments', ['owner', 'administrator', 'receptionist', 'student']],
  ['exams', 'exams', ['owner', 'administrator', 'receptionist', 'student']],
  ['courses', 'courses', ['owner', 'administrator', 'instructor', 'student']],
  ['reports', 'reports', ['owner']],
  ['notifications', 'notifications', ['owner', 'administrator', 'receptionist']],
];

const SETTINGS_ROLES = ['owner', 'administrator'];

// Roles that use the mobile bottom-nav (few tabs) instead of a hamburger drawer.
export const BOTTOM_NAV_ROLES = ['instructor', 'student'];

export function roleNav(role) {
  return NAV.filter(([, , roles]) => roles.includes(role));
}

/* ============================================================= */
/* DESKTOP / DRAWER SIDEBAR                                       */
/* ============================================================= */
export default function Sidebar({ asDrawer = false }) {
  const { route, go, T, notifs, role, me, school, logout, drawerOpen, setDrawerOpen } = useApp();
  const isMobile = useIsMobile();
  const unread = notifs.filter(n => !n.read).length;
  const navItems = roleNav(role);
  const showSettings = SETTINGS_ROLES.includes(role);
  const myName = me.name || 'Astrit Kuçi';
  const initials = myName.split(' ').map(w => w[0]).slice(0, 2).join('');

  function NavItem({ routeKey, icon }) {
    const active = route === routeKey;
    const badge = routeKey === 'notifications' && unread ? unread : null;
    return (
      <button onClick={() => go(routeKey)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none',
        background: active ? C.sideActive : 'transparent',
        color: active ? '#fff' : C.sideMut,
        padding: '10px 13px', borderRadius: 10, fontSize: 13.5, fontWeight: active ? 600 : 500,
        position: 'relative', transition: 'all .14s', textAlign: 'left', cursor: 'pointer',
      }}>
        <span style={{ color: active ? '#62a0ff' : C.sideMut, display: 'flex' }}>
          <Icon name={icon} size={18} sw={1.9} />
        </span>
        <span style={{ flex: 1 }}>{T(routeKey)}</span>
        {badge ? (
          <span style={{ background: C.red, color: '#fff', fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
            {badge}
          </span>
        ) : null}
        {active ? <span style={{ position: 'absolute', left: 0, top: 9, bottom: 9, width: 3, background: '#62a0ff', borderRadius: 3 }} /> : null}
      </button>
    );
  }

  const panel = (
    <div style={{ width: 248, maxWidth: '82vw', height: '100%', background: C.side, display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '18px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 8px 18px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 16px -4px rgba(42,111,219,.6)', overflow: 'hidden' }}>
          {school?.logo
            ? <img src={school.logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Icon name="car2" size={20} sw={2} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontFamily: font.disp, fontWeight: 700, fontSize: school?.name && school.name.length > 14 ? 14 : 17, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{school?.name || 'DriveFlow'}</div>
          <div style={{ color: C.sideMut, fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em', marginTop: -1 }}>{school?.name ? 'DriveFlow' : 'Autoshkolla OS'}</div>
        </div>
        {asDrawer && (
          <button onClick={() => setDrawerOpen(false)} style={{ border: 'none', background: 'transparent', color: C.sideMut, display: 'flex', padding: 4, cursor: 'pointer' }}>
            <Icon name="x" size={20} sw={2} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto', marginTop: 4 }}>
        {navItems.map(([r, ic]) => <NavItem key={r} routeKey={r} icon={ic} />)}
      </div>

      <div style={{ borderTop: '1px solid ' + C.sideLine, paddingTop: 12, marginTop: 8 }}>
        {showSettings && <NavItem routeKey="settings" icon="settings" />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 10px 4px', marginTop: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, fontFamily: font.disp }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{myName}</div>
            <div style={{ color: C.sideMut, fontSize: 11.5 }}>{T(role)}</div>
          </div>
          <button onClick={logout} style={{ border: 'none', background: 'transparent', color: C.sideMut, display: 'flex', padding: 4, cursor: 'pointer' }}>
            <Icon name="logout" size={17} sw={1.8} />
          </button>
        </div>
      </div>
    </div>
  );

  // Drawer overlay on mobile
  if (asDrawer) {
    if (!drawerOpen) return null;
    return (
      <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(8,12,20,.5)', backdropFilter: 'blur(2px)', display: 'flex', animation: 'df-fade .18s' }}>
        <div onClick={e => e.stopPropagation()} style={{ height: '100%', animation: 'df-drawer .22s cubic-bezier(.2,.8,.2,1)' }}>{panel}</div>
      </div>
    );
  }

  // Static desktop sidebar
  if (isMobile) return null;
  return panel;
}

/* ============================================================= */
/* MOBILE BOTTOM NAV (instructor / student)                      */
/* ============================================================= */
export function BottomNav() {
  const { route, go, role, T, notifs } = useApp();
  const unread = notifs.filter(n => !n.read).length;
  const items = roleNav(role).slice(0, 4); // keep it to ~4 tabs

  return (
    <div style={{ display: 'flex', borderTop: '1px solid ' + C.line, background: C.surf, flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {items.map(([r, ic]) => {
        const active = route === r;
        const badge = r === 'notifications' && unread ? unread : null;
        return (
          <button key={r} onClick={() => go(r)} style={{ flex: 1, border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 0 9px', color: active ? C.pri : C.soft, position: 'relative', cursor: 'pointer' }}>
            <span style={{ position: 'relative', display: 'flex' }}>
              <Icon name={ic} size={22} sw={active ? 2.1 : 1.8} />
              {badge ? <span style={{ position: 'absolute', top: -4, right: -7, background: C.red, color: '#fff', fontSize: 9.5, fontWeight: 700, minWidth: 15, height: 15, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{badge}</span> : null}
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>{T(r)}</span>
          </button>
        );
      })}
    </div>
  );
}
