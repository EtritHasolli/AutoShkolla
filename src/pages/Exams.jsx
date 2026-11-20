import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Stat, Button, Empty, Badge, Avatar, Segmented, PageHeader, examTone } from '../components/ui.jsx';
import { fmtDay, daysUntil } from '../lib/format.js';
import { isStaff } from '../lib/nav.js';

export default function Exams() {
  const { data, role, me, T, lang, today, openModal, openStudent, updateExam } = useApp();
  const [tab, setTab] = useState('upcoming');
  const staff = isStaff(role);
  const all = role === 'student' ? data.exams.filter(e => e.studentId === me.id) : data.exams;
  const upcoming = all.filter(e => e.status === 'scheduled').sort((a, b) => a.date.localeCompare(b.date));
  const results = all.filter(e => e.status !== 'scheduled').sort((a, b) => b.date.localeCompare(a.date));
  const rate = (type) => {
    const r = results.filter(e => e.type === type);
    return r.length ? Math.round(r.filter(e => e.status === 'passed').length / r.length * 100) + '%' : '—';
  };
  const list = tab === 'upcoming' ? upcoming : results;

  return (
    <div className="page">
      <PageHeader title={T('exams')} actions={staff && <Button variant="primary" icon="plus" onClick={() => openModal({ type: 'exam' })}>{T('schedule_exam')}</Button>} />
      {role !== 'student' && (
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
          <Stat label={T('upcoming')} value={upcoming.length} icon="calendar" tone="brand" />
          <Stat label={T('pass_rate') + ' · ' + T('theory')} value={rate('theory')} icon="courses" tone="violet" />
          <Stat label={T('pass_rate') + ' · ' + T('practical')} value={rate('practical')} icon="car" tone="teal" />
        </div>
      )}
      <div className="toolbar"><Segmented value={tab} onChange={setTab} options={[{ v: 'upcoming', l: T('upcoming') + ' (' + upcoming.length + ')' }, { v: 'results', l: T('results') + ' (' + results.length + ')' }]} /></div>
      <Card flush>
        {list.length ? list.map(e => {
          const s = data.students.find(x => x.id === e.studentId);
          if (!s) return null;
          const d = daysUntil(e.date);
          const past = e.status === 'scheduled' && d < 0;
          return (
            <div key={e.id} className="row-item" style={{ flexWrap: 'wrap' }}>
              <button className="row" style={{ gap: 12, flex: '1 1 220px', minWidth: 0, border: 0, background: 'none', padding: 0, textAlign: 'left' }} onClick={() => role !== 'student' && openStudent(s.id)}>
                <Avatar name={s.name} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div className="row-title">{role === 'student' ? T(e.type + '_exam') : s.name}</div>
                  <div className="row-sub">{role === 'student' ? fmtDay(e.date, lang) : `${T(e.type + '_exam')} · ${fmtDay(e.date, lang)} · ${T('readiness')} ${s.readiness}%`}</div>
                </div>
              </button>
              {e.status === 'scheduled' && staff && (past || d <= 0) ? (
                <div className="row" style={{ gap: 6 }}>
                  <Button size="sm" variant="success" icon="check" onClick={() => updateExam(e.id, { status: 'passed' })}>{T('passed')}</Button>
                  <Button size="sm" variant="danger-soft" icon="x" onClick={() => updateExam(e.id, { status: 'failed' })}>{T('failed')}</Button>
                </div>
              ) : e.status === 'scheduled' ? (
                <Badge tone={d <= 3 ? 'amber' : 'brand'}>{d === 0 ? T('today') : d === 1 ? T('tomorrow') : T('days_left', { n: d })}</Badge>
              ) : <Badge tone={examTone(e.status)} dot>{T(e.status)}</Badge>}
              {staff && <Button size="sm" variant="ghost" icon="edit" title={T('edit')} onClick={() => openModal({ type: 'exam', editId: e.id })} />}
            </div>
          );
        }) : <Empty icon="exams" title={T('no_exams')} />}
      </Card>
    </div>
  );
}
