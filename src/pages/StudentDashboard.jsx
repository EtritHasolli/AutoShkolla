import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Badge, Avatar, Button, LinkButton, Empty, Icon, Progress, Ring, examTone } from '../components/ui.jsx';
import { hh, fmtLong, fmtDay, euro, greetingKey, telLink, whatsappLink, daysUntil } from '../lib/format.js';
import { lessonsText } from '../lib/derive.js';
import { NotLinked } from './InstructorDashboard.jsx';
import { SKILLS } from '../data/seed.js';

export default function StudentDashboard() {
  const { me, data, lessons, today, T, lang, openModal, go } = useApp();
  if (me.missing) return <NotLinked />;
  const s = me;
  const i = data.instructors.find(x => x.id === s.instructorId);
  const upcoming = lessons.filter(l => l.studentId === s.id && l.status === 'scheduled' && l.date >= today).sort((a, b) => (a.date + String(a.hour).padStart(2, '0')).localeCompare(b.date + String(b.hour).padStart(2, '0')));
  const next = upcoming[0];
  const nextV = next && data.vehicles.find(v => v.id === next.vehicleId);
  const nextExam = data.exams.filter(e => e.studentId === s.id && e.status === 'scheduled' && e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const usedPct = s.total ? Math.round(s.used / s.total * 100) : 0;
  const weakest = SKILLS.map(k => [k, s.progress[k]]).sort((a, b) => a[1] - b[1]).slice(0, 2);

  return (
    <div className="page">
      <div style={{ marginBottom: 18 }}>
        <div className="muted" style={{ fontWeight: 600 }}>{T(greetingKey())},</div>
        <h1 className="page-title">{s.name.split(' ')[0]}</h1>
      </div>

      {next ? (
        <div style={{ borderRadius: 20, padding: 20, color: '#fff', background: 'linear-gradient(150deg, #2f63f5 0%, #1c47c7 100%)', marginBottom: 16, boxShadow: '0 20px 40px -22px rgba(36,86,230,.8)' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .8 }}>{T('next_lesson')}</span>
            <span className="mono" style={{ background: 'rgba(255,255,255,.18)', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>{hh(next.hour)}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.03em', marginTop: 10 }}>{fmtLong(next.date, lang)}</div>
          <div className="row" style={{ gap: 16, marginTop: 8, opacity: .9, fontSize: 13.5, flexWrap: 'wrap' }}>
            {i && <span className="row" style={{ gap: 6 }}><Icon name="user" size={16} />{i.name}</span>}
            {nextV && <span className="row" style={{ gap: 6 }}><Icon name="car" size={16} />{nextV.name} · {nextV.plate}</span>}
            {next.pickup && <span className="row" style={{ gap: 6 }}><Icon name="pin" size={16} />{next.pickup}</span>}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 16 }}>
            {i?.phone && <LinkButton href={telLink(i.phone)} icon="phone" className="btn-white" style={{ flex: 1 }}>{T('call')}</LinkButton>}
            <Button className="btn-white" icon="info" style={{ flex: 1 }} onClick={() => openModal({ type: 'lessonView', id: next.id })}>{T('details')}</Button>
          </div>
        </div>
      ) : (
        <Card style={{ marginBottom: 16 }}><Empty icon="calendar" title={T('no_lessons_yet')} text={T('no_lessons_student')} /></Card>
      )}

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Card title={T('package')} sub={s.packageName || null}>
          <div className="row" style={{ gap: 18 }}>
            <Ring pct={usedPct} size={100}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{s.extra ? '+' + s.extra : s.remaining}</div>
              <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{T(s.extra ? 'extra_lessons' : 'remaining')}</div>
            </Ring>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 750 }}>{lessonsText(T, s)}</div>
              <div style={{ marginTop: 10 }}><Progress value={s.used} max={s.total} h={8} /></div>
            </div>
          </div>
        </Card>

        <Card title={T('readiness')} extra={<Badge tone={s.readiness >= 70 ? 'green' : 'amber'}>{s.readiness >= 70 ? T('exam_ready') : T('needs_practice')}</Badge>}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-.03em', color: s.readiness >= 70 ? 'var(--green)' : 'var(--amber)' }}>{s.readiness}%</div>
          <div style={{ margin: '6px 0 12px' }}><Progress value={s.readiness} color={s.readiness >= 70 ? 'var(--green)' : 'var(--amber)'} h={8} /></div>
          <div className="muted" style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{T('weakest_areas')}</div>
          {weakest.map(([k, val]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', fontSize: 13.5, padding: '3px 0' }}>
              <span>{T('skill_' + k)}</span><span className="mono" style={{ fontWeight: 700, color: val <= 2 ? 'var(--red)' : 'var(--amber)' }}>{val}/5</span>
            </div>
          ))}
          <Button variant="soft" block icon="courses" style={{ marginTop: 12 }} onClick={() => go('courses')}>{T('courses')}</Button>
        </Card>

        <Card title={T('payments')} extra={<button className="btn btn-ghost btn-sm" onClick={() => go('payments')}>{T('view_all')}<Icon name="chevR" size={15} /></button>}>
          <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{T('balance_after')}</div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.03em', color: s.due > 0 ? 'var(--red)' : 'var(--green)' }} className="tnum">{euro(s.due)}</div>
          <div className="row" style={{ gap: 24, marginTop: 10 }}>
            <div><div className="muted" style={{ fontSize: 12 }}>{T('price')}</div><div style={{ fontWeight: 700 }}>{euro(s.price)}</div></div>
            <div><div className="muted" style={{ fontSize: 12 }}>{T('paid_amount')}</div><div style={{ fontWeight: 700, color: 'var(--green)' }}>{euro(s.paid)}</div></div>
          </div>
        </Card>

        <Card title={T('exams')}>
          {nextExam && (
            <div className="badge tone-brand" style={{ display: 'flex', borderRadius: 10, padding: '9px 12px', marginBottom: 12, whiteSpace: 'normal' }}>
              <Icon name="calendar" size={16} />{T(nextExam.type + '_exam')} · {fmtDay(nextExam.date, lang)} ({T('days_left', { n: daysUntil(nextExam.date) })})
            </div>
          )}
          {[['theory', s.theory], ['practical', s.practical]].map(([k, st]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-2)' }}>
              <span style={{ fontWeight: 600 }}>{T(k + '_exam')}</span>
              <Badge tone={examTone(st)} dot>{T(st)}</Badge>
            </div>
          ))}
        </Card>
      </div>

      {i && (
        <Card>
          <div className="row" style={{ gap: 12 }}>
            <Avatar name={i.name} color={i.color} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{T('instructor')}</div>
              <div className="truncate" style={{ fontWeight: 700, fontSize: 15.5 }}>{i.name}</div>
            </div>
            {i.phone && <LinkButton href={telLink(i.phone)} icon="phone" />}
            {i.phone && <LinkButton href={whatsappLink(i.phone)} icon="whatsapp" variant="whatsapp" />}
          </div>
        </Card>
      )}
    </div>
  );
}
