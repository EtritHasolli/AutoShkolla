import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from './ui.jsx';
import { C, font } from '../data/seed.js';

const NAV = [
  ['dashboard', 'dashboard'], ['calendar', 'calendar'], ['students', 'students'],
  ['instructors', 'instructors'], ['vehicles', 'vehicles'], ['packages', 'packages'],
  ['payments', 'payments'], ['exams', 'exams'], ['reports', 'reports'], ['notifications', 'notifications'],
];

export default function Sidebar() {
  const { route, go, T, notifs, role, showToast } = useApp();
  const unread = notifs.filter(n => !n.read).length;

  function NavItem({ routeKey, icon }) {
    const active = route === routeKey;
    const badge = routeKey === 'notifications' && unread ? unread : null;
    return (
      <button onClick={() => go(routeKey)} style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none',
        background: active ? C.sideActive : 'transparent',
        color: active ? '#fff' : C.sideMut,
        padding: '10px 13px', borderRadius: 10, fontSize: 13.5, fontWeight: active ? 600 : 500,
        position: 'relative', transition: 'all .14s', textAlign: 'left',
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

  return (
    <div style={{ width: 248, background: C.side, display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '18px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 8px 18px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 6px 16px -4px rgba(42,111,219,.6)' }}>
          <Icon name="car2" size={20} sw={2} />
        </div>
        <div>
          <div style={{ color: '#fff', fontFamily: font.disp, fontWeight: 700, fontSize: 17, letterSpacing: '-.02em' }}>DriveFlow</div>
          <div style={{ color: C.sideMut, fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em', marginTop: -1 }}>Autoshkolla OS</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto', marginTop: 4 }}>
        {NAV.map(([r, ic]) => <NavItem key={r} routeKey={r} icon={ic} />)}
      </div>

      <div style={{ borderTop: '1px solid ' + C.sideLine, paddingTop: 12, marginTop: 8 }}>
        <NavItem routeKey="settings" icon="settings" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 10px 4px', marginTop: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2a6fdb,#6557d1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, fontFamily: font.disp }}>
            AK
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Astrit Kuçi</div>
            <div style={{ color: C.sideMut, fontSize: 11.5 }}>{T(role)}</div>
          </div>
          <button onClick={() => showToast('Logged out (demo)')} style={{ border: 'none', background: 'transparent', color: C.sideMut, display: 'flex', padding: 4 }}>
            <Icon name="logout" size={17} sw={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
