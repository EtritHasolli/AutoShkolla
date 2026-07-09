import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, ProgressBar, euro } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

function Ring({ pct, center, label, color }) {
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: `conic-gradient(${color} ${pct}%, ${C.line} 0)` }} />
      <div style={{ position: 'absolute', inset: 9, borderRadius: '50%', background: C.surf, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: font.disp, fontSize: 23, fontWeight: 700, color: C.ink }}>{center}</div>
        <div style={{ fontSize: 10, color: C.mut, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function NextLessonHero({ lesson }) {
  const { data, openModal, showToast, T } = useApp();
  const i = data.instructors.find(x => x.id === lesson.instructorId);
  const v = data.vehicles.find(x => x.id === lesson.vehicleId);
  if (!i) return null;
  const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][lesson.day];
  return (
    <div style={{ background: 'linear-gradient(140deg,#2a6fdb,#3858c8 60%,#6557d1)', borderRadius: 18, padding: '22px 24px', color: '#fff', boxShadow: '0 18px 40px -18px rgba(42,111,219,.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#cfe0fb', letterSpacing: '.05em', textTransform: 'uppercase' }}>{T('nextL')}</span>
        <span style={{ background: 'rgba(255,255,255,.18)', padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: font.mono }}>{dayName} · {String(lesson.hour).padStart(2, '0')}:00</span>
      </div>
      <div style={{ fontFamily: font.disp, fontSize: 26, fontWeight: 700, letterSpacing: '-.02em' }}>{i.name}</div>
      <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 13.5, color: '#dbe6fb', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="car2" size={16} sw={1.9} />{v ? v.name + ' · ' + v.plate : '—'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="pin" size={15} sw={1.9} />{lesson.pickup}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button onClick={() => showToast(T('call') + ' ' + i.phone)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,255,255,.16)', color: '#fff', border: 'none', padding: '11px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Icon name="phone" size={17} sw={2} />{T('call')}
        </button>
        <button onClick={() => openModal({ type: 'lessonView', id: lesson.id })} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', color: C.pri, border: 'none', padding: '11px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Icon name="pin" size={17} sw={2} /> Details
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { me, data, lessons, go, T } = useApp();
  const isMobile = useIsMobile();
  const s = me; // the logged-in student
  const i = data.instructors.find(x => x.id === s.instructorId);
  const next = lessons.filter(l => l.studentId === s.id && l.status === 'scheduled').sort((a, b) => a.day - b.day || a.hour - b.hour)[0];
  const usedPct = Math.round(s.used / s.total * 100);

  return (
    <div style={{ padding: isMobile ? '18px 16px 90px' : '24px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13.5, color: C.mut, fontWeight: 600 }}>{T('good_morning')}</div>
        <div style={{ fontFamily: font.disp, fontSize: 25, fontWeight: 700, color: C.ink, letterSpacing: '-.02em' }}>{s.name.split(' ')[0]}</div>
      </div>

      {next ? <div style={{ marginBottom: 16 }}><NextLessonHero lesson={next} /></div> : (
        <div style={{ marginBottom: 16, padding: 20, background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, textAlign: 'center', color: C.mut, fontSize: 13.5 }}>No upcoming lessons</div>
      )}

      <div className="df-grid-2" style={{ marginBottom: 16 }}>
        {/* Package */}
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '20px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>{T('package')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Ring pct={usedPct} center={s.remaining} label={T('remaining')} color={C.pri} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: font.disp, fontSize: 18, fontWeight: 700, color: C.ink }}>{s.total} {T('lessons').toLowerCase()}</div>
              <div style={{ fontSize: 13, color: C.mut, margin: '3px 0 12px' }}>{s.used} {T('used')}</div>
              <ProgressBar val={s.used} max={s.total} color={C.pri} h={7} />
            </div>
          </div>
        </div>

        {/* Readiness */}
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '20px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 16 }}>{T('readiness')}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: font.disp, fontSize: 34, fontWeight: 700, color: s.readiness >= 70 ? C.grn : C.amb }}>{s.readiness}%</span>
            {s.readiness >= 70
              ? <Pill text={T('exam_ready')} color={C.grn} bg={C.grnBg} />
              : <Pill text="In progress" color={C.amb} bg={C.ambBg} />}
          </div>
          <ProgressBar val={s.readiness} max={100} color={s.readiness >= 70 ? C.grn : C.amb} h={9} />
          <button onClick={() => go('courses')} className="df-link" style={{ marginTop: 16, border: 'none', background: 'none', color: C.pri, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, fontFamily: font.body }}>
            {T('courses')} <Icon name="chevR" size={14} sw={2.2} />
          </button>
        </div>
      </div>

      {/* Payment + instructor */}
      <div className="df-grid-2">
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '20px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>{T('payments')}</div>
          <div style={{ fontSize: 12.5, color: C.mut, fontWeight: 600 }}>{T('remaining')}</div>
          <div style={{ fontFamily: font.disp, fontSize: 30, fontWeight: 700, color: s.due > 0 ? C.red : C.grn, margin: '4px 0 14px' }}>{euro(s.due)}</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div><div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{T('total_due')}</div><div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 2 }}>{euro(s.price)}</div></div>
            <div><div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{T('paid')}</div><div style={{ fontSize: 15, fontWeight: 700, color: C.grn, marginTop: 2 }}>{euro(s.paid)}</div></div>
          </div>
        </div>

        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '20px' }}>
          <div style={{ fontFamily: font.disp, fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 14 }}>{T('instructor')}</div>
          {i ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: i.color + '1f', color: i.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: font.disp, fontSize: 16 }}>
                {i.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{i.name}</div>
                <div style={{ fontSize: 12.5, color: C.mut, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Icon name="star" size={13} sw={2} /> {i.rating} · Cat. {i.cat}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: C.mut }}>Your school will assign you an instructor soon.</div>
          )}
        </div>
      </div>
    </div>
  );
}
