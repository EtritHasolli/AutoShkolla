import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, Avatar, EmptyRow, ProgressBar, statusColor, statusBg, payColor, payBg } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

function Metric({ label, val, icon, color, bg }) {
  return (
    <div style={{ flex: 1, minWidth: 150, background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.mut }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={17} sw={2} />
        </div>
      </div>
      <div style={{ fontFamily: font.disp, fontSize: 28, fontWeight: 700, color: C.ink, marginTop: 10 }}>{val}</div>
    </div>
  );
}

function NextLessonHero({ lesson }) {
  const { data, openModal, showToast, T, days } = useApp();
  const s = data.students.find(x => x.id === lesson.studentId);
  const v = data.vehicles.find(x => x.id === lesson.vehicleId);
  const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][lesson.day];
  return (
    <div style={{ background: '#0f9d6b', borderRadius: 18, padding: '22px 24px', color: '#fff', boxShadow: '0 18px 40px -18px rgba(15,157,107,.6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#cfe0fb', letterSpacing: '.05em', textTransform: 'uppercase' }}>{T('nextL')}</span>
        <span style={{ background: 'rgba(255,255,255,.18)', padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: font.mono }}>{dayName} · {String(lesson.hour).padStart(2, '0')}:00</span>
      </div>
      <div style={{ fontFamily: font.disp, fontSize: 26, fontWeight: 700, letterSpacing: '-.02em' }}>{s.name}</div>
      <div style={{ display: 'flex', gap: 18, marginTop: 10, fontSize: 13.5, color: '#dbe6fb', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="car2" size={16} sw={1.9} />{v ? v.name + ' · ' + v.plate : 'No vehicle'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="pin" size={15} sw={1.9} />{lesson.pickup}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button onClick={() => showToast(T('call') + ' ' + s.phone)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,255,255,.16)', color: '#fff', border: 'none', padding: '11px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Icon name="phone" size={17} sw={2} />{T('call')}
        </button>
        <button onClick={() => openModal({ type: 'lessonView', id: lesson.id })} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', color: C.pri, border: 'none', padding: '11px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          <Icon name="pin" size={17} sw={2} /> Details
        </button>
      </div>
    </div>
  );
}

export default function InstructorDashboard() {
  const { me, data, lessons, todayIdx, openModal, openStudent, T } = useApp();
  const isMobile = useIsMobile();

  const myLessons = lessons.filter(l => l.instructorId === me.id);
  const todays = myLessons.filter(l => l.day === todayIdx).sort((a, b) => a.hour - b.hour);
  const done = todays.filter(l => l.status === 'completed').length;
  const next = todays.find(l => l.status === 'scheduled') || todays.find(l => l.status !== 'completed');
  const myStudents = data.students.filter(s => s.instructorId === me.id);

  return (
    <div style={{ padding: isMobile ? '18px 16px 90px' : '24px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13.5, color: C.mut, fontWeight: 600 }}>{T('good_morning')}</div>
        <div style={{ fontFamily: font.disp, fontSize: 25, fontWeight: 700, color: C.ink, letterSpacing: '-.02em' }}>{me.name.split(' ')[0]}</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <Metric label={T('today_lessons')} val={todays.length} icon="calendar" color={C.pri} bg={C.priBg} />
        <Metric label={T('completed')} val={done} icon="check" color={C.grn} bg={C.grnBg} />
        <Metric label={T('my_students')} val={myStudents.length} icon="students" color={C.vio} bg={C.vioBg} />
      </div>

      {next && <div style={{ marginBottom: 16 }}><NextLessonHero lesson={next} /></div>}

      <div className="df-grid-main">
        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid ' + C.line2, fontFamily: font.disp, fontWeight: 600, fontSize: 15, color: C.ink }}>{T('today_lessons')}</div>
          {todays.length ? todays.map(l => {
            const s = data.students.find(x => x.id === l.studentId);
            const v = data.vehicles.find(x => x.id === l.vehicleId);
            return (
              <button key={l.id} onClick={() => openModal({ type: 'lessonView', id: l.id })} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid ' + C.line2, cursor: 'pointer' }}>
                <div style={{ fontFamily: font.mono, fontSize: 13.5, fontWeight: 600, color: C.ink2, width: 46 }}>{String(l.hour).padStart(2, '0')}:00</div>
                <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: statusColor(l.status) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.mut, marginTop: 1 }}>{v ? v.name : '—'} · {T(l.type)}</div>
                </div>
                <Pill text={T(l.status)} color={statusColor(l.status)} bg={statusBg(l.status)} />
              </button>
            );
          }) : <EmptyRow msg={T('no_lessons')} />}
        </div>

        <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '15px 20px', borderBottom: '1px solid ' + C.line2, fontFamily: font.disp, fontWeight: 600, fontSize: 15, color: C.ink }}>{T('my_students')}</div>
          {myStudents.map(s => (
            <button key={s.id} onClick={() => openStudent(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid ' + C.line2, cursor: 'pointer' }}>
              <Avatar name={s.name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.name}</div>
                <div style={{ marginTop: 4 }}><ProgressBar val={s.readiness} max={100} color={s.readiness >= 70 ? C.grn : C.amb} h={5} /></div>
              </div>
              <Pill text={T(s.payment)} color={payColor(s.payment)} bg={payBg(s.payment)} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
