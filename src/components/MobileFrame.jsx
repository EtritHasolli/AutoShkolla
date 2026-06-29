import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, Avatar, ProgressBar, EmptyRow, statusColor, statusBg, payColor, payBg, euro } from './ui.jsx';
import { C, font } from '../data/seed.js';
import Modal from './Modal.jsx';

function StatusBar() {
  return (
    <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', position: 'relative', flexShrink: 0, background: C.bg }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: font.disp }}>9:41</span>
      <div style={{ width: 120, height: 30, background: '#0b0e14', borderRadius: 16, position: 'absolute', left: '50%', top: 7, transform: 'translateX(-50%)' }} />
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: C.ink }}>
        <div style={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          {[4, 6, 8, 10].map((bh, i) => <span key={i} style={{ width: 3, height: bh, background: C.ink, borderRadius: 1 }} />)}
        </div>
        <div style={{ width: 22, height: 11, border: '1.5px solid ' + C.ink, borderRadius: 3, position: 'relative', display: 'flex', alignItems: 'center', padding: 1.5 }}>
          <div style={{ width: '70%', height: '100%', background: C.ink, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function BottomNav({ items, active, onNav }) {
  return (
    <div style={{ display: 'flex', borderTop: '1px solid ' + C.line, background: C.surf, paddingBottom: 18, flexShrink: 0 }}>
      {items.map(([route, ic, label]) => {
        const on = active === route;
        return (
          <button key={route} onClick={() => onNav(route)} style={{ flex: 1, border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '11px 0 6px', color: on ? C.pri : C.soft }}>
            <Icon name={ic} size={23} sw={on ? 2.1 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MHeader({ title, sub, action }) {
  return (
    <div style={{ padding: '8px 22px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        {sub && <div style={{ fontSize: 13, color: C.mut, fontWeight: 600 }}>{sub}</div>}
        <div style={{ fontFamily: font.disp, fontSize: 25, fontWeight: 700, color: C.ink, letterSpacing: '-.02em', marginTop: 2 }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

function MSection({ title, children, pad = true }) {
  return (
    <div style={{ padding: pad ? '0 22px' : '0' }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink2, margin: '18px 0 10px', paddingLeft: pad ? 0 : 22 }}>{title}</div>
      {children}
    </div>
  );
}

function MLessonCard({ lesson, isInstr }) {
  const { data, openModal } = useApp();
  const s = data.students.find(x => x.id === lesson.studentId);
  const i = data.instructors.find(x => x.id === lesson.instructorId);
  const v = data.vehicles.find(x => x.id === lesson.vehicleId);
  const { T } = useApp();
  return (
    <button onClick={() => openModal({ type: 'lessonView', id: lesson.id })} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, padding: '13px 14px', textAlign: 'left', cursor: 'pointer' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 52, flexShrink: 0 }}>
        <div style={{ fontFamily: font.disp, fontSize: 17, fontWeight: 700, color: C.ink }}>{String(lesson.hour).padStart(2, '0')}:00</div>
        <div style={{ fontSize: 10, color: C.soft, fontWeight: 600 }}>60 min</div>
      </div>
      <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: statusColor(lesson.status) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isInstr ? s.name : i.name}</div>
        <div style={{ fontSize: 12.5, color: C.mut, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="car2" size={14} sw={1.8} />{v.name} · {T(lesson.type)}
        </div>
      </div>
      <Pill text={T(lesson.status)} color={statusColor(lesson.status)} bg={statusBg(lesson.status)} />
    </button>
  );
}

function MNextHero({ lesson, isInstr }) {
  const { data, openModal, showToast, T } = useApp();
  const s = data.students.find(x => x.id === lesson.studentId);
  const i = data.instructors.find(x => x.id === lesson.instructorId);
  const v = data.vehicles.find(x => x.id === lesson.vehicleId);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div style={{ margin: '0 22px 8px', background: 'linear-gradient(140deg,#2a6fdb,#3858c8 60%,#6557d1)', borderRadius: 20, padding: '18px 20px', color: '#fff', boxShadow: '0 18px 40px -16px rgba(42,111,219,.7)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#cfe0fb', letterSpacing: '.04em', textTransform: 'uppercase' }}>{T('nextL')}</span>
        <span style={{ background: 'rgba(255,255,255,.18)', padding: '4px 10px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, fontFamily: font.mono }}>{days[lesson.day]} · {String(lesson.hour).padStart(2, '0')}:00</span>
      </div>
      <div style={{ fontFamily: font.disp, fontSize: 24, fontWeight: 700, marginTop: 12, letterSpacing: '-.02em' }}>{isInstr ? s.name : i.name}</div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: '#dbe6fb' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="car2" size={16} sw={1.9} />{v.plate}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={15} sw={1.9} />{lesson.pickup}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <a href="tel:" onClick={e => { e.preventDefault(); showToast(T('call') + ' ' + (isInstr ? s.phone : i.phone)); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,255,255,.16)', color: '#fff', padding: '11px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          <Icon name="phone" size={17} sw={2} />{T('call')}
        </a>
        <button onClick={() => openModal({ type: 'lessonView', id: lesson.id })} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', color: C.pri, border: 'none', padding: '11px', borderRadius: 12, fontSize: 14, fontWeight: 700 }}>
          <Icon name="pin" size={17} sw={2} /> Details
        </button>
      </div>
    </div>
  );
}

// ---- INSTRUCTOR SCREENS ----
function InstrToday() {
  const { data, lessons, todayIdx, T } = useApp();
  const me = data.instructors[0];
  const todays = lessons.filter(l => l.instructorId === me.id && l.day === todayIdx).sort((a, b) => a.hour - b.hour);
  const next = todays.find(l => l.status === 'scheduled') || todays[0];
  const done = todays.filter(l => l.status === 'completed').length;
  return (
    <div style={{ paddingBottom: 18 }}>
      <MHeader title={me.name.split(' ')[0]} sub={T('good_morning')} action={
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: me.color + '1f', color: me.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: font.disp, fontSize: 16 }}>AK</div>
      } />
      <div style={{ display: 'flex', gap: 10, padding: '0 22px 4px' }}>
        {[[todays.length, T('today_lessons')], [done, T('completed')], [me.students, T('students')]].map((r, idx) => (
          <div key={idx} style={{ flex: 1, background: C.surf, border: '1px solid ' + C.line, borderRadius: 13, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: font.disp, fontSize: 21, fontWeight: 700, color: C.ink }}>{r[0]}</div>
            <div style={{ fontSize: 10.5, color: C.mut, fontWeight: 600, marginTop: 1 }}>{r[1]}</div>
          </div>
        ))}
      </div>
      {next && <div style={{ marginTop: 16 }}><MNextHero lesson={next} isInstr /></div>}
      <MSection title={T('today_lessons')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todays.length ? todays.map(l => <MLessonCard key={l.id} lesson={l} isInstr />) : <EmptyRow msg={T('no_lessons')} />}
        </div>
      </MSection>
    </div>
  );
}

function InstrSchedule() {
  const { data, lessons, calDay, setCalDay, days, T } = useApp();
  const me = data.instructors[0];
  const ls = lessons.filter(l => l.instructorId === me.id && l.day === calDay).sort((a, b) => a.hour - b.hour);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function fmtDate(dt) { return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
  return (
    <div style={{ paddingBottom: 18 }}>
      <MHeader title={T('schedule')} />
      <div style={{ display: 'flex', gap: 7, padding: '0 22px 6px', overflowX: 'auto' }}>
        {[0, 1, 2, 3, 4, 5].map(d => (
          <button key={d} onClick={() => setCalDay(d)} style={{ flexShrink: 0, border: '1px solid ' + (calDay === d ? C.pri : C.line), background: calDay === d ? C.pri : C.surf, color: calDay === d ? '#fff' : C.ink2, borderRadius: 13, padding: '9px 6px', width: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, opacity: .8 }}>{dayNames[d]}</div>
            <div style={{ fontFamily: font.disp, fontSize: 17, fontWeight: 700 }}>{days[d].getDate()}</div>
          </button>
        ))}
      </div>
      <MSection title={fmtDate(days[calDay])}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ls.length ? ls.map(l => <MLessonCard key={l.id} lesson={l} isInstr />) : <EmptyRow msg={T('no_lessons')} />}
        </div>
      </MSection>
    </div>
  );
}

function InstrStudents() {
  const { data, T } = useApp();
  const me = data.instructors[0];
  const list = data.students.filter(s => s.instructorId === me.id);
  return (
    <div style={{ paddingBottom: 18 }}>
      <MHeader title={T('my_students')} sub={list.length + ' ' + T('students').toLowerCase()} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 22px' }}>
        {list.map(s => (
          <div key={s.id} style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
              <Avatar name={s.name} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.mut }}>{s.used}/{s.total} {T('lessons').toLowerCase()}</div>
              </div>
              <Pill text={T(s.payment)} color={payColor(s.payment)} bg={payBg(s.payment)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.mut, marginBottom: 5, fontWeight: 600 }}>
              <span>{T('readiness')}</span><span>{s.readiness}%</span>
            </div>
            <ProgressBar val={s.readiness} max={100} color={s.readiness >= 70 ? C.grn : C.amb} h={7} />
          </div>
        ))}
      </div>
    </div>
  );
}

function InstrProfile() {
  const { data, lessons, showToast, T } = useApp();
  const me = data.instructors[0];
  const v = data.vehicles.find(x => x.id === me.vehicle);
  return (
    <div style={{ paddingBottom: 18 }}>
      <div style={{ textAlign: 'center', padding: '14px 0 8px' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', margin: '0 auto', background: me.color + '1f', color: me.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: font.disp, fontSize: 30 }}>AK</div>
        <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 12 }}>{me.name}</div>
        <div style={{ fontSize: 13, color: C.mut, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: C.amb }}><Icon name="star" size={14} sw={2} />{me.rating}</span> · Cat. {me.cat}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '8px 22px 0' }}>
        {[[me.students, T('students')], [lessons.filter(l => l.instructorId === me.id).length, T('lessons')]].map((r, idx) => (
          <div key={idx} style={{ flex: 1, background: C.surf, border: '1px solid ' + C.line, borderRadius: 13, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.ink }}>{r[0]}</div>
            <div style={{ fontSize: 11, color: C.mut, fontWeight: 600 }}>{r[1]}</div>
          </div>
        ))}
      </div>
      <MSection title={T('vehicle')}>
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, padding: '14px', display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: C.priBg, color: C.pri, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="car2" size={24} sw={1.8} /></div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{v.name}</div>
            <div style={{ fontSize: 12.5, color: C.mut, fontFamily: font.mono }}>{v.plate}</div>
          </div>
        </div>
      </MSection>
      <div style={{ padding: '18px 22px 0' }}>
        <button onClick={() => showToast(T('logout') + ' (demo)')} style={{ width: '100%', border: '1px solid ' + C.line, background: C.surf, color: C.red, fontSize: 14, fontWeight: 600, padding: '13px', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="logout" size={18} sw={1.9} />{T('logout')}
        </button>
      </div>
    </div>
  );
}

// ---- STUDENT SCREENS ----
function StudHome() {
  const { data, lessons, T } = useApp();
  const s = data.students[0];
  const i = data.instructors.find(x => x.id === s.instructorId);
  const next = lessons.filter(l => l.studentId === s.id && l.status === 'scheduled').sort((a, b) => a.day - b.day || a.hour - b.hour)[0];
  const ringPct = Math.round(s.used / s.total * 100);
  return (
    <div style={{ paddingBottom: 18 }}>
      <MHeader title={s.name.split(' ')[0]} sub={T('good_morning')} action={<Avatar name={s.name} size={44} />} />
      {next ? <MNextHero lesson={next} isInstr={false} /> : (
        <div style={{ margin: '0 22px', padding: 20, background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, textAlign: 'center', color: C.mut, fontSize: 13.5 }}>No upcoming lessons</div>
      )}
      <MSection title={T('package')}>
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(${C.pri} ${ringPct}%, ${C.line} 0)` }} />
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: C.surf, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: font.disp, fontSize: 20, fontWeight: 700, color: C.ink }}>{s.remaining}</div>
              <div style={{ fontSize: 9.5, color: C.mut, fontWeight: 600 }}>{T('remaining')}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.disp, fontSize: 17, fontWeight: 700, color: C.ink }}>{s.total} {T('lessons').toLowerCase()}</div>
            <div style={{ fontSize: 12.5, color: C.mut, margin: '2px 0 10px' }}>{s.used} {T('used')}</div>
            <ProgressBar val={s.used} max={s.total} color={C.pri} h={7} />
          </div>
        </div>
      </MSection>
      <MSection title={T('readiness')}>
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <span style={{ fontFamily: font.disp, fontSize: 30, fontWeight: 700, color: s.readiness >= 70 ? C.grn : C.amb }}>{s.readiness}%</span>
            {s.readiness >= 70 ? <Pill text={T('exam_ready')} color={C.grn} bg={C.grnBg} /> : <Pill text="In progress" color={C.amb} bg={C.ambBg} />}
          </div>
          <ProgressBar val={s.readiness} max={100} color={s.readiness >= 70 ? C.grn : C.amb} h={9} />
        </div>
      </MSection>
    </div>
  );
}

function StudProgress() {
  const { data, T } = useApp();
  const s = data.students[0];
  const labels = { parking: T('skill_parking'), reverse: T('skill_reverse'), highway: T('skill_highway'), clutch: T('skill_clutch'), roundabout: T('skill_roundabout'), lane: T('skill_lane') };
  return (
    <div style={{ paddingBottom: 18 }}>
      <MHeader title={T('progress')} />
      <div style={{ margin: '0 22px 4px', background: 'linear-gradient(140deg,#1f8a5b,#0e8f9b)', borderRadius: 18, padding: '18px 20px', color: '#fff', textAlign: 'center' }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#cdeede', textTransform: 'uppercase', letterSpacing: '.04em' }}>{T('readiness')}</div>
        <div style={{ fontFamily: font.disp, fontSize: 46, fontWeight: 700, lineHeight: 1, margin: '8px 0' }}>{s.readiness}%</div>
        <div style={{ fontSize: 13, color: '#cdeede' }}>{s.readiness >= 70 ? T('exam_ready') : 'Keep practicing'}</div>
      </div>
      <MSection title="Skills (1–5)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {data.skills.map(sk => {
            const val = s.progress[sk];
            return (
              <div key={sk} style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 13, padding: '13px 15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{labels[sk]}</span>
                  <div style={{ display: 'flex', gap: 4 }}>{[1, 2, 3, 4, 5].map(n => <span key={n} style={{ width: 16, height: 8, borderRadius: 3, background: n <= val ? (val >= 4 ? C.grn : val >= 3 ? C.pri : C.amb) : C.line }} />)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </MSection>
    </div>
  );
}

function StudPayments() {
  const { data, T } = useApp();
  const s = data.students[0];
  const hist = data.payments.filter(p => p.studentId === s.id);
  return (
    <div style={{ paddingBottom: 18 }}>
      <MHeader title={T('payments')} />
      <div style={{ margin: '0 22px', background: C.surf, border: '1px solid ' + C.line, borderRadius: 18, padding: '18px 20px' }}>
        <div style={{ fontSize: 12.5, color: C.mut, fontWeight: 600 }}>{T('remaining')}</div>
        <div style={{ fontFamily: font.disp, fontSize: 34, fontWeight: 700, color: s.due > 0 ? C.red : C.grn, margin: '4px 0 14px' }}>{euro(s.due)}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{T('total_due')}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginTop: 2 }}>{euro(s.price)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: C.mut, fontWeight: 600 }}>{T('paid')}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.grn, marginTop: 2 }}>{euro(s.paid)}</div>
          </div>
        </div>
      </div>
      <div style={{ margin: '10px 22px 0', background: C.priSoft, border: '1px solid ' + C.priBg, borderRadius: 12, padding: '10px 13px', fontSize: 11.5, color: C.priD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon name="euro" size={15} sw={2} /> Pay in cash at the school office
      </div>
      <MSection title="History">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hist.length ? hist.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.surf, border: '1px solid ' + C.line, borderRadius: 13, padding: '12px 14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: C.grnBg, color: C.grn, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="euro" size={18} sw={2} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.ink }}>{euro(p.amount)}</div>
                <div style={{ fontSize: 12, color: C.mut }}>{T(p.method)} · {p.note}</div>
              </div>
              <div style={{ fontSize: 12, color: C.mut, fontFamily: font.mono }}>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
            </div>
          )) : <EmptyRow msg="No payments yet" />}
        </div>
      </MSection>
    </div>
  );
}

function StudProfile() {
  const { data, showToast, T } = useApp();
  const s = data.students[0];
  const i = data.instructors.find(x => x.id === s.instructorId);
  const v = data.vehicles.find(x => x.id === i.vehicle);
  return (
    <div style={{ paddingBottom: 18 }}>
      <div style={{ textAlign: 'center', padding: '14px 0 8px' }}>
        <Avatar name={s.name} size={84} />
        <div style={{ fontFamily: font.disp, fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 12 }}>{s.name}</div>
        <div style={{ fontSize: 13, color: C.mut, marginTop: 3 }}>Cat. {s.cat} · {T('student')}</div>
      </div>
      <MSection title={T('instructor')}>
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, padding: '14px', display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: i.color + '1f', color: i.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: font.disp }}>
            {i.name.split(' ').map(w => w[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{i.name}</div>
            <div style={{ fontSize: 12.5, color: C.mut }}>{v.name} · {v.plate}</div>
          </div>
          <a href="tel:" onClick={e => { e.preventDefault(); showToast(T('call') + ' ' + i.phone); }} style={{ width: 38, height: 38, borderRadius: 10, background: C.grnBg, color: C.grn, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
            <Icon name="phone" size={18} sw={1.9} />
          </a>
        </div>
      </MSection>
      <div style={{ padding: '18px 22px 0' }}>
        <button onClick={() => showToast(T('logout') + ' (demo)')} style={{ width: '100%', border: '1px solid ' + C.line, background: C.surf, color: C.red, fontSize: 14, fontWeight: 600, padding: '13px', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="logout" size={18} sw={1.9} />{T('logout')}
        </button>
      </div>
    </div>
  );
}

export default function MobileFrame() {
  const { mRole, mRoute, setMRoute, T } = useApp();
  const isInstr = mRole === 'instructor';

  let content, navItems;
  if (isInstr) {
    const screens = { today: <InstrToday />, schedule: <InstrSchedule />, students: <InstrStudents />, profile: <InstrProfile /> };
    content = screens[mRoute] || <InstrToday />;
    navItems = [['today', 'today', T('today')], ['schedule', 'calendar', T('schedule')], ['students', 'students', T('my_students')], ['profile', 'instructors', T('profile')]];
  } else {
    const screens = { home: <StudHome />, progress: <StudProgress />, payments: <StudPayments />, profile: <StudProfile /> };
    content = screens[mRoute] || <StudHome />;
    navItems = [['home', 'dashboard', T('today')], ['progress', 'progress', T('progress')], ['payments', 'payments', T('payments')], ['profile', 'students', T('profile')]];
  }

  return (
    <div style={{ width: 392, height: 'min(848px, calc(100vh - 130px))', background: '#0b0e14', borderRadius: 50, padding: 12, boxShadow: '0 50px 100px -30px rgba(10,20,40,.65)', flexShrink: 0, border: '1px solid #232c38' }}>
      <div style={{ width: '100%', height: '100%', background: C.bg, borderRadius: 38, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <StatusBar />
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>{content}</div>
        <BottomNav items={navItems} active={mRoute} onNav={setMRoute} />
        <Modal />
      </div>
    </div>
  );
}
