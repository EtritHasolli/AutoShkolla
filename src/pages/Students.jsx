import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Badge, Avatar, Button, LinkButton, Empty, Icon, Input, Segmented, Progress, Ring, Textarea, KV, PageHeader, lessonTone, payTone, examTone } from '../components/ui.jsx';
import { euro, hh, fmtDay, fmtDate, telLink, whatsappLink } from '../lib/format.js';
import { lessonsText } from '../lib/derive.js';
import { useIsMobile } from '../hooks/useMediaQuery.js';
import { isStaff } from '../lib/nav.js';
import { SKILLS } from '../data/seed.js';
import { BRAND } from '../lib/brand.js';

/* ------------------------------------------------------------------ list */
function StudentList() {
  const { data, role, me, T, payFilter, setPayFilter, openStudent, openModal } = useApp();
  const mobile = useIsMobile(860);
  const [q, setQ] = useState('');
  const staff = isStaff(role);
  let list = role === 'instructor' ? data.students.filter(s => s.instructorId === me.id) : data.students;
  const total = list.length;
  const qq = q.trim().toLowerCase();
  if (qq) list = list.filter(s => s.name.toLowerCase().includes(qq) || (s.phone || '').replace(/\s/g, '').includes(qq.replace(/\s/g, '')));
  if (payFilter !== 'all') list = list.filter(s => s.payment === payFilter);
  list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  const iName = (id) => data.instructors.find(i => i.id === id);

  return (
    <div className="page">
      <PageHeader title={role === 'instructor' ? T('my_students') : T('students')} sub={T('kpi_n_students', { n: total })}
        actions={staff && <Button variant="primary" icon="plus" onClick={() => openModal({ type: 'student' })}>{T('add_student')}</Button>} />
      <div className="toolbar">
        <div style={{ flex: '1 1 240px', maxWidth: 380 }}><Input icon="search" value={q} onChange={e => setQ(e.target.value)} placeholder={T('search_students')} /></div>
        {staff && <div style={{ overflowX: 'auto', maxWidth: '100%' }}><Segmented value={payFilter} onChange={setPayFilter} options={[{ v: 'all', l: T('all') }, { v: 'unpaid', l: T('unpaid') }, { v: 'partial', l: T('partial') }, { v: 'paid', l: T('paid') }]} /></div>}
      </div>

      {!total ? (
        <Card><Empty icon="students" title={T('no_students')} text={staff ? T('no_students_text') : null}
          action={staff && <Button variant="primary" icon="plus" onClick={() => openModal({ type: 'student' })}>{T('add_student')}</Button>} /></Card>
      ) : !list.length ? (
        <Card><Empty icon="search" title={T('no_match')} /></Card>
      ) : mobile ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          {list.map(s => {
            const i = iName(s.instructorId);
            return (
              <button key={s.id} className="row-item" onClick={() => openStudent(s.id)}>
                <Avatar name={s.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-title">{s.name}</div>
                  <div className="row-sub">{lessonsText(T, s)}{i && role !== 'instructor' ? ' · ' + i.name.split(' ')[0] : ''}</div>
                </div>
                {staff ? <Badge tone={payTone(s.payment)}>{s.due > 0 ? euro(s.due) : T('paid')}</Badge> : <span className="mono muted" style={{ fontWeight: 600 }}>{s.readiness}%</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead><tr>
                <th>{T('student')}</th>{role !== 'instructor' && <th>{T('instructor')}</th>}<th>{T('package')}</th><th>{T('readiness')}</th>{staff && <th>{T('balance')}</th>}<th />
              </tr></thead>
              <tbody>
                {list.map(s => {
                  const i = iName(s.instructorId);
                  return (
                    <tr key={s.id} className="clickable" onClick={() => openStudent(s.id)}>
                      <td><div className="row" style={{ gap: 11 }}><Avatar name={s.name} size={36} /><div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div><div className="muted" style={{ fontSize: 12.5 }}>{s.phone || '—'}</div></div></div></td>
                      {role !== 'instructor' && <td><div className="row" style={{ gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: i?.color || 'var(--line)' }} />{i?.name || <span className="soft">{T('unassigned')}</span>}</div></td>}
                      <td style={{ minWidth: 150 }}>
                        <div className="row muted" style={{ justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 5 }}><span>{s.used}/{s.total}</span><span>{T('remaining_n', { n: s.remaining })}</span></div>
                        <Progress value={s.used} max={s.total} />
                      </td>
                      <td><span className="mono" style={{ fontWeight: 650, color: s.readiness >= 70 ? 'var(--green)' : s.readiness >= 45 ? 'var(--amber)' : 'var(--ink-2)' }}>{s.readiness}%</span></td>
                      {staff && <td><Badge tone={payTone(s.payment)} dot>{s.due > 0 ? euro(s.due) : T('paid')}</Badge></td>}
                      <td style={{ width: 30 }}><Icon name="chevR" size={16} style={{ color: 'var(--soft)' }} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- profile tabs */
function SkillScores({ s, editable }) {
  const { T, updateStudentFields } = useApp();
  const set = (k, n) => updateStudentFields(s.id, { progress: { ...s.progress, [k]: n } });
  const avg = (SKILLS.reduce((a, k) => a + s.progress[k], 0) / SKILLS.length).toFixed(1);
  return (
    <div className="grid-main">
      <Card title={T('skills')} sub={editable ? T('skills_hint') : null}>
        <div className="stack" style={{ gap: 16 }}>
          {SKILLS.map(k => {
            const v = s.progress[k];
            const col = v >= 4 ? 'var(--green)' : v >= 3 ? 'var(--brand)' : 'var(--amber)';
            return (
              <div key={k}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontWeight: 600 }}>{T('skill_' + k)}</span>
                  <span className="mono muted" style={{ fontWeight: 600 }}>{v}/5</span>
                </div>
                <div className="row" style={{ gap: 5 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} disabled={!editable} onClick={() => set(k, n)} aria-label={k + ' ' + n}
                      style={{ flex: 1, height: editable ? 14 : 8, borderRadius: 5, border: 0, padding: 0, background: n <= v ? col : 'var(--line-2)', cursor: editable ? 'pointer' : 'default' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="stack">
        <Card title={T('readiness')}>
          <div style={{ textAlign: 'center' }}>
            <Ring pct={s.readiness} size={120} stroke={11} color={s.readiness >= 70 ? 'var(--green)' : 'var(--amber)'}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.readiness}%</div>
            </Ring>
            <div style={{ marginTop: 10 }}><Badge tone={s.readiness >= 70 ? 'green' : 'amber'}>{s.readiness >= 70 ? T('exam_ready') : T('needs_practice')}</Badge></div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{T('avg_skill', { v: avg })} · {lessonsText(T, s)}</div>
          </div>
        </Card>
        <Card title={T('weakest_areas')}>
          {SKILLS.map(k => [k, s.progress[k]]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([k, v]) => (
            <div key={k} className="row" style={{ justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{T('skill_' + k)}</span><span className="mono" style={{ fontWeight: 700, color: v <= 2 ? 'var(--red)' : 'var(--amber)' }}>{v}/5</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function PaymentsTab({ s }) {
  const { data, T, lang, school, openModal } = useApp();
  const hist = data.payments.filter(p => p.studentId === s.id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="stack">
      <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
        <div className="stat"><div className="stat-label">{T('price')}</div><div className="stat-value">{euro(s.price)}</div></div>
        <div className="stat"><div className="stat-label">{T('paid_amount')}</div><div className="stat-value" style={{ color: 'var(--green)' }}>{euro(s.paid)}</div></div>
        <div className="stat"><div className="stat-label">{T('due_amount')}</div><div className="stat-value" style={{ color: s.due > 0 ? 'var(--red)' : 'var(--green)' }}>{euro(s.due)}</div></div>
      </div>
      <Card flush title={T('payment_history')} extra={
        <div className="row" style={{ gap: 6 }}>
          {s.due > 0 && s.phone && <LinkButton size="sm" variant="whatsapp" icon="whatsapp" href={whatsappLink(s.phone, T('reminder_payment_text', { name: s.name.split(' ')[0], amount: euro(s.due), school: school?.name || BRAND }))}>{T('send_reminder')}</LinkButton>}
          <Button size="sm" variant="primary" icon="plus" onClick={() => openModal({ type: 'payment', studentId: s.id })}>{T('record_payment')}</Button>
        </div>}>
        {hist.length ? hist.map(p => (
          <div key={p.id} className="row-item">
            <span className="ic-tile tone-green"><Icon name="euro" size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row-title tnum">{euro(p.amount)} · <span style={{ fontWeight: 500 }}>{T(p.method)}</span></div>
              <div className="row-sub">{fmtDate(p.date, lang)}{p.note ? ' · ' + p.note : ''}</div>
            </div>
            <Button size="sm" variant="ghost" icon="receipt" title={T('receipt')} onClick={() => openModal({ type: 'receipt', payment: p })} />
            <Button size="sm" variant="ghost" icon="trash" title={T('delete')} onClick={() => openModal({ type: 'confirm', kind: 'payment', id: p.id, name: euro(p.amount) + ' · ' + fmtDate(p.date, lang) })} />
          </div>
        )) : <Empty icon="payments" title={T('no_payments')} />}
      </Card>
    </div>
  );
}

function LessonsTab({ s }) {
  const { lessons, data, T, lang, today, openModal } = useApp();
  const ls = lessons.filter(l => l.studentId === s.id).sort((a, b) => (b.date + String(b.hour).padStart(2, '0')).localeCompare(a.date + String(a.hour).padStart(2, '0')));
  const up = ls.filter(l => l.date >= today && l.status === 'scheduled').reverse();
  const past = ls.filter(l => !(l.date >= today && l.status === 'scheduled'));
  const Row = ({ l }) => {
    const i = data.instructors.find(x => x.id === l.instructorId);
    const v = data.vehicles.find(x => x.id === l.vehicleId);
    return (
      <button className="row-item" onClick={() => openModal({ type: 'lessonView', id: l.id })}>
        <div style={{ width: 96 }}><div style={{ fontWeight: 650, fontSize: 13 }}>{fmtDay(l.date, lang)}</div><div className="mono muted" style={{ fontSize: 12 }}>{hh(l.hour)}</div></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row-title">{i?.name || T('unassigned')}</div>
          <div className="row-sub">{(v ? v.name + ' · ' : '') + T(l.type === 'highway' ? 'highway' : 'city_drive')}</div>
        </div>
        <Badge tone={lessonTone(l.status)} dot>{T(l.status)}</Badge>
      </button>
    );
  };
  return (
    <div className="stack">
      <Card flush title={T('upcoming')} extra={<Badge>{up.length}</Badge>}>{up.length ? up.map(l => <Row key={l.id} l={l} />) : <Empty icon="calendar" title={T('no_lessons_yet')} />}</Card>
      {past.length > 0 && <Card flush title={T('lesson_history')} extra={<Badge>{past.length}</Badge>}>{past.map(l => <Row key={l.id} l={l} />)}</Card>}
    </div>
  );
}

function NotesCard({ s, editable }) {
  const { T, updateStudentFields } = useApp();
  const [txt, setTxt] = useState(s.notes || '');
  useEffect(() => setTxt(s.notes || ''), [s.id, s.notes]);
  const dirty = txt !== (s.notes || '');
  return (
    <Card title={T('notes')} extra={editable && dirty && <Button size="sm" variant="primary" icon="check" onClick={() => updateStudentFields(s.id, { notes: txt }, 'saved')}>{T('save')}</Button>}>
      {editable ? <Textarea rows={4} value={txt} onChange={e => setTxt(e.target.value)} placeholder={T('notes_ph')} />
        : <p style={{ color: s.notes ? 'var(--ink-2)' : 'var(--soft)', lineHeight: 1.6 }}>{s.notes || '—'}</p>}
    </Card>
  );
}

function Overview({ s, staff, canEdit }) {
  const { data, T, lang, openModal } = useApp();
  const i = data.instructors.find(x => x.id === s.instructorId);
  const v = i ? data.vehicles.find(x => x.id === i.vehicle) : null;
  const exams = data.exams.filter(e => e.studentId === s.id).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="grid-main">
      <div className="stack">
        <Card title={T('package')} sub={s.packageName || null}>
          <div className="row" style={{ gap: 20 }}>
            <Ring pct={s.total ? s.used / s.total * 100 : 0} size={100}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{s.extra ? '+' + s.extra : s.remaining}</div>
              <div className="muted" style={{ fontSize: 11, fontWeight: 600 }}>{T(s.extra ? 'extra_lessons' : 'remaining')}</div>
            </Ring>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 750 }}>{lessonsText(T, s)}</div>
              <div style={{ margin: '10px 0' }}><Progress value={s.used} max={s.total} h={8} /></div>
              <div className="muted" style={{ fontSize: 13 }}>{T('readiness')}: <b style={{ color: s.readiness >= 70 ? 'var(--green)' : 'var(--amber)' }}>{s.readiness}%</b></div>
            </div>
          </div>
        </Card>
        <NotesCard s={s} editable={canEdit} />
      </div>
      <div className="stack">
        <Card title={T('details')}>
          <KV label={T('instructor')} value={i?.name || T('unassigned')} />
          <KV label={T('vehicle')} value={v ? v.name : '—'} />
          <KV label={T('category')} value={s.cat} />
          <KV label={T('joined')} value={fmtDate(s.joined, lang)} />
          {staff && <KV label={T('balance')} value={s.due > 0 ? euro(s.due) : T('paid')} valueStyle={{ color: s.due > 0 ? 'var(--red)' : 'var(--green)' }} />}
        </Card>
        <Card flush title={T('exam_status')} extra={staff && <Button size="sm" variant="soft" icon="plus" onClick={() => openModal({ type: 'exam', studentId: s.id })}>{T('schedule_exam')}</Button>}>
          {[['theory', s.theory], ['practical', s.practical]].map(([k, st]) => (
            <div key={k} className="row-item"><span style={{ flex: 1, fontWeight: 600 }}>{T(k + '_exam')}</span><Badge tone={examTone(st)} dot>{T(st)}</Badge></div>
          ))}
          {exams.map(e => (
            <button key={e.id} className="row-item" disabled={!staff} onClick={() => openModal({ type: 'exam', editId: e.id })}>
              <span className="muted" style={{ flex: 1, fontSize: 13 }}>{T(e.type + '_exam')} · {fmtDate(e.date, lang)}</span>
              <Badge tone={examTone(e.status)}>{T(e.status)}</Badge>
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

function StudentProfile() {
  const { data, selStudent, role, me, T, studentTab, setStudentTab, openModal, closeStudent } = useApp();
  const s = data.students.find(x => x.id === selStudent);
  if (!s) return <div className="page"><Card><Empty icon="students" title={T('no_match')} action={<Button onClick={closeStudent}>{T('back')}</Button>} /></Card></div>;
  const staff = isStaff(role);
  const canEdit = staff || (role === 'instructor' && s.instructorId === me.id);
  const tabs = [['overview', T('overview')], ['progress', T('progress')], ...(staff ? [['payments', T('payments')]] : []), ['lessons', T('lessons')]];
  const tab = tabs.some(t => t[0] === studentTab) ? studentTab : 'overview';

  return (
    <div className="page">
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
          <Avatar name={s.name} size={60} />
          <div style={{ flex: '1 1 220px', minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800 }} className="truncate">{s.name}</h1>
            <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <Badge tone="brand">{T('category')} {s.cat}</Badge>
              {staff && <Badge tone={payTone(s.payment)} dot>{T(s.payment)}</Badge>}
              {s.readiness >= 70 && <Badge tone="green">{T('exam_ready')}</Badge>}
              {s.phone && <span className="muted" style={{ fontSize: 13 }}>{s.phone}</span>}
            </div>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {s.phone && <LinkButton href={telLink(s.phone)} icon="phone" title={T('call')} />}
            {s.phone && <LinkButton href={whatsappLink(s.phone)} icon="whatsapp" variant="whatsapp" title="WhatsApp" />}
            {staff && <Button icon="edit" onClick={() => openModal({ type: 'student', editId: s.id })}>{T('edit')}</Button>}
            {staff && <Button icon="euro" onClick={() => openModal({ type: 'payment', studentId: s.id })} className="hide-mobile">{T('record_payment')}</Button>}
            {canEdit && <Button variant="primary" icon="plus" onClick={() => openModal({ type: 'lesson', studentId: s.id })}>{T('schedule_lesson')}</Button>}
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setStudentTab(k)}>{l}</button>)}
      </div>

      {tab === 'overview' && <Overview s={s} staff={staff} canEdit={canEdit} />}
      {tab === 'progress' && <SkillScores s={s} editable={canEdit} />}
      {tab === 'payments' && staff && <PaymentsTab s={s} />}
      {tab === 'lessons' && <LessonsTab s={s} />}
    </div>
  );
}

export default function Students() {
  const { selStudent } = useApp();
  return selStudent ? <StudentProfile /> : <StudentList />;
}
