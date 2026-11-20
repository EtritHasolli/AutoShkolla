import React from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Stat, Badge, Avatar, Button, LinkButton, Empty, Icon, Progress, lessonTone } from '../components/ui.jsx';
import { hh, fmtLong, fmtDay, addDays, greetingKey, telLink, whatsappLink } from '../lib/format.js';
import { BRAND } from '../lib/brand.js';

export function NotLinked() {
  const { T } = useApp();
  return <div className="page"><Card><Empty icon="user" title={T('not_linked')} /></Card></div>;
}

function NextLessonCard({ lesson }) {
  const { data, T, lang, today, school, openModal, setLessonStatus } = useApp();
  const s = data.students.find(x => x.id === lesson.studentId);
  const v = data.vehicles.find(x => x.id === lesson.vehicleId);
  const nowH = new Date().getHours();
  const started = lesson.date < today || (lesson.date === today && lesson.hour <= nowH);
  const when = lesson.date === today ? T('today').toLowerCase() : T('tomorrow').toLowerCase();
  return (
    <div style={{ borderRadius: 20, padding: 20, color: '#fff', background: 'linear-gradient(150deg, #2f63f5 0%, #1c47c7 100%)', boxShadow: '0 20px 40px -22px rgba(36,86,230,.8)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.35), transparent 70%)' }} />
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, position: 'relative' }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .8, whiteSpace: 'nowrap' }}>{T('next_lesson')}</span>
        <span className="mono" style={{ background: 'rgba(255,255,255,.18)', padding: '4px 10px', borderRadius: 8, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtDay(lesson.date, lang)} · {hh(lesson.hour)}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', marginTop: 12 }}>{s?.name}</div>
      <div className="row" style={{ gap: 16, marginTop: 8, opacity: .9, fontSize: 13.5, flexWrap: 'wrap' }}>
        <span className="row" style={{ gap: 6 }}><Icon name="car" size={16} />{v ? `${v.name} · ${v.plate}` : T('no_vehicle')}</span>
        {lesson.pickup && <span className="row" style={{ gap: 6 }}><Icon name="pin" size={16} />{lesson.pickup}</span>}
      </div>
      <div className="row" style={{ gap: 8, marginTop: 18 }}>
        {s?.phone && <LinkButton href={telLink(s.phone)} icon="phone" className="btn-white" size="lg" title={T('call')} />}
        {s?.phone && <LinkButton href={whatsappLink(s.phone, T('reminder_lesson_text', { name: s.name.split(' ')[0], when, time: hh(lesson.hour), pickup: lesson.pickup || '—', school: school?.name || BRAND }))} icon="whatsapp" className="btn-white" size="lg" title="WhatsApp" />}
        {started
          ? <Button variant="accent" size="lg" icon="check" style={{ flex: 1 }} onClick={() => setLessonStatus(lesson.id, 'completed')}>{T('mark_completed')}</Button>
          : <Button className="btn-white" size="lg" icon="info" style={{ flex: 1 }} onClick={() => openModal({ type: 'lessonView', id: lesson.id })}>{T('details')}</Button>}
      </div>
    </div>
  );
}

export default function InstructorDashboard() {
  const { me, data, lessons, today, T, lang, openModal, openStudent, setLessonStatus, go } = useApp();
  if (me.missing) return <NotLinked />;
  const mine = lessons.filter(l => l.instructorId === me.id && l.status !== 'cancelled');
  const todays = mine.filter(l => l.date === today).sort((a, b) => a.hour - b.hour);
  const tomorrow = mine.filter(l => l.date === addDays(today, 1)).sort((a, b) => a.hour - b.hour);
  const done = todays.filter(l => l.status === 'completed').length;
  const next = todays.find(l => l.status === 'scheduled') || tomorrow.find(l => l.status === 'scheduled');
  const myStudents = data.students.filter(s => s.instructorId === me.id).sort((a, b) => b.readiness - a.readiness);
  const nowH = new Date().getHours();

  const LessonRow = ({ l, compact }) => {
    const s = data.students.find(x => x.id === l.studentId);
    const due = l.status === 'scheduled' && (l.date < today || (l.date === today && l.hour <= nowH));
    return (
      <div className="row-item" style={{ cursor: 'pointer' }} onClick={() => openModal({ type: 'lessonView', id: l.id })}>
        <div className="mono" style={{ width: 46, fontWeight: 700 }}>{hh(l.hour)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-title">{s?.name}</div>
          <div className="row-sub">{l.pickup || T(l.type === 'highway' ? 'highway' : 'city_drive')}</div>
        </div>
        {!compact && l.status === 'scheduled' ? (
          <div className="row" style={{ gap: 6 }} onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="secondary" icon="x" title={T('mark_no_show')} onClick={() => setLessonStatus(l.id, 'no_show')} />
            <Button size="sm" variant={due ? 'success' : 'soft'} icon="check" onClick={() => setLessonStatus(l.id, 'completed')}>{T('mark_completed')}</Button>
          </div>
        ) : <Badge tone={lessonTone(l.status)} dot>{T(l.status)}</Badge>}
      </div>
    );
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 18 }}>
        <div className="muted" style={{ fontWeight: 600 }}>{T(greetingKey())},</div>
        <h1 className="page-title">{me.name.split(' ')[0]}</h1>
        <div className="muted" style={{ fontSize: 13.5, marginTop: 2 }}>{fmtLong(today, lang)}</div>
      </div>

      {next && <div style={{ marginBottom: 16 }}><NextLessonCard lesson={next} /></div>}

      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
        <Stat label={T('today')} value={todays.length} />
        <Stat label={T('completed')} value={done} valueColor="var(--green)" />
        <Stat label={T('students')} value={myStudents.length} />
      </div>

      <div className="grid-main">
        <div className="stack">
          <Card flush title={T('todays_schedule')} sub={fmtDay(today, lang)}>
            {todays.length ? todays.map(l => <LessonRow key={l.id} l={l} />) : <Empty icon="calendar" title={T('no_lessons_today')} />}
          </Card>
          {tomorrow.length > 0 && (
            <Card flush title={T('tomorrow')} sub={fmtDay(addDays(today, 1), lang)} extra={<button className="btn btn-ghost btn-sm" onClick={() => go('calendar')}>{T('schedule')}<Icon name="chevR" size={15} /></button>}>
              {tomorrow.map(l => <LessonRow key={l.id} l={l} compact />)}
            </Card>
          )}
        </div>
        <Card flush title={T('my_students')} extra={<button className="btn btn-ghost btn-sm" onClick={() => go('students')}>{T('view_all')}<Icon name="chevR" size={15} /></button>}>
          {myStudents.length ? myStudents.slice(0, 8).map(s => (
            <button key={s.id} className="row-item" onClick={() => openStudent(s.id)}>
              <Avatar name={s.name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row-title">{s.name}</div>
                <div className="row" style={{ gap: 8, marginTop: 5 }}>
                  <Progress value={s.readiness} color={s.readiness >= 70 ? 'var(--green)' : 'var(--amber)'} h={5} />
                  <span className="mono muted" style={{ fontSize: 12 }}>{s.readiness}%</span>
                </div>
              </div>
              <Icon name="chevR" size={16} style={{ color: 'var(--soft)' }} />
            </button>
          )) : <Empty icon="students" title={T('no_students')} />}
        </Card>
      </div>
    </div>
  );
}
