import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

/* ---------- helpers ---------- */
function statusStyle(s) {
  if (s === 'active')    return { color: C.grn, bg: C.grnBg, label: 'Active' };
  if (s === 'trial')     return { color: C.amb, bg: C.ambBg, label: 'Trial' };
  if (s === 'suspended') return { color: C.red, bg: C.redBg, label: 'Suspended' };
  return { color: C.mut, bg: C.line2, label: s };
}
const euro = n => Number(n).toLocaleString('de-DE') + '€';
const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtShort = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/* ---------- small UI bits ---------- */
function StatCard({ icon, color, value, label, sub }) {
  return (
    <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={19} sw={1.8} />
        </div>
        <div style={{ fontSize: 12, color: C.mut, fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{ fontFamily: font.disp, fontSize: 27, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.grn, fontWeight: 600, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function MiniBars({ data, accessor, color }) {
  const max = Math.max(...data.map(accessor), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: 92 }}>
            <div style={{ width: '100%', height: (accessor(d) / max * 100) + '%', minHeight: 4, background: color, borderRadius: '6px 6px 0 0', transition: 'height .4s' }} />
          </div>
          <div style={{ fontSize: 11, color: C.mut, fontWeight: 600 }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

function Ring({ pct, color, size = 64 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${color} ${pct}%, ${C.line} 0)` }} />
      <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: C.surf, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ---------- Schools table (shared) ---------- */
function SchoolsTable({ onOpen }) {
  const { platform } = useApp();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filtered = platform.schools.filter(s => {
    const m = s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
    const p = planFilter === 'all' || s.plan === planFilter;
    return m && p;
  });

  return (
    <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid ' + C.line, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: font.disp, fontSize: 16, fontWeight: 700, color: C.ink }}>Driving Schools</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, background: C.bg, padding: 3, borderRadius: 9 }}>
            {['all', 'Pro', 'Starter'].map(p => (
              <button key={p} onClick={() => setPlanFilter(p)} style={{ border: 'none', background: planFilter === p ? C.surf : 'transparent', color: planFilter === p ? C.ink : C.mut, fontSize: 12.5, fontWeight: 600, padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontFamily: font.body, boxShadow: planFilter === p ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', width: '100%', maxWidth: 200 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.mut, display: 'flex' }}><Icon name="search" size={15} sw={2} /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search schools…"
              style={{ border: '1px solid ' + C.line, background: C.bg, color: C.ink, fontSize: 13, padding: '8px 12px 8px 32px', borderRadius: 9, outline: 'none', fontFamily: font.body, width: '100%' }} />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 880 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['School', 'Business no.', 'City', 'Students', 'Instr.', 'Vehicles', 'Pass rate', 'MRR', 'Status'].map(h => (
                <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.mut, letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: '1px solid ' + C.line, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const st = statusStyle(s.status);
              return (
                <tr key={s.id} onClick={() => onOpen(s.id)} style={{ borderBottom: i < filtered.length - 1 ? '1px solid ' + C.line : 'none', cursor: 'pointer', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '13px 18px', fontWeight: 600, color: C.ink, whiteSpace: 'nowrap' }}>{s.name}</td>
                  <td style={{ padding: '13px 18px', color: C.ink2, fontFamily: font.mono, fontSize: 13 }}>{s.bizNumber}</td>
                  <td style={{ padding: '13px 18px', color: C.ink2 }}>{s.city}</td>
                  <td style={{ padding: '13px 18px', color: C.ink2 }}>{s.students}</td>
                  <td style={{ padding: '13px 18px', color: C.ink2 }}>{s.instructors}</td>
                  <td style={{ padding: '13px 18px', color: C.ink2 }}>{s.vehicles}</td>
                  <td style={{ padding: '13px 18px', color: C.ink2 }}>{s.examPassRate}%</td>
                  <td style={{ padding: '13px 18px', color: C.ink2, fontWeight: 600 }}>{euro(s.mrr)}</td>
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, padding: '4px 10px', borderRadius: 7 }}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: C.soft, fontSize: 13 }}>No schools match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Overview page ---------- */
function Overview({ onOpen }) {
  const { platform } = useApp();
  const schools = platform.schools;
  const totals = useMemo(() => {
    const active = schools.filter(s => s.status === 'active');
    return {
      schools: schools.length,
      activeSchools: active.length,
      students: schools.reduce((a, s) => a + s.students, 0),
      instructors: schools.reduce((a, s) => a + s.instructors, 0),
      vehicles: schools.reduce((a, s) => a + s.vehicles, 0),
      lessons: schools.reduce((a, s) => a + s.lessonsThisMonth, 0),
      mrr: schools.reduce((a, s) => a + s.mrr, 0),
      avgPass: Math.round(schools.reduce((a, s) => a + s.examPassRate, 0) / (schools.length || 1)),
    };
  }, [schools]);

  const planCounts = useMemo(() => {
    const c = { Pro: 0, Starter: 0 };
    schools.forEach(s => { c[s.plan] = (c[s.plan] || 0) + 1; });
    return c;
  }, [schools]);

  return (
    <>
      <div style={{ fontFamily: font.disp, fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Platform Overview</div>
      <div style={{ fontSize: 14, color: C.mut, marginBottom: 28 }}>All registered driving schools on DriveFlow</div>

      {/* KPI grid */}
      <div className="df-grid-4" style={{ marginBottom: 16 }}>
        <StatCard icon="dashboard"   color={C.pri}  value={totals.schools}     label="Total schools"    sub={`${totals.activeSchools} active`} />
        <StatCard icon="students"    color={C.grn}  value={totals.students}    label="Total students" />
        <StatCard icon="instructors" color={C.vio}  value={totals.instructors} label="Instructors" />
        <StatCard icon="vehicles"    color={C.teal} value={totals.vehicles}    label="Vehicles" />
      </div>
      <div className="df-grid-4" style={{ marginBottom: 32 }}>
        <StatCard icon="calendar"  color={C.pri}  value={totals.lessons.toLocaleString('de-DE')} label="Lessons this month" />
        <StatCard icon="exams"     color={C.amb}  value={totals.avgPass + '%'} label="Avg. exam pass rate" />
        <StatCard icon="payments"  color={C.grn}  value={euro(totals.mrr)}     label="Monthly recurring rev." />
        <StatCard icon="reports"   color={C.vio}  value={euro(totals.mrr * 12)} label="Annual run rate" />
      </div>

      {/* Charts row */}
      <div className="df-grid-main" style={{ marginBottom: 32 }}>
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '20px 24px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Growth</div>
          <div style={{ fontSize: 12.5, color: C.mut, marginBottom: 18 }}>Schools onboarded over time</div>
          <MiniBars data={platform.trend} accessor={d => d.schools} color={C.pri} />
        </div>
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '20px 24px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 18 }}>Plan breakdown</div>
          {[['Pro', C.pri], ['Starter', C.amb]].map(([plan, col]) => {
            const count = planCounts[plan] || 0;
            const pct = Math.round(count / (totals.schools || 1) * 100);
            return (
              <div key={plan} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: C.ink }}>{plan}</span>
                  <span style={{ color: C.mut, fontWeight: 600 }}>{count} · {pct}%</span>
                </div>
                <div style={{ height: 8, background: C.line, borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ width: pct + '%', height: '100%', background: col, borderRadius: 8 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schools table */}
      <SchoolsTable onOpen={onOpen} />
    </>
  );
}

/* ---------- School detail page ---------- */
function SchoolDetail({ id, onBack }) {
  const { platform } = useApp();
  const s = platform.schools.find(x => x.id === id);
  if (!s) return null;
  const st = statusStyle(s.status);

  return (
    <>
      <button onClick={onBack} style={{ border: 'none', background: 'none', color: C.mut, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 5, fontFamily: font.body }}>
        <Icon name="chevL" size={16} sw={2} /> Back to overview
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 15, background: '#0f9d6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="car2" size={28} sw={1.9} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: font.disp, fontSize: 24, fontWeight: 700, color: C.ink }}>{s.name}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: st.color, background: st.bg, padding: '4px 10px', borderRadius: 7 }}>{st.label}</span>
          </div>
          <div style={{ fontSize: 13.5, color: C.mut, marginTop: 3 }}>{s.city} · Business no. <span style={{ fontFamily: font.mono }}>{s.bizNumber}</span> · Joined {fmtDate(s.joined)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: C.mut, fontWeight: 600 }}>Plan</div>
          <div style={{ fontFamily: font.disp, fontSize: 18, fontWeight: 700, color: s.plan === 'Pro' ? C.pri : C.amb }}>{s.plan}</div>
        </div>
      </div>

      {/* Counts grid */}
      <div className="df-grid-4" style={{ marginBottom: 16 }}>
        <StatCard icon="students"    color={C.grn}  value={s.students}    label="Students"    sub={`${s.activeStudents} active`} />
        <StatCard icon="instructors" color={C.vio}  value={s.instructors} label="Instructors" />
        <StatCard icon="vehicles"    color={C.teal} value={s.vehicles}    label="Vehicles" />
        <StatCard icon="calendar"    color={C.pri}  value={s.lessonsThisMonth} label="Lessons / month" />
      </div>

      <div className="df-grid-2" style={{ marginBottom: 16 }}>
        {/* Exams card */}
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 22 }}>
          <Ring pct={s.examPassRate} color={s.examPassRate >= 70 ? C.grn : C.amb} size={84} />
          <div>
            <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Exam pass rate</div>
            <div style={{ fontSize: 13, color: C.mut }}>{s.examsThisMonth} exams this month</div>
            <div style={{ fontSize: 13, color: C.mut, marginTop: 2 }}>Categories: <span style={{ fontWeight: 600, color: C.ink2 }}>{s.cats.join(', ')}</span></div>
          </div>
        </div>

        {/* Billing card */}
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>Billing</div>
          <div style={{ display: 'flex', gap: 28 }}>
            <div>
              <div style={{ fontSize: 12, color: C.mut, fontWeight: 600, marginBottom: 4 }}>Monthly recurring</div>
              <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.ink }}>{euro(s.mrr)}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.mut, fontWeight: 600, marginBottom: 4 }}>Revenue YTD</div>
              <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.grn }}>{euro(s.revenueYtd)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta strip */}
      <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '8px 24px' }}>
        {[
          ['Business registration number', s.bizNumber],
          ['City', s.city],
          ['License categories', s.cats.join(', ')],
          ['Last active', fmtShort(s.lastActive)],
          ['Subscription plan', s.plan],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid ' + C.line2 : 'none', fontSize: 13.5 }}>
            <span style={{ color: C.mut, fontWeight: 500 }}>{k}</span>
            <span style={{ color: C.ink, fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Shell ---------- */
const NAV = [
  ['overview', 'dashboard', 'Overview'],
  ['schools', 'students', 'Schools'],
];

const DEV_VIEWS = [['owner', 'Owner'], ['instructor', 'Instructor'], ['student', 'Student']];

function SidebarPanel({ nav, setNav, openId, setOpenId, logout, user, onNavigate }) {
  const { isDevSuperadmin, devSwitchView } = useApp();
  return (
    <div style={{ width: 230, maxWidth: '82vw', height: '100%', background: C.side, display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '18px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 8px 20px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0f9d6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <Icon name="car2" size={20} sw={2} />
        </div>
        <div>
          <div style={{ color: '#fff', fontFamily: font.disp, fontWeight: 700, fontSize: 16, letterSpacing: '-.02em' }}>DriveFlow</div>
          <div style={{ color: C.sideMut, fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', marginTop: -1 }}>SUPER ADMIN</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(([key, icon, label]) => {
          const active = nav === key;
          return (
            <button key={key} onClick={() => { setNav(key); setOpenId(null); onNavigate?.(); }} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', border: 'none',
              background: active ? C.sideActive : 'transparent', color: active ? '#fff' : C.sideMut,
              padding: '10px 13px', borderRadius: 10, fontSize: 13.5, fontWeight: active ? 600 : 500,
              cursor: 'pointer', textAlign: 'left', fontFamily: font.body,
            }}>
              <span style={{ color: active ? '#34d399' : C.sideMut, display: 'flex' }}><Icon name={icon} size={18} sw={1.9} /></span>
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid ' + C.sideLine, paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 8px 10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f9d6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, fontFamily: font.disp, flexShrink: 0 }}>{(user?.name || 'PA').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Platform admin</div>
            <div style={{ color: C.sideMut, fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'platform admin'}</div>
          </div>
        </div>
        {isDevSuperadmin && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: C.sideMut, fontSize: 9.5, fontWeight: 700, letterSpacing: '.08em', padding: '0 13px 6px' }}>VIEW AS (TESTING)</div>
            {DEV_VIEWS.map(([v, label]) => (
              <button key={v} onClick={() => devSwitchView(v)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 'none', background: 'transparent', color: C.sideMut, padding: '8px 13px', borderRadius: 10, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', textAlign: 'left', fontFamily: font.body }}>
                {label}
              </button>
            ))}
          </div>
        )}
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 'none', background: 'transparent', color: C.sideMut, padding: '9px 13px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font.body }}>
          <Icon name="logout" size={17} sw={1.8} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function SuperAdmin() {
  const { logout, user } = useApp();
  const [nav, setNav] = useState('overview');
  const [openId, setOpenId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  function openSchool(id) { setOpenId(id); setNav('schools'); }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: font.body }}>
      {/* Static sidebar on desktop */}
      {!isMobile && <SidebarPanel nav={nav} setNav={setNav} openId={openId} setOpenId={setOpenId} logout={logout} user={user} />}

      {/* Drawer overlay on mobile */}
      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(8,12,20,.5)', backdropFilter: 'blur(2px)', display: 'flex', animation: 'df-fade .18s' }}>
          <div onClick={e => e.stopPropagation()} style={{ height: '100%', animation: 'df-drawer .22s cubic-bezier(.2,.8,.2,1)' }}>
            <SidebarPanel nav={nav} setNav={setNav} openId={openId} setOpenId={setOpenId} logout={logout} user={user} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, background: C.bg, overflowY: 'auto', minWidth: 0 }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid ' + C.line, background: C.surf, position: 'sticky', top: 0, zIndex: 5 }}>
            <button onClick={() => setDrawerOpen(true)} style={{ border: '1px solid ' + C.line, background: C.surf, color: C.ink2, width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
              <Icon name="menu" size={19} sw={2} />
            </button>
            <div style={{ fontFamily: font.disp, fontWeight: 700, fontSize: 16, color: C.ink }}>DriveFlow · Super admin</div>
          </div>
        )}
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '20px 16px 50px' : '36px 32px 60px' }}>
          {nav === 'overview' && <Overview onOpen={openSchool} />}
          {nav === 'schools' && (openId ? (
            <SchoolDetail id={openId} onBack={() => setOpenId(null)} />
          ) : (
            <>
              <div style={{ fontFamily: font.disp, fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Driving Schools</div>
              <div style={{ fontSize: 14, color: C.mut, marginBottom: 28 }}>Click a school to view its full breakdown</div>
              <SchoolsTable onOpen={openSchool} />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
