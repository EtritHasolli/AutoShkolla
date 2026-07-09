import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from './ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import { BOTTOM_NAV_ROLES } from './Sidebar.jsx';

export default function Topbar() {
  const { route, selStudent, data, search, setSearch, go, openModal, notifs, role, setDrawerOpen, T } = useApp();
  const isMobile = useIsMobile();
  const unread = notifs.filter(n => !n.read).length;
  const title = selStudent ? data.students.find(s => s.id === selStudent)?.name : T(route);
  const usesBottomNav = BOTTOM_NAV_ROLES.includes(role);
  const showHamburger = isMobile && !usesBottomNav;
  const canSchedule = ['owner', 'administrator', 'receptionist'].includes(role);

  return (
    <div style={{ minHeight: 66, background: C.surf, borderBottom: '1px solid ' + C.line, display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '0 14px' : '0 26px', flexShrink: 0 }}>
      {showHamburger && (
        <button className="df-ghost" onClick={() => setDrawerOpen(true)} style={{ border: '1px solid ' + C.line, background: C.surf, color: C.ink2, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
          <Icon name="menu" size={20} sw={2} />
        </button>
      )}

      <div style={{ flex: '0 1 auto', minWidth: 0 }}>
        <div style={{ fontFamily: font.disp, fontWeight: 700, fontSize: isMobile ? 17 : 20, color: C.ink, letterSpacing: '-.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      </div>

      {/* Search — hidden on mobile to save space */}
      {!isMobile && (
        <div style={{ width: 360, maxWidth: '38%', marginLeft: 8 }}>
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
      )}

      <div style={{ flex: 1 }} />

      <button className="df-ghost" onClick={() => go('notifications')} style={{ position: 'relative', border: '1px solid ' + C.line, background: C.surf, color: C.ink2, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
        <Icon name="bell" size={19} sw={1.8} />
        {unread > 0 && <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: C.red, border: '2px solid ' + C.surf }} />}
      </button>

      {canSchedule && (
        <button onClick={() => openModal({ type: 'lesson', day: 0, hour: 9, studentId: data.students[0]?.id, instructorId: data.instructors[0]?.id, vehicleId: data.vehicles[0]?.id, ltype: 'city' })}
          style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: C.pri, color: '#fff', fontSize: 13.5, fontWeight: 600, padding: isMobile ? '10px 12px' : '10px 16px', borderRadius: 10, boxShadow: '0 8px 18px -8px ' + C.pri, flexShrink: 0, cursor: 'pointer' }}>
          <Icon name="plus" size={17} sw={2.2} />
          {!isMobile && T('schedule_lesson')}
        </button>
      )}
    </div>
  );
}
