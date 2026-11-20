import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Logo, LogoMark, Avatar, Segmented, Badge } from './ui.jsx';
import { navFor, tabsFor, navLabel, isStaff } from '../lib/nav.js';
import { BRAND } from '../lib/brand.js';

export function LangToggle({ size = 'sm' }) {
  const { lang, setLang } = useApp();
  return <Segmented size={size} value={lang} onChange={setLang} options={[{ v: 'sq', l: 'SQ' }, { v: 'en', l: 'EN' }]} />;
}

/* ------------------------------------------------------------ desktop sidebar */
export function Sidebar() {
  const { route, go, T, role, notifs, school, me, user, logout } = useApp();
  const items = navFor(role).filter(n => !n.hidden);
  const unread = notifs.filter(n => !n.read).length;
  const main = items.filter(n => !n.group);
  const manage = items.filter(n => n.group === 'manage');
  const schoolItems = items.filter(n => n.group === 'school');
  const name = me?.name || user?.name || '';

  const Item = ({ n }) => (
    <button className={'nav-item' + (route === n.key ? ' active' : '')} onClick={() => go(n.key)}>
      <span className="nav-ic"><Icon name={n.icon} size={19} sw={1.9} /></span>
      <span className="truncate">{navLabel(T, role, n.key)}</span>
      {n.key === 'notifications' && unread > 0 && <span className="nav-count">{unread}</span>}
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={36} name={school?.name || BRAND} sub={school?.name ? BRAND : 'Autoshkolla OS'} logo={school?.logo} />
      </div>
      <nav className="sidebar-nav">
        {main.map(n => <Item key={n.key} n={n} />)}
        {manage.length > 0 && <div className="sidebar-section">{T('nav_manage')}</div>}
        {manage.map(n => <Item key={n.key} n={n} />)}
        {schoolItems.length > 0 && <div className="sidebar-section">{T('nav_school')}</div>}
        {schoolItems.map(n => <Item key={n.key} n={n} />)}
      </nav>
      <div className="sidebar-foot">
        <div className="row" style={{ padding: '4px 6px', gap: 10 }}>
          <button className="row btn-ghost" onClick={() => go('profile')} style={{ border: 0, background: 'transparent', padding: 4, borderRadius: 10, flex: 1, minWidth: 0, gap: 10, textAlign: 'left' }}>
            <Avatar name={name || '?'} size={34} />
            <div style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>{name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{T(role === 'instructor' ? 'role_instructor' : role === 'student' ? 'role_student' : role)}</div>
            </div>
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" title={T('logout')} onClick={logout}><Icon name="logout" size={17} /></button>
        </div>
      </div>
    </aside>
  );
}

/* --------------------------------------------------------------- global search */
function GlobalSearch() {
  const { data, T, openStudent, role, me } = useApp();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const pool = role === 'instructor' ? data.students.filter(s => s.instructorId === me.id) : data.students;
  const qq = q.trim().toLowerCase();
  const hits = qq ? pool.filter(s => s.name.toLowerCase().includes(qq) || (s.phone || '').replace(/\s/g, '').includes(qq.replace(/\s/g, ''))).slice(0, 7) : [];
  return (
    <div ref={box} style={{ position: 'relative', width: 340, maxWidth: '36vw' }}>
      <div className="input-icon has-left">
        <span className="ic"><Icon name="search" size={17} sw={2} /></span>
        <input className="input" style={{ height: 38, background: 'var(--surface-2)' }} value={q} placeholder={T('search_students')}
          onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' && hits[0]) { openStudent(hits[0].id); setQ(''); setOpen(false); } }} />
      </div>
      {open && qq && (
        <div className="menu" style={{ top: 44, left: 0, right: 0 }}>
          {hits.length ? hits.map(s => (
            <button key={s.id} className="menu-item" onClick={() => { openStudent(s.id); setQ(''); setOpen(false); }}>
              <Avatar name={s.name} size={28} />
              <div style={{ minWidth: 0 }}>
                <div className="truncate" style={{ fontWeight: 600 }}>{s.name}</div>
                <div className="muted truncate" style={{ fontSize: 12 }}>{s.phone || '—'}</div>
              </div>
            </button>
          )) : <div className="muted" style={{ padding: '10px 12px', fontSize: 13 }}>{T('no_match')}</div>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------ topbar */
export function Topbar({ mobile }) {
  const { route, selStudent, data, T, role, notifs, go, openModal, closeStudent, school, me, user } = useApp();
  const unread = notifs.filter(n => !n.read).length;
  const student = selStudent ? data.students.find(s => s.id === selStudent) : null;
  const title = student ? student.name : navLabel(T, role, route);
  const staff = isStaff(role);

  if (mobile) {
    return (
      <header className="topbar">
        {student ? (
          <button className="btn btn-ghost btn-icon" onClick={closeStudent} aria-label={T('back')} style={{ marginLeft: -8 }}><Icon name="chevL" size={22} /></button>
        ) : (
          <LogoMark size={32} logo={school?.logo} />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="topbar-title">{title}</div>
          {!student && school?.name && <div className="topbar-sub truncate">{school.name}</div>}
        </div>
        {staff && (
          <button className="btn btn-ghost btn-icon" onClick={() => go('notifications')} style={{ position: 'relative' }} aria-label={T('notifications')}>
            <Icon name="bell" size={21} />
            {unread > 0 && <span style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 0 2px #fff' }} />}
          </button>
        )}
        <button onClick={() => go('profile')} style={{ border: 0, background: 'none', padding: 0 }} aria-label={T('profile')}>
          <Avatar name={me?.name || user?.name || '?'} size={34} />
        </button>
      </header>
    );
  }

  return (
    <header className="topbar">
      {student ? (
        <button className="btn btn-ghost btn-sm" onClick={closeStudent} style={{ marginLeft: -10 }}><Icon name="chevL" size={17} />{T('students')}</button>
      ) : (
        <div className="topbar-title">{title}</div>
      )}
      {role !== 'student' && <div style={{ marginLeft: 12 }}><GlobalSearch /></div>}
      <div className="spacer" />
      <LangToggle />
      {staff && (
        <button className="btn btn-secondary btn-icon" onClick={() => go('notifications')} style={{ position: 'relative' }} title={T('notifications')}>
          <Icon name="bell" size={18} />
          {unread > 0 && <span style={{ position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 0 2px #fff' }} />}
        </button>
      )}
      {staff && (
        <button className="btn btn-primary" onClick={() => openModal({ type: 'lesson' })}>
          <Icon name="plus" size={17} sw={2.2} />{T('schedule_lesson')}
        </button>
      )}
    </header>
  );
}

/* ---------------------------------------------------------------- phone tab bar */
export function TabBar() {
  const { route, go, role, T, sheet, setSheet, notifs } = useApp();
  const { tabs, more } = tabsFor(role);
  const unread = notifs.filter(n => !n.read).length;
  const moreActive = sheet === 'more' || more.some(m => m.key === route);
  return (
    <nav className="tabbar">
      {tabs.map(n => (
        <button key={n.key} className={'tab' + (route === n.key && sheet !== 'more' ? ' active' : '')} onClick={() => go(n.key)}>
          <Icon name={n.icon} size={23} sw={route === n.key ? 2.1 : 1.8} />
          <span>{navLabel(T, role, n.key, true)}</span>
        </button>
      ))}
      {more.length > 0 && (
        <button className={'tab' + (moreActive ? ' active' : '')} onClick={() => setSheet(sheet === 'more' ? null : 'more')}>
          <Icon name="grid" size={23} sw={1.8} />
          <span>{T('more')}</span>
          {unread > 0 && isStaff(role) && <span className="tab-dot">{unread}</span>}
        </button>
      )}
    </nav>
  );
}

function BottomSheet({ onClose, children, title }) {
  return (
    <div className="overlay sheetable" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 150 }}>
      <div className="dialog" style={{ paddingBottom: 'calc(10px + var(--safe-bottom))' }}>
        <div className="sheet-handle" />
        {title && <div className="dialog-head" style={{ paddingBottom: 6 }}><div className="dialog-title">{title}</div></div>}
        <div className="dialog-body" style={{ paddingTop: 6 }}>{children}</div>
      </div>
    </div>
  );
}

const sheetTile = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 6px', border: '1px solid var(--line)', borderRadius: 16, background: 'var(--surface)', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', position: 'relative' };

export function MoreSheet() {
  const { role, T, go, setSheet, logout, notifs, route } = useApp();
  const { more } = tabsFor(role);
  const unread = notifs.filter(n => !n.read).length;
  return (
    <BottomSheet onClose={() => setSheet(null)} title={T('more')}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {more.filter(n => !n.hidden).map(n => (
          <button key={n.key} style={{ ...sheetTile, borderColor: route === n.key ? 'var(--brand)' : 'var(--line)', color: route === n.key ? 'var(--brand-700)' : 'var(--ink-2)' }} onClick={() => go(n.key)}>
            <Icon name={n.icon} size={24} sw={1.8} />
            <span className="truncate" style={{ maxWidth: '100%' }}>{navLabel(T, role, n.key)}</span>
            {n.key === 'notifications' && unread > 0 && <span className="nav-count" style={{ position: 'absolute', top: 8, right: 8 }}>{unread}</span>}
          </button>
        ))}
        <button style={sheetTile} onClick={() => go('profile')}><Icon name="user" size={24} sw={1.8} />{T('profile')}</button>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 16, padding: '12px 2px 0', borderTop: '1px solid var(--line-2)' }}>
        <div className="row" style={{ gap: 8 }}><Icon name="globe" size={18} /><span style={{ fontWeight: 600 }}>{T('language')}</span></div>
        <LangToggle size="md" />
      </div>
      <button className="btn btn-danger-soft btn-block" style={{ marginTop: 14 }} onClick={logout}><Icon name="logout" size={17} />{T('logout')}</button>
    </BottomSheet>
  );
}

export function QuickSheet() {
  const { T, setSheet, openModal } = useApp();
  const items = [
    ['calendar', 'new_lesson', { type: 'lesson' }, 'brand'],
    ['euro', 'record_payment', { type: 'payment' }, 'green'],
    ['students', 'add_student', { type: 'student' }, 'violet'],
    ['exams', 'schedule_exam', { type: 'exam' }, 'amber'],
  ];
  return (
    <BottomSheet onClose={() => setSheet(null)} title={T('quick_actions')}>
      <div className="stack" style={{ gap: 8 }}>
        {items.map(([ic, k, m, tone]) => (
          <button key={k} className="row-item card" style={{ borderRadius: 14, border: '1px solid var(--line)', padding: '12px 14px' }} onClick={() => openModal(m)}>
            <span className={'ic-tile tone-' + tone}><Icon name={ic} size={19} sw={2} /></span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{T(k)}</span>
            <span className="spacer" />
            <Icon name="chevR" size={18} style={{ color: 'var(--soft)' }} />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

/* ------------------------------------------------------------- banners & toast */
export function Banners() {
  const { isDemo, hasBackend, online, T, logout, isLoggedIn } = useApp();
  return (
    <>
      {!online && <div className="banner banner-offline"><Icon name="wifiOff" size={17} />{T('offline_banner')}</div>}
      {isDemo && isLoggedIn && (
        <div className="banner banner-demo">
          <Icon name="sparkle" size={16} />
          <span className="truncate" style={{ flex: 1 }}>{T('demo_banner')}</span>
          {hasBackend && <button className="btn btn-sm btn-secondary" onClick={logout}>{T('exit_demo')}</button>}
        </div>
      )}
    </>
  );
}

export function Toast({ withTabbar }) {
  const { toast } = useApp();
  if (!toast) return null;
  const color = toast.tone === 'error' ? '#ff8a8a' : toast.tone === 'warn' ? '#fbbf24' : '#4ade80';
  return (
    <div key={toast.id} className={'toast' + (withTabbar ? ' with-tabbar' : '')} role="status">
      <span style={{ color, display: 'flex' }}><Icon name={toast.tone === 'error' ? 'alert' : toast.tone === 'warn' ? 'info' : 'checkCircle'} size={18} sw={2.2} /></span>
      <span>{toast.msg}</span>
    </div>
  );
}

export function DemoBadge() {
  const { isDemo, T } = useApp();
  return isDemo ? <Badge tone="accent">Demo</Badge> : null;
}
