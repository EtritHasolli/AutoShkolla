import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Stat, Badge, Button, Input, Segmented, Choices, Field, Ring, Logo, Avatar, Icon, Empty, KV, PageHeader, schoolTone } from '../components/ui.jsx';
import { Banners, Toast, LangToggle } from '../components/Shell.jsx';
import { euro, fmtDate, monthShort } from '../lib/format.js';
import { PLANS } from '../lib/brand.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

function SchoolsTable({ onOpen }) {
  const { platform, T } = useApp();
  const mobile = useIsMobile(860);
  const [q, setQ] = useState('');
  const [plan, setPlan] = useState('all');
  const list = platform.schools.filter(s => (plan === 'all' || s.plan === plan) && (!q || (s.name + ' ' + s.city).toLowerCase().includes(q.toLowerCase())));
  return (
    <Card flush title={T('schools_title')} extra={
      <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {!mobile && <Segmented size="sm" value={plan} onChange={setPlan} options={[{ v: 'all', l: T('all') }, ...PLANS.map(p => ({ v: p.id, l: p.id }))]} />}
        <div style={{ width: 180 }}><Input icon="search" value={q} onChange={e => setQ(e.target.value)} placeholder={T('search')} style={{ height: 34 }} /></div>
      </div>}>
      {!list.length ? <Empty icon="search" title={T('no_match')} /> : mobile ? list.map(s => (
        <button key={s.id} className="row-item" onClick={() => onOpen(s.id)}>
          <Avatar name={s.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}><div className="row-title">{s.name}</div><div className="row-sub">{s.city} · {s.plan} · {euro(s.mrr)}</div></div>
          <Badge tone={schoolTone(s.status)} dot>{T(s.status)}</Badge>
        </button>
      )) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{T('school_name')}</th><th>{T('city')}</th><th>{T('stat_students')}</th><th>{T('stat_instructors')}</th><th>{T('pass_rate')}</th><th>{T('plan')}</th><th>MRR</th><th>{T('status')}</th></tr></thead>
            <tbody>
              {list.map(s => (
                <tr key={s.id} className="clickable" onClick={() => onOpen(s.id)}>
                  <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{s.name}</td>
                  <td>{s.city}</td><td className="tnum">{s.students}</td><td className="tnum">{s.instructors}</td>
                  <td className="tnum">{s.examPassRate}%</td><td>{s.plan}</td>
                  <td className="tnum" style={{ fontWeight: 600 }}>{euro(s.mrr)}</td>
                  <td><Badge tone={schoolTone(s.status)} dot>{T(s.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function Overview({ onOpen }) {
  const { platform, T, lang } = useApp();
  const S = platform.schools;
  const tot = useMemo(() => ({
    schools: S.length, active: S.filter(s => s.status === 'active').length,
    students: S.reduce((a, s) => a + s.students, 0), instructors: S.reduce((a, s) => a + s.instructors, 0),
    lessons: S.reduce((a, s) => a + s.lessonsThisMonth, 0), mrr: S.reduce((a, s) => a + s.mrr, 0),
    pass: Math.round(S.reduce((a, s) => a + s.examPassRate, 0) / (S.length || 1)),
  }), [S]);
  const maxT = Math.max(1, ...platform.trend.map(t => t.schools));
  return (
    <>
      <PageHeader title={T('platform_overview')} sub={T('platform_sub')} />
      <div className="grid-4" style={{ marginBottom: 14 }}>
        <Stat label={T('total_schools')} value={tot.schools} sub={T('n_active', { n: tot.active })} icon="building" tone="brand" />
        <Stat label={T('stat_students')} value={tot.students} sub={tot.instructors + ' ' + T('stat_instructors').toLowerCase()} icon="students" tone="violet" />
        <Stat label={T('mrr')} value={euro(tot.mrr)} sub={T('arr') + ': ' + euro(tot.mrr * 12)} icon="euro" tone="green" />
        <Stat label={T('lessons_this_month')} value={tot.lessons.toLocaleString('de-DE')} sub={T('avg_pass') + ': ' + tot.pass + '%'} icon="calendar" tone="teal" />
      </div>
      <div className="grid-main" style={{ marginBottom: 16 }}>
        <Card title={T('growth')} sub={T('growth_sub')}>
          <div className="row" style={{ alignItems: 'flex-end', gap: 2, height: 150, paddingTop: 18 }}>
            {platform.trend.map((t, k) => (
              <div key={k} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                {k === platform.trend.length - 1 && <span className="tnum" style={{ fontSize: 12, fontWeight: 700 }}>{t.schools}</span>}
                <div title={`${monthShort(t.m, lang)}: ${t.schools}`} style={{ width: '60%', maxWidth: 44, height: Math.max(3, t.schools / maxT * 110), background: 'var(--brand)', borderRadius: '4px 4px 0 0' }} />
              </div>
            ))}
          </div>
          <div className="row" style={{ gap: 2, borderTop: '1px solid var(--line)', paddingTop: 6 }}>
            {platform.trend.map((t, k) => <div key={k} className="muted" style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600 }}>{monthShort(t.m, lang)}</div>)}
          </div>
        </Card>
        <Card title={T('plan_breakdown')}>
          <div className="stack" style={{ gap: 14 }}>
            {PLANS.map(p => {
              const n = S.filter(s => s.plan === p.id).length;
              return (
                <div key={p.id}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5 }}><b>{p.id}</b><span className="muted">{n} · {Math.round(n / (S.length || 1) * 100)}%</span></div>
                  <div className="progress" style={{ height: 8 }}><span style={{ width: (n / (S.length || 1) * 100) + '%', background: 'var(--brand)' }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <SchoolsTable onOpen={onOpen} />
    </>
  );
}

function SchoolDetail({ id, onBack }) {
  const { platform, T, lang, updateSchoolAdmin } = useApp();
  const s = platform.schools.find(x => x.id === id);
  const [f, setF] = useState(() => ({ status: s?.status, plan: s?.plan, mrr: s?.mrr ?? 0 }));
  if (!s) return null;
  return (
    <>
      <Button variant="ghost" size="sm" icon="chevL" onClick={onBack} style={{ marginLeft: -8, marginBottom: 12 }}>{T('back_overview')}</Button>
      <div className="row" style={{ gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <Avatar name={s.name} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}><h1 className="page-title">{s.name}</h1><Badge tone={schoolTone(s.status)} dot>{T(s.status)}</Badge></div>
          <div className="muted">{s.city} · {T('business_no')} <span className="mono">{s.bizNumber}</span> · {T('joined')} {fmtDate(s.joined, lang)}</div>
        </div>
      </div>
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Stat label={T('stat_students')} value={s.students} sub={T('n_active', { n: s.activeStudents })} icon="students" tone="violet" />
        <Stat label={T('stat_instructors')} value={s.instructors} icon="instructors" tone="brand" />
        <Stat label={T('stat_vehicles')} value={s.vehicles} icon="car" tone="teal" />
        <Stat label={T('lessons_this_month')} value={s.lessonsThisMonth} icon="calendar" tone="green" />
      </div>
      <div className="grid-main">
        <Card title={T('admin_actions')}>
          <Field label={T('status')}><Choices value={f.status} onChange={v => setF(x => ({ ...x, status: v }))} options={['trial', 'active', 'suspended'].map(v => ({ v, l: T(v) }))} /></Field>
          <Field label={T('plan')}><Choices value={f.plan} onChange={v => setF(x => ({ ...x, plan: v, mrr: x.status === 'active' ? PLANS.find(p => p.id === v).monthly : x.mrr }))} options={PLANS.map(p => ({ v: p.id, l: p.id }))} /></Field>
          <Field label="MRR (€)"><Input type="number" min="0" value={f.mrr} onChange={e => setF(x => ({ ...x, mrr: Number(e.target.value) || 0 }))} /></Field>
          <Button variant="primary" icon="check" onClick={() => updateSchoolAdmin(s.id, f)}>{T('save')}</Button>
        </Card>
        <div className="stack">
          <Card title={T('pass_rate')}>
            <div className="row" style={{ gap: 18 }}>
              <Ring pct={s.examPassRate} size={88} color={s.examPassRate >= 70 ? 'var(--green)' : 'var(--amber)'}><b style={{ fontSize: 18 }}>{s.examPassRate}%</b></Ring>
              <div className="muted">{T('exams_month', { n: s.examsThisMonth })}<br />{T('categories')}: <b style={{ color: 'var(--ink-2)' }}>{(s.cats || []).join(', ')}</b></div>
            </div>
          </Card>
          <Card title={T('billing')}>
            <KV label="MRR" value={euro(s.mrr)} />
            <KV label={T('revenue_ytd')} value={euro(s.revenueYtd)} />
            <KV label={T('last_active')} value={fmtDate(s.lastActive, lang)} />
          </Card>
        </div>
      </div>
    </>
  );
}

export default function SuperAdmin() {
  const { T, user, logout, isDevAccount, devSwitchView, isDemo } = useApp();
  const mobile = useIsMobile(1023);
  const [nav, setNav] = useState('overview');
  const [openId, setOpenId] = useState(null);
  const open = (id) => { setOpenId(id); setNav('schools'); };
  const navItems = [['overview', 'dashboard', T('overview_nav')], ['schools', 'building', T('schools_title')]];

  const content = (
    <div className="page">
      {nav === 'overview' && <Overview onOpen={open} />}
      {nav === 'schools' && (openId ? <SchoolDetail key={openId} id={openId} onBack={() => setOpenId(null)} /> : <><PageHeader title={T('schools_title')} sub={T('platform_sub')} /><SchoolsTable onOpen={open} /></>)}
    </div>
  );

  return (
    <div className="app">
      {!mobile && (
        <aside className="sidebar">
          <div className="sidebar-brand"><Logo size={36} sub="Super admin" /></div>
          <nav className="sidebar-nav">
            {navItems.map(([k, ic, l]) => (
              <button key={k} className={'nav-item' + (nav === k ? ' active' : '')} onClick={() => { setNav(k); setOpenId(null); }}>
                <span className="nav-ic"><Icon name={ic} size={19} /></span>{l}
              </button>
            ))}
            {(isDevAccount || isDemo) && (
              <>
                <div className="sidebar-section">{T('view_as')}</div>
                {[['owner', 'owner'], ['instructor', 'role_instructor'], ['student', 'role_student']].map(([v, k]) => (
                  <button key={v} className="nav-item" onClick={() => devSwitchView(v)}><span className="nav-ic"><Icon name="eye" size={18} /></span>{T(k)}</button>
                ))}
              </>
            )}
          </nav>
          <div className="sidebar-foot">
            <div className="row" style={{ gap: 10, padding: '4px 6px' }}>
              <Avatar name={user?.name || 'Admin'} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}><div className="truncate" style={{ fontWeight: 600, fontSize: 13.5 }}>Platform admin</div><div className="muted truncate" style={{ fontSize: 12 }}>{user?.email}</div></div>
              <Button size="sm" variant="ghost" icon="logout" title={T('logout')} onClick={logout} />
            </div>
          </div>
        </aside>
      )}
      <div className="app-main">
        <Banners />
        {mobile ? (
          <header className="topbar">
            <Logo size={30} sub="Super admin" />
            <span className="spacer" />
            <LangToggle />
            <Button size="sm" variant="ghost" icon="logout" onClick={logout} />
          </header>
        ) : (
          <header className="topbar"><div className="topbar-title">{navItems.find(n => n[0] === nav)[2]}</div><span className="spacer" /><LangToggle /></header>
        )}
        {mobile && (
          <div style={{ padding: '10px 16px 0' }}>
            <Segmented value={nav} onChange={v => { setNav(v); setOpenId(null); }} options={navItems.map(([k, , l]) => ({ v: k, l }))} />
          </div>
        )}
        <main className="app-scroll">{content}</main>
      </div>
      <Toast />
    </div>
  );
}
