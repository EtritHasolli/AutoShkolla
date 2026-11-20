import React, { useState } from 'react';
import { useApp } from '../AppContext.jsx';
import { Card, Button, LinkButton, Empty, Avatar, ToneIcon, Badge, Segmented, PageHeader } from '../components/ui.jsx';
import { hh, euro, fmtDay, addDays, whatsappLink } from '../lib/format.js';
import { BRAND } from '../lib/brand.js';

function relTime(iso, T, lang) {
  if (!iso) return '';
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (lang === 'sq') return mins < 60 ? `${mins} min më parë` : mins < 1440 ? `${Math.round(mins / 60)} orë më parë` : `${Math.round(mins / 1440)} ditë më parë`;
  return mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins / 60)}h ago` : `${Math.round(mins / 1440)}d ago`;
}

function Reminders() {
  const { lessons, data, T, lang, today, school } = useApp();
  const [sent, setSent] = useState({});
  const sch = school?.name || BRAND;
  const tomorrow = addDays(today, 1);
  const tmr = lessons.filter(l => l.date === tomorrow && l.status === 'scheduled').sort((a, b) => a.hour - b.hour);
  const owing = data.students.filter(s => s.due > 0).sort((a, b) => b.due - a.due).slice(0, 15);
  const exams = data.exams.filter(e => e.status === 'scheduled' && e.date >= today && e.date <= addDays(today, 7)).sort((a, b) => a.date.localeCompare(b.date));
  const Row = ({ id, name, sub, phone, text }) => (
    <div className="row-item">
      <Avatar name={name} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}><div className="row-title">{name}</div><div className="row-sub">{sub}</div></div>
      {sent[id] && <Badge tone="green">{T('sent')}</Badge>}
      {phone ? <LinkButton size="sm" variant="whatsapp" icon="whatsapp" href={whatsappLink(phone, text)} onClick={() => setSent(s => ({ ...s, [id]: true }))}>{T('send_reminder')}</LinkButton>
        : <span className="soft" style={{ fontSize: 12 }}>{T('no_phone')}</span>}
    </div>
  );
  return (
    <div className="stack">
      <Card flush title={T('tomorrow_lessons')} sub={fmtDay(tomorrow, lang)} extra={<Badge>{tmr.length}</Badge>}>
        {tmr.length ? tmr.map(l => {
          const s = data.students.find(x => x.id === l.studentId);
          if (!s) return null;
          return <Row key={l.id} id={l.id} name={s.name} sub={hh(l.hour) + (l.pickup ? ' · ' + l.pickup : '')} phone={s.phone}
            text={T('reminder_lesson_text', { name: s.name.split(' ')[0], when: T('tomorrow').toLowerCase(), time: hh(l.hour), pickup: l.pickup || '—', school: sch })} />;
        }) : <Empty icon="calendar" title={T('nothing_to_remind')} />}
      </Card>
      <Card flush title={T('exam_reminders')} extra={<Badge>{exams.length}</Badge>}>
        {exams.length ? exams.map(e => {
          const s = data.students.find(x => x.id === e.studentId);
          if (!s) return null;
          return <Row key={e.id} id={e.id} name={s.name} sub={T(e.type + '_exam') + ' · ' + fmtDay(e.date, lang)} phone={s.phone}
            text={T('reminder_exam_text', { name: s.name.split(' ')[0], type: T(e.type + '_exam').toLowerCase(), when: fmtDay(e.date, lang), school: sch })} />;
        }) : <Empty icon="exams" title={T('nothing_to_remind')} />}
      </Card>
      <Card flush title={T('payment_reminders')} extra={<Badge>{owing.length}</Badge>}>
        {owing.length ? owing.map(s => <Row key={s.id} id={'p' + s.id} name={s.name} sub={euro(s.due)} phone={s.phone}
          text={T('reminder_payment_text', { name: s.name.split(' ')[0], amount: euro(s.due), school: sch })} />) : <Empty icon="checkCircle" title={T('no_debts')} />}
      </Card>
    </div>
  );
}

export default function Notifications() {
  const { notifs, markAllNotifsRead, T, lang } = useApp();
  const [tab, setTab] = useState('reminders');
  const unread = notifs.filter(n => !n.read).length;
  const ic = { reminder: ['bell', 'brand'], payment: ['euro', 'green'], cancel: ['x', 'red'], alert: ['alert', 'amber'] };
  return (
    <div className="page page-narrow" style={{ maxWidth: 860 }}>
      <PageHeader title={T('notifications')} sub={T('reminders_sub')} />
      <div className="toolbar">
        <Segmented value={tab} onChange={setTab} options={[{ v: 'reminders', l: T('reminders'), icon: 'whatsapp' }, { v: 'inbox', l: T('notifications') + (unread ? ` (${unread})` : '') }]} />
        <span className="spacer" />
        {tab === 'inbox' && unread > 0 && <Button size="sm" icon="check" onClick={markAllNotifsRead}>{T('mark_all_read')}</Button>}
      </div>
      {tab === 'reminders' ? <Reminders /> : (
        <Card flush>
          {notifs.length ? notifs.map(n => {
            const [icon, tone] = ic[n.type] || ic.reminder;
            return (
              <div key={n.id} className="row-item" style={{ alignItems: 'flex-start', opacity: n.read ? 0.7 : 1 }}>
                <ToneIcon name={icon} tone={tone} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}><span style={{ fontWeight: 650 }}>{n.title}</span>{!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)' }} />}</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 13.5, marginTop: 1 }}>{n.body}</div>
                  <div className="soft" style={{ fontSize: 12, marginTop: 3 }}>{relTime(n.createdAt, T, lang)}</div>
                </div>
              </div>
            );
          }) : <Empty icon="bell" title={T('no_notifications')} />}
        </Card>
      )}
    </div>
  );
}
