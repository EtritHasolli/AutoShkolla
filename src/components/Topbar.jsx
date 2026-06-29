import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from './ui.jsx';
import { C, font } from '../data/seed.js';

const TITLES = ['dashboard', 'calendar', 'students', 'instructors', 'vehicles', 'packages', 'payments', 'exams', 'reports', 'notifications', 'settings'];

export default function Topbar() {
  const { route, selStudent, data, search, setSearch, go, openModal, notifs, T } = useApp();
  const unread = notifs.filter(n => !n.read).length;
  const title = selStudent ? data.students.find(s => s.id === selStudent)?.name : T(route);

  return (
    <div style={{ height: 66, background: C.surf, borderBottom: '1px solid ' + C.line, display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px', flexShrink: 0 }}>
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontFamily: font.disp, fontWeight: 700, fontSize: 20, color: C.ink, letterSpacing: '-.02em' }}>{title}</div>
      </div>
      <div style={{ flex: 1, maxWidth: 420, marginLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.bg, border: '1px solid ' + C.line, borderRadius: 10, padding: '9px 13px', color: C.mut }}>
          <Icon name="search" size={17} sw={1.9} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={T('search')}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13.5, color: C.ink, width: '100%' }}
          />
        </div>
      </div>
      <button onClick={() => go('notifications')} style={{ position: 'relative', border: '1px solid ' + C.line, background: C.surf, color: C.ink2, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="bell" size={19} sw={1.8} />
        {unread > 0 && <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: C.red, border: '2px solid ' + C.surf }} />}
      </button>
      <button onClick={() => openModal({ type: 'lesson', day: 0, hour: 9, studentId: 's1', instructorId: 'i1', vehicleId: 'v1', ltype: 'city' })}
        style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: C.pri, color: '#fff', fontSize: 13.5, fontWeight: 600, padding: '10px 16px', borderRadius: 10, boxShadow: '0 8px 18px -8px ' + C.pri }}>
        <Icon name="plus" size={17} sw={2.2} />
        {T('schedule_lesson')}
      </button>
    </div>
  );
}
