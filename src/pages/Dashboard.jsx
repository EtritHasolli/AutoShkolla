import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Stat, Badge, Avatar, Button, LinkButton, Empty, Icon, ToneIcon, PageHeader, lessonTone } from '../components/ui.jsx';
import { euro, hh, fmtLong, fmtDay, sameMonth, addDays, greetingKey, whatsappLink, daysUntil } from '../lib/format.js';
import { vehicleAlerts, alertText } from '../lib/alerts.js';
import { BRAND } from '../lib/brand.js';

export default function Dashboard() {
  const { lessons, data, today, T, lang, role, me, user, school, go, openModal, openStudent } = useApp();
  const todays = lessons.filter(l => l.date === today && l.status !== 'cancelled').sort((a, b) => a.hour - b.hour);
  const done = todays.filter(l => l.status === 'completed').length;

  const monthRev = data.payments.filter(p => sameMonth(p.date, today)).reduce((a, p) => a + p.amount, 0);
  const lastMonthRef = addDays(today.slice(0, 8) + '01', -1);
  const lastRev = data.payments.filter(p => sameMonth(p.date, lastMonthRef)).reduce((a, p) => a + p.amount, 0);
  const owing = data.students.filter(s => s.due > 0).sort((a, b) => b.due - a.due);
  const outstanding = owing.reduce((a, s) => a + s.due, 0);
  const active = data.students.filter(s => s.remaining > 0 || s.practical !== 'passed');
  const ready = data.students.filter(s => s.readiness >= 70 && s.practical !== 'passed').length;
  const alerts = vehicleAlerts(data.vehicles).slice(0, 5);
  const upcoming = data.exams.filter(e => e.status === 'scheduled' && e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const monthDone = {};
  lessons.forEach(l => { if (l.status === 'completed' && sameMonth(l.date, today)) monthDone[l.instructorId] = (monthDone[l.instructorId] || 0) + 1; });
  const topId = Object.entries(monthDone).sort((a, b) => b[1] - a[1])[0]?.[0];
  const top = data.instructors.find(i => i.id === topId);

  const first = (me?.name || user?.name || '').split(' ')[0];
  const sName = (id) => data.students.find(s => s.id === id)?.name || '—';
  const link = (label, r) => <button className="btn btn-ghost btn-sm" onClick={() => go(r)}>{label}<Icon name="chevR" size={15} /></button>;

  return (
    <div className="page">
      <PageHeader
        title={`${T(greetingKey())}${first ? ', ' + first : ''}`}
        sub={fmtLong(today, lang) + ' · ' + T('today_summary', { n: todays.length, d: done })}
        actions={<div className="hide-mobile row" style={{ gap: 8 }}>
          <Button icon="students" onClick={() => openModal({ type: 'student' })}>{T('add_student')}</Button>
          <Button icon="euro" onClick={() => openModal({ type: 'payment' })}>{T('record_payment')}</Button>
        </div>}
      />

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Stat label={T('kpi_lessons_today')} value={todays.length} sub={T('kpi_n_done', { n: done })} icon="calendar" tone="brand" />
        <Stat label={T('kpi_revenue_month')} value={euro(monthRev)} sub={T('kpi_vs_last', { v: euro(lastRev) })} icon="euro" tone="green" />
        <Stat label={T('kpi_outstanding')} value={euro(outstanding)} sub={T('kpi_n_students', { n: owing.length })} icon="alert" tone="red" />
        <Stat label={T('kpi_active_students')} value={active.length} sub={T('kpi_ready', { n: ready })} icon="students" tone="violet" />
      </div>

      <div className="grid-main">
        <div className="stack">
          <Card flush title={T('todays_schedule')} sub={fmtDay(today, lang)} extra={link(T('calendar'), 'calendar')}>
            {todays.length ? todays.map(l => {
              const s = data.students.find(x => x.id === l.studentId);
              const i = data.instructors.find(x => x.id === l.instructorId);
              const v = data.vehicles.find(x => x.id === l.vehicleId);
              return (
                <button key={l.id} className="row-item" onClick={() => openModal({ type: 'lessonView', id: l.id })}>
                  <div className="mono" style={{ width: 46, fontWeight: 600, fontSize: 13.5, color: 'var(--ink-2)' }}>{hh(l.hour)}</div>
                  <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: i?.color || 'var(--line)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-title">{s?.name || '—'}</div>
                    <div className="row-sub">{(i?.name || T('unassigned')) + ' · ' + (v ? v.name : T('no_vehicle'))}</div>
                  </div>
                  <Badge tone={lessonTone(l.status)} dot>{T(l.status)}</Badge>
                </button>
              );
            }) : (
              <Empty icon="calendar" title={T('no_lessons_today')} text={T('no_lessons_today_text')}
                action={<Button variant="primary" icon="plus" onClick={() => openModal({ type: 'lesson' })}>{T('schedule_lesson')}</Button>} />
            )}
          </Card>

          <Card flush title={T('debts')} sub={owing.length ? euro(outstanding) : null} extra={link(T('payments'), 'payments')}>
            {owing.length ? owing.slice(0, 6).map(s => (
              <div key={s.id} className="row-item clickable" style={{ cursor: 'pointer' }} onClick={() => openStudent(s.id, 'payments')}>
                <Avatar name={s.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{s.name}</div>
                  <div className="row-sub">{T('lessons_used', { u: s.used, t: s.total })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tnum" style={{ fontWeight: 700, color: 'var(--red)' }}>{euro(s.due)}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{T(s.payment)}</div>
                </div>
                {s.phone && (
                  <LinkButton size="sm" variant="whatsapp" icon="whatsapp" href={whatsappLink(s.phone, T('reminder_payment_text', { name: s.name.split(' ')[0], amount: euro(s.due), school: school?.name || BRAND }))}
                    onClick={e => e.stopPropagation()} title={T('send_reminder')} />
                )}
              </div>
            )) : <Empty icon="checkCircle" title={T('no_debts')} />}
          </Card>
        </div>

        <div className="stack">
          <Card flush title={T('alerts')} extra={alerts.length ? <Badge tone="amber">{alerts.length}</Badge> : null}>
            {alerts.length ? alerts.map(a => {
              const tx = alertText(a, T);
              return (
                <button key={a.key} className="row-item" onClick={() => openModal({ type: 'vehicle', editId: a.vehicle.id })} disabled={role === 'receptionist'}>
                  <ToneIcon name={a.kind === 'maint' || a.kind === 'service' ? 'wrench' : a.kind === 'ins' ? 'shield' : 'doc'} tone={a.tone} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-title">{tx.title}</div>
                    <div className="row-sub" style={{ color: a.tone === 'red' ? 'var(--red)' : undefined }}>{tx.sub}</div>
                  </div>
                </button>
              );
            }) : <Empty icon="checkCircle" title={T('no_alerts')} />}
          </Card>

          <Card flush title={T('upcoming_exams')} extra={link(T('exams'), 'exams')}>
            {upcoming.length ? upcoming.map(e => {
              const d = daysUntil(e.date);
              return (
                <button key={e.id} className="row-item" onClick={() => openStudent(e.studentId)}>
                  <ToneIcon name={e.type === 'theory' ? 'courses' : 'car'} tone={e.type === 'theory' ? 'violet' : 'teal'} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-title">{sName(e.studentId)}</div>
                    <div className="row-sub">{T(e.type + '_exam')} · {fmtDay(e.date, lang)}</div>
                  </div>
                  <Badge tone={d <= 3 ? 'amber' : 'gray'}>{d === 0 ? T('today') : d === 1 ? T('tomorrow') : T('days_left', { n: d })}</Badge>
                </button>
              );
            }) : <Empty icon="exams" title={T('no_upcoming_exams')} />}
          </Card>

          {role === 'owner' && top && (
            <Card>
              <div className="row" style={{ gap: 12 }}>
                <Avatar name={top.name} color={top.color} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{T('top_instructor')}</div>
                  <div className="truncate" style={{ fontWeight: 700, fontSize: 15.5 }}>{top.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 22 }} className="tnum">{monthDone[top.id]}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{T('lessons_completed')}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
