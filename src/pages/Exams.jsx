import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Icon, Pill, Avatar, EmptyRow, Card } from '../components/ui.jsx';
import { C } from '../data/seed.js';

export default function Exams() {
  const { data, role, me, openStudent, showToast, T } = useApp();
  const isStudent = role === 'student';
  const allExams = isStudent ? data.exams.filter(e => e.studentId === me.id) : data.exams;
  const cols = {
    scheduled: [C.pri, C.priBg, T('scheduled')],
    passed: [C.grn, C.grnBg, T('passed')],
    failed: [C.red, C.redBg, T('failed')],
  };

  function Section({ type, label }) {
    const group = allExams.filter(e => e.type === type);
    return (
      <div style={{ flex: 1 }}>
        <Card title={label}>
          {group.length ? group.map(e => {
            const s = data.students.find(x => x.id === e.studentId);
            const c = cols[e.status];
            return (
              <button key={e.id} onClick={() => openStudent(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', borderBottom: '1px solid ' + C.line2, cursor: 'pointer' }}>
                <Avatar name={s.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: C.mut }}>{new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {T('readiness')} {s.readiness}%</div>
                </div>
                <Pill text={c[2]} color={c[0]} bg={c[1]} />
              </button>
            );
          }) : <EmptyRow msg="No exams" />}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '22px 26px 90px', animation: 'df-fade .25s' }}>
      {!isStudent && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1 }} />
          <button onClick={() => showToast('Schedule exam (demo)')} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: C.pri, color: '#fff', fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 9 }}>
            <Icon name="plus" size={16} sw={2.2} /> Schedule exam
          </button>
        </div>
      )}
      <div className="df-grid-2">
        <Section type="theory" label={T('theory') + ' ' + T('exams').toLowerCase()} />
        <Section type="practical" label={T('practical') + ' ' + T('exams').toLowerCase()} />
      </div>
    </div>
  );
}
