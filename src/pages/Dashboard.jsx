import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, Avatar, EmptyRow, btnGhostStyle, euro, statusColor, statusBg, payColor, payBg } from '../components/ui.jsx';
import { C, font } from '../data/seed.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';

function Metric({ label, val, sub, icon, color, bg }) {
  return (
    <div style={{ flex: 1, minWidth: 180, background: C.surf, border: '1px solid ' + C.line, borderRadius: 15, padding: '17px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.mut }}>{label}</div>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={18} sw={2} />
        </div>
      </div>
      <div style={{ fontFamily: font.disp, fontSize: 30, fontWeight: 700, color: C.ink, marginTop: 12, letterSpacing: '-.02em' }}>{val}</div>
      <div style={{ fontSize: 12.5, color: C.soft, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function Card({ title, extra, children }) {
  return (
    <div style={{ background: C.surf, border: '1px solid ' + C.line, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid ' + C.line2 }}>
        <div style={{ fontFamily: font.disp, fontWeight: 600, fontSize: 15.5, color: C.ink }}>{title}</div>
        {extra}
      </div>
      <div style={{ padding: '8px 0' }}>{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { lessons, data, todayIdx, T, go, openModal, openStudent, showToast } = useApp();
  const isMobile = useIsMobile();
  const todays = lessons.filter(l => l.day === todayIdx).sort((a, b) => a.hour - b.hour);
  const doneToday = todays.filter(l => l.status === 'completed').length;
  const overdueStudents = data.students.filter(s => s.payment !== 'paid');
  const monthRevenue = data.payments.reduce((a, p) => a + p.amount, 0);
  const outstanding = data.students.reduce((a, s) => a + s.due, 0);
  const availV = data.vehicles.filter(v => v.status === 'available').length;
  const upExams = data.exams.filter(e => e.status === 'scheduled');

  function link(label, onClick) {
    return (
      <button onClick={onClick} style={{ border: 'none', background: 'transparent', color: C.pri, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}>
        {label}<Icon name="chevR" size={14} sw={2.2} />
      </button>
    );
  }

  return (
    <div style={{ padding: isMobile ? '18px 16px 32px' : '24px 26px 40px', animation: 'df-fade .25s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: font.disp, fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: '-.02em' }}>{T('good_morning')}, Astrit</div>
          <div style={{ fontSize: 13.5, color: C.mut, marginTop: 3 }}>{todays.length} {T('sched_today')} · {doneToday} {T('completed').toLowerCase()}</div>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button onClick={() => openModal({ type: 'student' })} style={btnGhostStyle()}>
            <Icon name="plus" size={16} sw={2.2} />{T('add_student')}
          </button>
          <button onClick={() => openModal({ type: 'payment' })} style={btnGhostStyle()}>
            <Icon name="euro" size={16} sw={2} />{T('record_payment')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 16 }}>
        <Metric label={T('today_lessons')} val={todays.length} sub={doneToday + ' ' + T('completed').toLowerCase()} icon="calendar" color={C.pri} bg={C.priBg} />
        <Metric label={T('revenue_month')} val={euro(monthRevenue)} sub={T('this_week')} icon="euro" color={C.grn} bg={C.grnBg} />
        <Metric label={T('active_instr')} val={data.instructors.length} sub={T('avail_vehicles') + ': ' + availV} icon="instructors" color={C.vio} bg={C.vioBg} />
        <Metric label={T('overdue')} val={euro(outstanding)} sub={overdueStudents.length + ' ' + T('students').toLowerCase()} icon="alert" color={C.red} bg={C.redBg} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 16, alignItems: 'start' }}>
        <Card title={T('today_lessons')} extra={link(T('view_all'), () => go('calendar'))}>
          {todays.length ? todays.map(l => {
            const s = data.students.find(x => x.id === l.studentId);
            const i = data.instructors.find(x => x.id === l.instructorId);
            const v = data.vehicles.find(x => x.id === l.vehicleId);
            return (
              <button key={l.id} onClick={() => openStudent(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 20px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid ' + C.line2 }}>
                <div style={{ fontFamily: font.mono, fontSize: 13.5, fontWeight: 600, color: C.ink2, width: 46 }}>{String(l.hour).padStart(2, '0')}:00</div>
                <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: statusColor(l.status) }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.mut, marginTop: 1 }}>{i.name} · {v.name}</div>
                </div>
                <Pill text={T(l.status)} color={statusColor(l.status)} bg={statusBg(l.status)} />
              </button>
            );
          }) : <EmptyRow msg={T('no_lessons')} />}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title={T('alerts')}>
            {[
              { ic: 'alert', col: C.amb, bg: C.ambBg, t: 'VW Golf 7 – insurance ends Jul 4', s: '5 days left' },
              { ic: 'car2', col: C.red, bg: C.redBg, t: 'Toyota Yaris – in maintenance', s: 'service due' },
              { ic: 'calendar', col: C.pri, bg: C.priBg, t: 'Škoda Fabia – registration Jul 9', s: '10 days left' },
            ].map((a, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, color: a.col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={a.ic} size={17} sw={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{a.t}</div>
                  <div style={{ fontSize: 11.5, color: C.mut }}>{a.s}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card title={T('upcoming_exams')} extra={link(T('view_all'), () => go('exams'))}>
            {upExams.map(e => {
              const s = data.students.find(x => x.id === e.studentId);
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: e.type === 'theory' ? C.vioBg : C.tealBg, color: e.type === 'theory' ? C.vio : C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={e.type === 'theory' ? 'doc' : 'car2'} size={16} sw={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{s.name}</div>
                    <div style={{ fontSize: 11.5, color: C.mut }}>{T(e.type)} · {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title={T('overdue_students')} extra={link(T('view_all'), () => go('payments'))}>
          <div style={{ padding: '0 8px' }}>
            {overdueStudents.slice(0, 5).map(s => {
              const i = data.instructors.find(x => x.id === s.instructorId);
              return (
                <button key={s.id} onClick={() => openStudent(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 12px', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid ' + C.line2, cursor: 'pointer' }}>
                  <Avatar name={s.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: C.mut }}>{i.name} · {s.used}/{s.total} {T('lessons').toLowerCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 600, color: C.red }}>{euro(s.due)}</div>
                    <div style={{ fontSize: 11, color: C.mut }}>{T('remaining')}</div>
                  </div>
                  <Pill text={T(s.payment)} color={payColor(s.payment)} bg={payBg(s.payment)} />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
